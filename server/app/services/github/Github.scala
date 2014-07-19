package services.github

import play.api.libs.ws.WS
import play.api.libs.ws.WS.WSRequestHolder

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
import org.jsoup.nodes._
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
  case class GithubMetadata(remaining: Option[Int])
  case class GithubResult[T](data: T, metadata: GithubMetadata)

  def toGithubResult[T](data: T)(implicit res: WS.Response) =
    GithubResult(data, GithubMetadata(res.header("X-RateLimit-Remaining").map(_.toInt)))

  object Gist {

    def get(id: String) = {
      fetch(s"/gists/$id")
        .get
        .filter(_.status == 200)
        .map { implicit res => toGithubResult(res.json) }
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
      .flatMap { implicit r =>
        r.status match {
          case 200 =>
            val body = Jsoup.parse(r.body).body
            val stargazers = body
              .select(".stargazers li a")
              .map(_.childNodes.headOption.collect{ case t: TextNode => t })
              .flatten

            val stars = body
              .select(".social-count") // This is a workaround because the Gist Cache issue
              .headOption.orElse {
                body.select("li a")
                .find(a => a.attr("href").endsWith("/stars"))
                .flatMap(_.select(".counter").headOption)
              }
              .map(_.text.toInt)
              .getOrElse(0)

            if (stargazers.size != stars) {
              Logger.warn(s"Something is wrong with stars of gist $id : stargazers.size=${stargazers.size} is different of stars=${stars}")
              Logger.debug(s"stargazers=$stargazers")
            }

            Future.successful(toGithubResult((stars, stargazers)))

          case _ =>
            Future.failed(new Error("Failed WS."))
        }
      }
    }

    def fork(id: String)(implicit token: OAuth2Token) = {
      fetchWithToken(s"/gists/$id/forks")
        .post("")
        .flatMap(implicit result => result.status match {
          case 201 =>
            (result.json \ "id").asOpt[String].map { id =>
              Future.successful(toGithubResult(id))
            }.getOrElse {
              Logger.warn(s"No id: ${result.body}")
              Future.failed(new Error("no id in the result."))
            }
          case status =>
            Logger.warn(s"Failed: ${result.body}")
            Future.failed(new GithubError("Can't fork on Github", status))
        })
    }

    def save(id: String, data: JsValue)(implicit token: OAuth2Token) = {
      fetchWithToken(s"/gists/$id")
        .patch(data)
        .flatMap(implicit result => result.status match {
          case 200 => Future.successful(toGithubResult(()))
          case status =>
            play.Logger.warn(s"Github Error: ${result.body}")
            Future.failed(new GithubError("Can't save on Github", status))
        })
    }

    def starred(gistId: String)(implicit token: OAuth2Token) = {
      fetchWithToken(s"/gists/$gistId/star")
        .get()
        .map { implicit result => toGithubResult(result.status == 204) }
    }

    def star(gistId: String)(implicit token: OAuth2Token) = {
      fetchWithToken(s"/gists/$gistId/star")
        .put("")
        .map { implicit result => toGithubResult(result.status == 204) }
    }

    def unstar(gistId: String)(implicit token: OAuth2Token) = {
      fetchWithToken(s"/gists/$gistId/star")
        .delete()
        .map { implicit result => toGithubResult(result.status == 204) }
    }
  }
}
