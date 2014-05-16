package services.github

import WS.WSRequestHolder

import services.auth.OAuth2Token

import play.api._
import play.api.libs.concurrent.Execution.Implicits._

import play.api.libs.json._
import play.api.libs.json.Json._
import play.api.libs.functional.syntax._
import play.api.libs.json.Reads._

import play.api.Play.current
import scala.util.matching.Regex

import concurrent.Future

import org.jsoup._
import scala.collection.JavaConversions._

object Github {
  lazy val clientId = Play.application.configuration.getString("github.client.id").get
  lazy val clientSecret = Play.application.configuration.getString("github.client.secret").get

  def fetch(url: String, accept: String = "application/json"): WSRequestHolder = {
    WS.url("https://api.github.com" + url)
      .withHeaders("Accept" -> accept)
      .withQueryString("client_id" -> clientId)
      .withQueryString("client_secret" -> clientSecret)
  }

  def fetchWithToken(url: String, accept: String = "application/json")(implicit token: OAuth2Token): WSRequestHolder = {
    fetch(url, accept)
      .withQueryString("access_token" -> token.accessToken)
  }

  object User {

    /**
     * Return information about the connected user
     */
    def me(implicit token: OAuth2Token) = {
      fetchWithToken("/user").get.map(_.json)
    }

    /**
     * Return information about an user
     */
    def info(user: String)(implicit token: OAuth2Token) = {
      fetchWithToken(s"/users/$user").get.map(_.json)
    }
  }

  case class GithubError(message: String, status: Int) extends Error(message)

  object Gist {

    var uniformsDefaultFile = "uniforms.default.json"

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

    val gistToEntry = (
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


    def entryToGistPatch (previousEntry: Option[JsValue] = None) = //(
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
    //).reduce

    def get(id: String) = {
      fetch(s"/gists/$id")
        .get
        .map(_.json)
    }

    def getStarCount(id: String, timeout: concurrent.duration.FiniteDuration) = {
      val headers = current.configuration.getString("github.cookie").map(cookie => List("Cookie" -> cookie)).getOrElse {
        Logger.warn("No github.cookie is used. It is needed as a workaround to fix a Github Gist cache issue.")
        Nil
      }

      WS.url(s"https://gist.github.com/$id/stars")
      .withHeaders(headers:_*)
      .withRequestTimeout(timeout.toMillis.toInt)
      .get
      .flatMap { r =>
        r.status match {
          case 200 =>
            var body = Jsoup.parse(r.body).body
            val stars = body
              .select(".social-count") // This is a workaround because the Gist Cache issue
              .headOption.orElse {
                body.select("li a")
                .find(a => a.attr("href").endsWith("/stars"))
                .flatMap(_.select(".counter").headOption)
              }
              .map(_.text.toInt)
              .getOrElse(0)
            Future.successful(stars)

          case _ =>
            Future.failed(new Error("Failed WS."))
        }
      }
    }
    
    def fork(id: String)(implicit token: OAuth2Token) = {
      fetchWithToken(s"/gists/$id/forks").post("").flatMap(result => result.status match {
        case 201 => 
          (result.json \ "id").asOpt[String].map { id =>
            Future.successful(id)
          }.getOrElse {
            Logger.warn(s"No id: ${result.body}")
            Future.failed(new Error("no id in the result."))
          }
        case status =>
          Logger.warn(s"Failed: ${result.body}")
          Future.failed(new GithubError("Can't fork on Github", status))
      })
    }

    def save(json: JsValue, oldEntry: Option[JsValue])(implicit token: OAuth2Token) = {
      val id = (json \ "id").as[String]
      json.validate(entryToGistPatch(oldEntry)).fold(
        err => {
          Future.failed(new GithubError("Invalid request", 400))
        },
        data => {
          fetchWithToken(s"/gists/$id")
            .prepare("PATCH", data)
            .execute
            .flatMap(result => result.status match {
              case 200 => Future.successful()
              case status => 
                play.Logger.warn(s"Github Error: ${result.body}")
                Future.failed(new GithubError("Can't save on Github", status))
            })
        }
      )
    }

    def starred(gistId: String)(implicit token: OAuth2Token) = {
      fetchWithToken(s"/gists/$gistId/star")
        .get()
        .map(_.status == 204)
    }

    def star(gistId: String)(implicit token: OAuth2Token) = {
      fetchWithToken(s"/gists/$gistId/star")
        .put("")
        .map(_.status == 204)
    }

    def unstar(gistId: String)(implicit token: OAuth2Token) = {
      fetchWithToken(s"/gists/$gistId/star")
        .delete()
        .map(_.status == 204)
    }
  }
}
