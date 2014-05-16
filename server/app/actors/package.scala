package actors

import akka.actor._
import akka.routing._

import play.api._
import play.api.Play.current

import play.api.libs.concurrent.Execution.Implicits._
import play.api.libs.functional.syntax._
import play.api.libs.json.Reads._
import play.api.libs.json._

import scala.concurrent._
import scala.concurrent.duration._
import play.api.libs.ws._

import reactivemongo.api._
import play.modules.reactivemongo.ReactiveMongoPlugin
import play.modules.reactivemongo.json.collection.JSONCollection
import services.github.Github.{Gist => GistWS, User => UserWS}


// N.B.
// The current actor model is quite simple and will be refactored.
// 

case class GistFetched (id: String, gist: JsValue)
case class GistFetchFailed (id: String, reason: Exception)

case class GetGist (id: String)
case class GistResult (id: String, gist: JsValue)

case class FetchGist (id: String, requester: ActorRef)
case class FetchGistStarCount (id: String, requester: ActorRef)
case class GistStarsResult (id: String, count: Long)


class GistActor extends Actor with ActorLogging {
  val timeout = 10 seconds

  lazy val clientId = Play.application.configuration.getString("github.client.id").get
  lazy val clientSecret = Play.application.configuration.getString("github.client.secret").get

  def receive = {
    case msg @ FetchGist(id, requester) =>
      log.debug(s"Received $msg")
      Await.ready(
        GistWS.get(id)
        .map { gist =>
          requester ! GistResult(id, gist)
        },
        timeout
      )

      /*
    case msg @ FetchGistStarCount(id, requester) =>
      log.debug(s"Received $msg")
      Await.ready(
        GistWS.getStarCount(id, timeout)
        .map { gist =>
          requester ! GistStarsResult...
        },
        timeout
      )
      */
  }
}

class TransitionsIndexer (rootGist: String) extends Actor with ActorLogging {

  val db = ReactiveMongoPlugin.db

  def gists: JSONCollection = db.collection[JSONCollection]("gists")

  val fetcher = context.actorOf(
    Props[GistActor].withRouter(SmallestMailboxRouter(nrOfInstances = 4)),
    "fetcher"
  )

  var knownForks = List[String]() // FIXME Temporary I think

  def receive = {

    case msg @ GistStarsResult(id, count) =>
      log.debug(s"Received $msg")
      gists.update(
        Json.obj("id" -> id),
        Json.obj("$set" -> Json.obj("stars" -> count))
      )

    case msg @ GistResult(id, gist) =>
      log.debug(s"Received GistResult $id")

      if (id == rootGist) {
        val forks = (gist \ "forks").as[Seq[JsValue]]
        val forkIds = forks.map { fork =>
          (fork \ "id").as[String]
        }.toList diff knownForks

        knownForks = knownForks ++ forkIds

        // FIXME TODO: only refresh if has changed using 'history'
        forkIds foreach { id =>
          fetcher ! FetchGist(id, self)
        }
        /*
        knownForks foreach { id =>
          fetcher ! FetchGistStarCount(id, self)
        }
        */
      }

      gist.validate(GistWS.gistToEntry).fold(
        err => {
          log.error(s"gist-$id: Can't validate the gist to mongo storage: $err")
          log.error(s"gist value: $gist")
        },
        mongoGist => {
          gists.update(Json.obj("id" -> id), mongoGist, upsert = true)
          /*
          .map { _ =>
            fetcher ! FetchGistStarCount(id, self) // Now we can fetch the stars :)
          }
          */
        }
      )

    case ("userCreatedFork", id: String) =>
      fetcher ! FetchGist(id, self)

    case ("userSave", id: String) =>
      fetcher ! FetchGist(id, self)

    case "refreshForks" =>
      fetcher ! FetchGist(rootGist, self)

    case "refreshStars" =>

    case "refreshPending" =>

  }

}
