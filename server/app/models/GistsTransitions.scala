package models

import scala.concurrent._

import play.api.Play.current
import play.api.libs.concurrent.Execution.Implicits._
import play.api.libs.json._
import play.api.libs.json.Json._
import play.api.libs.functional.syntax._
import play.api.libs.json.Reads._

import play.Logger

import services.github.Github.{Gist => GistWS, User => UserWS, GithubError}

import services.auth.OAuth2Token

// Layer to sync Gists and Transitions
object GistsTransitions {

  def fork(parentId: String)(implicit token: OAuth2Token): Future[JsValue] = {
    for {
      id <- GistWS.fork(parentId)
      gist <- Gists.onForkCreated(id, parentId)
      transition <- gistToTransition(gist).map(Future(_)).getOrElse(Future.failed(new Error("Can't convert Gist -> Transition")))
    } yield transition
  }

  def save(id: String, json: JsValue, oldEntry: Option[JsValue])(implicit token: OAuth2Token) = {
    for {
      gistPatch <- json.validate(makeTransitionToGistPatchReader(oldEntry)).asOpt.map(Future(_)).getOrElse(Future.failed(new Error("Can't convert Transition -> Gist Patch")))
      _ <- GistWS.save(id, gistPatch)
      res <- Gists.onSaved(id)
    } yield res
  }

  def onGistCreated(id: String, js: JsValue): Future[Any] = {
    gistToTransition(js).map { transition =>
      Transitions.save(id, transition)
    }
    .getOrElse {
      Future.failed(new Error("Can't convert Gist -> Transition"))
    }
  }

  def onGistUpdated(id: String, js: JsValue): Future[Any] = {
    gistToTransition(js).map { transition =>
      Transitions.save(id, transition)
    }
    .getOrElse {
      Future.failed(new Error("Can't convert Gist -> Transition"))
    }
  }

  def onGistDeleted(id: String): Future[Any] = ???

  protected def gistToTransition (gist: JsValue) =
    gist.validate(gistToTransitionReader).fold(
      err => {
        Logger.error(s"gist: Can't validate the gist to mongo storage: $err")
        Logger.error(s"gist value: $gist")
        None
      },
      mongoGist => {
        Some(mongoGist)
      }
    )

  val uniformsDefaultFile = current.configuration.getString("glslio.uniformsFilename").getOrElse("uniforms.default.json")

  val string = Reads.of[JsString]
  val stringOrNull = Reads {
    case s: JsString => JsSuccess(s)
    case JsNull => JsSuccess(JsNull)
    case _ => JsError()
  }
  val extractGlslFromFile =
    (__ \ "content").json.pick[JsString]

  val extractDefaultUniformsFromFile =
    (__ \ "content").json.pick[JsString].flatMap { str =>
      val res = try {
        JsSuccess(Json.parse(str.value))
      }
      catch { case e =>
        JsError(e.toString)
      }
      Reads(_ => res)
    }

  val extractDefaultUniformsFromFiles = Reads {
    json: JsValue =>
      (json match {
        case JsObject(fields) =>
          fields.find(_._1 == uniformsDefaultFile)
            .map(tuple => JsSuccess(tuple._2))
            .getOrElse(JsError("Can't find a valid GLSL file"))
        case _ =>
          JsError("files must be a JsObject")
      })
      .flatMap(extractDefaultUniformsFromFile.reads(_))
  }

  val extractGlslNameFromFiles = Reads {
    json: JsValue =>
      (json match {
        case JsObject(fields) =>
          fields.find(_._1.toLowerCase.endsWith(".glsl"))
            .map(tuple => JsSuccess(JsString(tuple._1.dropRight(5))))
            .getOrElse(JsError("Can't find a valid GLSL file"))
        case _ =>
          JsError("files must be a JsObject")
      })
  }

  val extractGlslFromFiles = Reads {
    json: JsValue =>
      (json match {
        case JsObject(fields) =>
          fields.find(_._1.toLowerCase.endsWith(".glsl"))
            .map(tuple => JsSuccess(tuple._2))
            .getOrElse(JsError("Can't find a valid GLSL file"))
        case _ =>
          JsError("files must be a JsObject")
      })
      .flatMap(extractGlslFromFile.reads(_))
  }

  val defaultUniforms = Reads.pure[JsValue](Json.obj())

  val gistToTransitionReader = (
    (__ \ 'id).json.pickBranch(string) and
    (__ \ 'created_at).json.pickBranch(string) and
    (__ \ 'updated_at).json.pickBranch(string) and
    //(__ \ 'description).json.pickBranch(stringOrNull) and
    (__ \ 'git_pull_url).json.pickBranch(string) and
    (__ \ 'html_url).json.pickBranch(string) and
    (__ \ 'owner).json.copyFrom((__ \ 'owner \ 'login).json.pick(string)) and
    (__ \ 'name).json.copyFrom((__ \ 'files).json.pick(extractGlslNameFromFiles)) and
    (__ \ 'glsl).json.copyFrom((__ \ 'files).json.pick(extractGlslFromFiles)) and
    (__ \ 'defaults).json.copyFrom((__ \ 'files).json.pick(extractDefaultUniformsFromFiles orElse defaultUniforms))
  ).reduce


  def makeTransitionToGistPatchReader (previousEntry: Option[JsValue] = None) = //(
    //(__ \ 'description).json.pickBranch(stringOrNull) and
    (__ \ 'files).json.copyFrom((__).json.pick(Reads {
      json: JsValue => (json \ "glsl", json \ "name", json \ "defaults") match {
        case (glsl: JsString, JsString(name), defaults: JsObject) =>
          JsSuccess(
            JsObject(Seq(
              previousEntry
                .flatMap(oldEntry => (oldEntry \ "name").asOpt[String])
                .map { oldName =>
                (oldName+".glsl", JsObject(Seq(
                  ("content", glsl),
                  ("filename", JsString(name+".glsl"))
                )))
                }.getOrElse {
                (name+".glsl", JsObject(Seq(
                  ("content", glsl)
                )))
              },
              (uniformsDefaultFile, JsObject(Seq(
                ("content", JsString(defaults.toString))
              )))
            ))
          )
        case _ => JsError("invalid entry. Must have glsl, name and defaults")
      }
    }))
}
