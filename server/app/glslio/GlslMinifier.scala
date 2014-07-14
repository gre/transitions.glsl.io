package glslio

import scala.concurrent._
import scala.io.Source

import play.api._
import play.api.libs.ws._
import play.api.libs.json._
import play.api.http.HeaderNames._

class GlslMinifier (implicit app: Application) {

  val minifyBase = app.configuration.getString("glslio.servers.minify").getOrElse {
    throw new Error("glsl-transition-minify server is not defined")
    ""
  }

  def apply (glsl: String)(implicit ec: ExecutionContext): Future[Option[String]] =
    WS.url(minifyBase + "/compile")
      .withHeaders(CONTENT_TYPE -> "application/json")
      .post(glsl)
      .flatMap { res =>
        if (res.status == 200) {
          if (res.body.trim.size > 0)
            Future(Some(res.body))
          else {
            Logger.warn(s"Minification Server returned empty response.")
            Logger.debug(glsl)
            Future(None) // Nothing in the body, something was wrong
          }
        }
        else if (400 <= res.status && res.status < 500) {
          Logger.warn(s"Minification Server can't minify GLSL.");
          Logger.debug(glsl)
          Future(None)
        }
        else {
          Logger.error(s"${res.status} ${res.statusText} - ${res.body}");
          Future.failed(new Exception(s"Minification Server failure: ${res.status} ${res.statusText}"))
        }
      }

}
