package models

import scala.concurrent._
import scala.concurrent.duration._
import play.api.Play.current
import play.api.libs.concurrent.Akka
import akka.actor._
import akka.routing._
import akka.util.Timeout
import akka.pattern.{ask, pipe}
import akka.actor.OneForOneStrategy
import akka.actor.SupervisorStrategy._

import play.api.libs.concurrent.Execution.Implicits._
import play.api.libs.functional.syntax._
import play.api.libs.json.Reads._
import play.api.libs.json._
import play.api._

import org.joda.time._

import services.github.Github.{Gist => GistWS, User => UserWS}

import reactivemongo.api._
import play.modules.reactivemongo.ReactiveMongoPlugin
import play.modules.reactivemongo.json.collection.JSONCollection

import glslio._

object Gists {
  val db = ReactiveMongoPlugin.db
  def collection: JSONCollection = db.collection[JSONCollection]("gists")

  /**
   * N.B.: a gists collection item is:
    - id: String
    - gist: String, the stringified JSON of the gist. We need to do that because of a MongoDB limitation: http://stackoverflow.com/a/12397225
   */

  val rootGist = Global.rootGist
  val system = Akka.system

  val actor = system.actorOf(
    Props(new GistsMirror(rootGist))
  )

  def clean() =
    collection.drop().map { _ =>
      Logger.info("Gists Caches collection dropped.");
    }.recover { case _ =>
      Logger.warn("Can't drop Gists Caches collection.");
    }

  implicit val timeout = Timeout(10.second)

  def onForkCreated (id: String, parentId: String) = {
    actor.ask(OnForkCreated(id, parentId)).mapTo[JsValue]
  }

  def onSaved (id: String) = {
    actor.ask(OnSaved(id))
  }

  /*
  def onStarChange (id: String) = {
    actor.ask(OnStarChange(id))
  }
  */
}

case class OnStarChange(id: String)

case class OnSaved(id: String)
case class OnForkCreated (id: String, parentId: String)

class GistsMirror(rootGistId: String) extends Actor with ActorLogging {

  override val supervisorStrategy = OneForOneStrategy() {
    case _: ActorKilledException => Stop
    case _: Exception => Restart
    case _: Throwable => Escalate
  }


  val fetcher = context.actorOf(
    Props[Fetcher].withRouter(SmallestMailboxRouter(nrOfInstances = 3)),
    "fetcher"
  )
  val starsFetcher = context.actorOf(
    Props[Fetcher].withRouter(SmallestMailboxRouter(nrOfInstances = 1)),
    "stars-fetcher"
  )

  val rootGist = context.actorOf(Props(new Gist(rootGistId, null, fetcher, starsFetcher, isRoot = true)))
  var gists: Map[String, ActorRef] = Map(rootGistId -> rootGist)

  var neverRefresh = true
  
  def receive = {
    case "refresh" =>
      val firstStep = if (neverRefresh) {
        log.debug(s"Loading Gist Caches from the database.")
        neverRefresh = false

        // FIXME shouldn't this code be on each gist ?
        Gists.collection.find(Json.obj("id" -> Json.obj("$ne" -> rootGistId)))
          .cursor[JsObject]
          .collect[Seq]()
          .map { gistCaches =>
            gistCaches.map { gistCache =>
              val id = (gistCache \ "id").as[String]
              val gist = Json.parse((gistCache \ "gist").as[String])
              (id, context.actorOf(Props(new Gist(id, gist, fetcher, starsFetcher))))
            }.toMap
          }
          .map { caches: Map[String, ActorRef] =>
            log.debug(s"Caches found: ${caches.size} entries")
            gists = caches ++ gists
          }

      }
      else {
        Future()
      }

      firstStep.map { _ =>
        gists.values.foreach { _ ! "tick" }
        fetcher ! FetchGist(rootGistId)
      }

    case OnForkCreated (id, pid) =>
      val actor = context.actorOf(Props(new Gist(id, null, fetcher, starsFetcher)))
      gists = gists + (id -> actor)
      actor.ask("waitFetch")(10.second).pipeTo(sender)


    case OnStarChange(id) =>
      gists.get(id).map { gist =>
        gist.ask("waitFetchStar")(10.second).pipeTo(sender)
        gist ! "refreshStar"
      }

    case OnSaved(id) =>
      gists.get(id).map { gist =>
        gist.ask("waitFetch")(10.second).pipeTo(sender)
        gist ! "refresh"
      }

    case msg @ GistResult(gid, gist) if gid == rootGistId =>

      rootGist ! msg

      // FIXME we need to improve that:
      // for each fork, we should inform the Gist actor of the fork object
      (gist \ "forks").asOpt[Seq[JsValue]]
        .map { forksList =>
          forksList.flatMap { fork =>
            (fork \ "id").asOpt[String].map { id =>
              (id, fork)
            }
          }.toMap
        }
        .map { forks =>
          val forkIds = forks.keySet
          val gistIds = gists.keySet - rootGistId
          val newIds = forkIds diff gistIds
          val removeIds = gistIds diff forkIds
          val existingIds = forkIds intersect gistIds

          newIds.foreach { id =>
            log.debug(s"new gist: $id")
            gists = gists + (id -> context.actorOf(Props(new Gist(id, null, fetcher, starsFetcher))))
          }
          removeIds.foreach { id =>
            log.debug(s"removed gist: $id")
            gists(id) ! "kill"
            gists = gists - id
          }
          existingIds.foreach { id =>
            gists(id) ! GistForkInfo(forks(id))
          }

        }.getOrElse {
          log.error("Can't extract gist forks.")
        }

  }
}

case class GistForkInfo(info: JsValue)
case class FetchGist (id: String)
case class GistResult (id: String, gist: JsValue)
case class FetchGistStar (id: String, owner: String)
case class GistStarResult (id: String, count: Int, stargazers: Set[String])

class Fetcher extends Actor with ActorLogging {
  val timeout = 10 seconds
  def receive = {
    case FetchGist(id) =>
      Await.ready(
        // FIXME this also needs to detect deletion of gist
        GistWS.get(id)
        .map { gist =>
          log.debug(s"Github result: ${gist.metadata}")
          sender ! GistResult(id, gist.data)
        }
        .recover { case failure =>
          log.error(failure, "Github failure")
          failure.printStackTrace()
        },
        timeout
      )

    case FetchGistStar(id, owner) =>
      Await.ready(
        GistWS.getStarCount(id, owner, timeout)
        .map { stars =>
          val (count, stargazers) = stars.data
          log.info(s"Stargazers: $stargazers")
          sender ! GistStarResult(id, count, stargazers)
        }
        .recover { case failure =>
          log.error(failure, "Github failure")
        },
        timeout
      )
  }
}

class Gist (
  id: String,
  var gist: JsValue,
  fetcher: ActorRef,
  starsFetcher: ActorRef,
  isRoot: Boolean = false
) extends Actor with ActorLogging {

  val displayName = if (isRoot) "ROOT="+id else id
  log.debug(s"Gist($displayName) created ${if (gist==null) "without" else "with"} initial data.")

  if (gist == null) {
    fetcher ! FetchGist(id)
  }

  var fetchWatchers = new collection.mutable.Queue[ActorRef]()
  var fetchStarWatchers = new collection.mutable.Queue[ActorRef]()

  // FIXME: should use "become()" for being busy when fetching
  def receive = {

    case "kill" =>
      println("killing myself !!")
      Gists.collection.remove(Json.obj("id" -> id))
      GistsTransitions.onGistDeleted(id)
      self ! Kill

    case "tick" =>
      println("tick")

    case "refresh" =>
      fetcher ! FetchGist(id)

    case "refreshStar" if gist != null =>
      (gist \ "owner" \ "login").asOpt[String].map { owner =>
        starsFetcher ! FetchGistStar(id, owner)
      }.getOrElse {
        log.error(s"refreshStar: can't pick json.owner.login")
      }

    case "waitFetchStar" =>
      fetchStarWatchers.enqueue(sender)

    case "waitFetch" =>
      fetchWatchers.enqueue(sender)

    case "get" =>
      if (gist == null)
        fetchWatchers.enqueue(sender)
      else
        sender ! gist

    case GistForkInfo(info) if gist != null =>
      (gist \ "updated_at", info \ "updated_at") match {
        case (JsString(old), JsString(cur)) if old != cur =>
          log.debug(s"Gist($displayName) date has changed. $old -> $cur")
          fetcher ! FetchGist(id)
        case _ =>
      }

    case GistStarResult(_, count, stargazers) =>
      // FIXME we need to make the gist+star an unique transaction
      log.debug(s"Gist($displayName) star count received = $count")
      GistsTransitions.onGistGotStars(id, count, stargazers)
      fetchStarWatchers.foreach { watcher =>
        watcher ! gist
      }
      fetchStarWatchers.clear()

    case GistResult(_, data) =>
      // tell parent instead?
      if (gist == null) {
        self ! "refreshStar"
        GistsTransitions.onGistCreated(id, data)
      }
      else
        GistsTransitions.onGistUpdated(id, data)
      gist = data
      Gists.collection.update(Json.obj("id" -> id), Json.obj("id" -> id, "gist" -> gist.toString()), upsert = true)
        .onFailure { case e =>
          log.error(s"Failure to update the Gist Cache for ${id}", e)
        }

      log.debug(s"Gist($displayName) received.")
      fetchWatchers.foreach { watcher =>
        watcher ! gist
      }
      fetchWatchers.clear()
  }
}
