package controllers


import glslio._

import play.api._
import play.api.mvc._
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.api.libs.functional.syntax._
import play.api.libs.json._
import play.api.libs.iteratee._
import play.api.Play.current
import play.api.libs.ws._
import play.api.Logger
import scala.concurrent.Future
import scala.util._

import reactivemongo.api._
import play.modules.reactivemongo.MongoController
import play.modules.reactivemongo.json.collection.JSONCollection

import models.{Transitions => TransitionsModel, GistsTransitions}
import services.github.Github.{GithubError}

object Transitions extends Controller with MongoController with GithubOAuthController {

  def forUser (user: String) = Action.async { req =>
    TransitionsModel.all(Some(user), user==req.session.get("login").getOrElse(""))
      .map(JsArray(_))
      .map(Ok(_))
  }

  def all () = Action.async { req =>
    TransitionsModel.all()
      .map(JsArray(_))
      .map(Ok(_))
  }

  def get (id: String) = Action.async {
    TransitionsModel.get(id)
      .map { maybeGist =>
        maybeGist.map(Ok(_)).getOrElse(NotFound)
      }
  }

  def fork () = Authenticated.async { implicit auth =>
    val forkId = Global.rootGist
    GistsTransitions.fork(forkId)
      .map { transition =>
        Ok(transition)
      }
      .recover { case error =>
        BadRequest
      }
  }

  def save (id: String) = Authenticated.async { implicit auth =>
    TransitionsModel.get(id)
      .flatMap { maybeOldEntry =>
        auth.body.asJson.map { json =>
          GistsTransitions.save(id, json, maybeOldEntry)
          .map { transition =>
            Ok
          }
          .recover {
            case e @ GithubError(message, status) =>
              Logger.warn(s"github error: $e")
              Status(status)
          }
        }.getOrElse(Future(BadRequest))
      }
  }

  def star (id: String) = Authenticated.async { implicit auth =>
    GistsTransitions.star(id)
    .map(_ => Ok)
    .recover {
      case e @ GithubError(message, status) =>
        Logger.warn(s"github error: $e")
        Status(status)
    }
  }

  def unstar (id: String) = Authenticated.async { implicit auth =>
    GistsTransitions.unstar(id)
    .map(_ => Ok)
    .recover {
      case e @ GithubError(message, status) =>
        Logger.warn(s"github error: $e")
        Status(status)
    }
  }

}
