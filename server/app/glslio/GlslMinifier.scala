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

  def apply (transition: JsValue)(implicit ec: ExecutionContext): Future[JsValue] =
    WS.url(minifyBase + "/compile")
      .withHeaders(CONTENT_TYPE -> "application/json")
      .post(transition)
      .filter(_.status==200)
      .map(_.json)

}
