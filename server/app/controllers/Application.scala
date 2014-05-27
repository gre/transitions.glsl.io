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

  def transitionPreview (id: String) = Cached("transitionPreview_"+id, 60) {
    Action {
      Ok.stream(Enumerator.fromFile(Play.getFile("/public/images/preview.jpg")))
    }
  }

  def transitionEmbed (id: String) = Action.async { implicit request =>
    models.Transitions.get(id).map { maybeTransition =>
      maybeTransition.map { transition =>
        Ok(views.html.embed(version, transition))
      }.getOrElse(NotFound)
    }
  }
}
