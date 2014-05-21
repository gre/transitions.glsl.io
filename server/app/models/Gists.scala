package models

import scala.concurrent._
import scala.concurrent.duration._
import play.api.Play.current
import play.api.libs.concurrent.Akka
import akka.actor._
import akka.routing._
import akka.util.Timeout
import akka.pattern.{ask, pipe}

import play.api.libs.concurrent.Execution.Implicits._
import play.api.libs.functional.syntax._
import play.api.libs.json.Reads._
import play.api.libs.json._

import org.joda.time._

import services.github.Github.{Gist => GistWS, User => UserWS}

import glslio._

object Gists {

  val rootGist = Global.rootGist
  val system = Akka.system

  val actor = system.actorOf(
    Props(new GistsMirror(rootGist))
  )

  implicit val timeout = Timeout(10.second)

  def onForkCreated (id: String, parentId: String) = {
    actor.ask(OnForkCreated(id, parentId)).mapTo[JsValue]
  }

  def onSaved (id: String) = {
    actor.ask(OnSaved(id))
  }
}

case class OnSaved(id: String)
case class OnForkCreated (id: String, parentId: String)

class GistsMirror(rootGistId: String) extends Actor with ActorLogging {
  val fetcher = context.actorOf(
    Props[Fetcher].withRouter(SmallestMailboxRouter(nrOfInstances = 3)),
    "fetcher"
  )

  val rootGist = context.actorOf(Props(new Gist(rootGistId, null, fetcher)))
  var gists: Map[String, ActorRef] = Map(rootGistId -> rootGist)

  def receive = {
    case "refresh" =>
      fetcher ! FetchGist(rootGistId)

    case OnForkCreated (id, pid) =>
      val actor = context.actorOf(Props(new Gist(id, null, fetcher)))
      gists = gists + (id -> actor)
      actor.ask("waitFetch")(10.second).pipeTo(sender)

    case OnSaved(id) =>
      gists.get(id).map { gist =>
        gist.ask("waitFetch")(10.second).pipeTo(sender)
        gist ! "refresh"
      }

    case msg @ GistResult(gid, gist) if gid == rootGistId =>

      rootGist ! msg

      // FIXME we need to improve that:
      // for each fork, we should inform the Gist actor of the fork object
      (gist \ "forks").asOpt[Seq[JsValue]].map { forks =>

        forks.map { fork =>
          val id = (fork \ "id").as[String]
          if (gists.contains(id)) {
            gists(id) ! GistForkInfo(fork)
          }
          else {
            gists = gists + (id -> context.actorOf(Props(new Gist(id, null, fetcher))))
          }
        }

        // FIXME also handle deleted gists

      }.getOrElse {
        log.error("Can't extract gist forks.")
      }

  }
}

case class GistForkInfo(info: JsValue)
case class FetchGist (id: String)
case class GistResult (id: String, gist: JsValue)

class Fetcher extends Actor with ActorLogging {
  val timeout = 10 seconds
  def receive = {
    case msg @ FetchGist(id) =>
      Await.ready(
        // FIXME this also needs to detect deletion of gist
        GistWS.get(id)
        .map { gist =>
          sender ! GistResult(id, gist)
        },
        timeout
      )
  }
}

class Gist (id: String, var gist: JsValue, fetcher: ActorRef) extends Actor with ActorLogging {
  log.debug(s"Gist($id) created.")

  if (gist == null)
    fetcher ! FetchGist(id)

  var fetchWatchers = new collection.mutable.Queue[ActorRef]()

  // FIXME: should use "become()" for being busy when fetching
  def receive = {
    case "refresh" =>
      // TODO, threshold mecanism?
      fetcher ! FetchGist(id)

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
          log.debug(s"Gist($id) date has changed. $old -> $cur")
          fetcher ! FetchGist(id)
        case _ =>
      }

    case msg @ GistResult(_, data) =>
      // tell parent instead?
      if (gist == null) {
        GistsTransitions.onGistCreated(id, data)
      }
      else
        GistsTransitions.onGistUpdated(id, data)
      log.debug(s"Gist($id) received.")
      gist = data
      fetchWatchers.foreach { watcher =>
        watcher ! gist
      }
      fetchWatchers.clear()
  }
}
