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

object Application extends Controller with GithubOAuthController with MongoController {
  def rootGist = Global.rootGist

  var version = Play.current.configuration.getString("application.version").get

  import play.api.libs.json._
  import play.api.libs.json.Json._
  import play.api.libs.functional.syntax._
  import play.api.libs.json.Reads._


  val ArticleTitle = """(\d{4})-(\d{2})-(\d{2})-(.*)[.]md""".r

  val articlesGistReader = Reads { json: JsValue =>
    val transformer = new ActuariusTransformer()
    (json \ "files").asOpt[JsObject].map(files => JsSuccess(JsArray(files.fields.sortBy(_._1).reverse.flatMap { case (filename, obj) =>
      (filename, obj \ "content") match {
        case (ArticleTitle(year, month, day, title), JsString(content)) =>
          Some(Json.obj(
            "year" -> year,
            "month" -> month,
            "day" -> day,
            "title" -> title.replaceAll("_", " "),
            "content" -> transformer.apply(content)
          ))
        case _ =>
          None
      }
    }))).getOrElse(JsError("Invalid Gist JSON"))
  }

  def articles = Cached((_:RequestHeader) => "articles", 600) {
    Action.async {
        GistWS.get("4c57de495ca405bffd5a")
        .map(_.transform(articlesGistReader))
        .map(_.fold(
          err => InternalServerError,
          json => Ok(json)
        ))
    }
  }

  // FIXME, logout should be done with an AJAX in the future
  def logout = Action { req =>
    var redirectUrl = "/";
    Redirect(redirectUrl).withSession()
  }

  def app (maybeTransition: Option[JsValue])(implicit request: Request[_]) = {
    parseToken.map { implicit token =>
      val maybeUser = UserWS.me
      maybeUser.map { user =>
        val login = (user \ "login").asOpt[String]
        val session = login.map(login => request.session + ("login" -> login)).getOrElse(request.session)
        Ok(views.html.index(version, rootGist, login, maybeTransition))
          .withSession(session)
      }
    }.getOrElse {
      Future(Ok(views.html.index(version, rootGist, None, maybeTransition)))
    }
  }

  def redirectDeprecated (path: String) = Action(Redirect(path))

  def index (path: String) =
    Action.async { implicit request =>
      app(None)
    }

  def transition (id: String) =
    Action.async { implicit request =>
    models.Transitions.get(id).flatMap { maybeTransition =>
      app(maybeTransition)
    }
  }

  def transitionPreview (id: String) = controllers.Assets.at(path="/public", file = "preview.jpg")

  def transitionEmbed (id: String) = Action.async { implicit request =>
    models.Transitions.get(id).map { maybeTransition =>
      maybeTransition.map { transition =>
        Ok(views.html.embed(version, transition))
      }.getOrElse(NotFound)
    }
  }
}
