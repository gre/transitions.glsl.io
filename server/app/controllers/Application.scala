package controllers

import glslio._

import play.api._
import play.api.mvc._
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.api.libs.functional.syntax._
import play.api.libs.json._
import play.api.libs.iteratee._
import play.api.cache.Cached
import play.api.http.HeaderNames._
import play.api.Play.current
import play.api.libs.ws._
import play.api.Logger
import scala.concurrent.Future
import scala.util._

import services.github.Github.{Gist => GistWS, User => UserWS, GithubError}


import reactivemongo.api._

import play.modules.reactivemongo.MongoController
import play.modules.reactivemongo.json.collection.JSONCollection

import org.jsoup._
import collection.JavaConversions._

import eu.henkelmann.actuarius._

object Application extends Controller with GithubOAuthController {
  val rootGist = Global.rootGist

  var version = Play.current.configuration.getString("application.version").get

  // OMG I love this code
  def homeContent = Cached("homeContent", 120) {
    Action.async {
        GistWS.get("600d8a793ca7901a25f2")
        .map(json => (json \ "files" \ "article.md" \ "content").as[String])
        .map(new ActuariusTransformer().apply)
        .map(Ok(_))
    }
  }

  def logout = Action { req =>
    var redirectUrl =
      req.headers.get(REFERER)
      .filter(!_.endsWith("/logout"))
      .getOrElse("/")
    Redirect(redirectUrl).withSession()
  }

  def index (path: String) = Action.async { implicit request =>
    parseToken.map { implicit token =>
      val maybeUser = UserWS.me
      maybeUser.map { user =>
        Ok(views.html.index(version, rootGist, (user \ "login").asOpt[String]))
      }
    }.getOrElse {
      Future(Ok(views.html.index(version, rootGist, None)))
    }
  }
}

object Gist extends Controller with MongoController with GithubOAuthController {

  val rootGist = Global.rootGist
  val rootGistFileName = Play.application.configuration.getString("rootGistFilename").getOrElse("TEMPLATE")

  def collection: JSONCollection = db.collection[JSONCollection]("gists")

  def all () = Action.async {
    collection
      .find(Json.obj("id" -> Json.obj("$ne" -> rootGist), "name" -> Json.obj("$ne" -> rootGistFileName)))
      .sort(Json.obj("stars" -> -1, "updated_at" -> -1))
      .cursor[JsObject]
      .collect[Seq]()
      .map(JsArray(_))
      .map(Ok(_))
  }

  def get (id: String) = Action.async {
    collection
      .find(Json.obj("id" -> id))
      .cursor[JsObject]
      .headOption
      .map { maybeGist =>
        maybeGist.map(Ok(_)).getOrElse(NotFound)
      }
  }

  def star (id: String) = Authenticated.async { implicit auth =>
      /*
      collection
        .update(
          Json.obj("id" -> id),
          Json.obj("$set" -> Json.obj("_starred_tmp" -> true))
        )
        .map {
          _ => Ok
        }
        .recover {
          case _ => BadRequest
        }
        */
      GistWS.star(id).map {
        _ => Ok
      }
      .recover {
        case _ => BadRequest
      }
  }

  def unstar (id: String) = Authenticated.async { implicit auth =>
      /*
    collection
      .update(
        Json.obj("id" -> id),
        Json.obj("$set" -> Json.obj("_starred_tmp" -> false))
      )
      .map {
        _ => Ok
      }
      .recover {
        case _ => BadRequest
      }
      */
      GistWS.unstar(id).map {
        _ => Ok
      }
      .recover {
        case _ => BadRequest
      }
  }

  def fork () = Authenticated.async { implicit auth =>
    val forkId = rootGist
    GistWS.fork(forkId)
      .map { id =>
        Global.actorCrawler ! ("userCreatedFork", id)
        Ok(JsString(id))
      }
      .recover { case error =>
        BadRequest
      }
  }

  def save (id: String) = Authenticated.async { implicit auth =>
    collection
      .find(Json.obj("id" -> id))
      .cursor[JsObject]
      .headOption
      .flatMap { maybeOldEntry =>
        auth.body.asJson.map { json =>
          GistWS.save(json, maybeOldEntry)
          .map { result =>
            Global.actorCrawler ! ("userSave", id)
            Ok("{}")
          }
          .recover {
            case e @ GithubError(message, status) =>
              play.Logger.warn(s"github error: $e")
              Status(status)
          }
        }.getOrElse(Future(BadRequest))
      }
  }
}
