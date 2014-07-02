package glslio

import scala.util._
import scala.concurrent._

import play.api.Play.current
import play.api.Logger
import play.api.libs.concurrent.Execution.Implicits._

import play.api.libs.json._
import play.api.libs.json.Json._
import play.api.libs.functional.syntax._
import play.api.libs.json.Reads._

import models._

object TransitionsSnapshot {
  
  val minifier = new GlslMinifier()

  val string = Reads.of[JsString]

  val transitionTransformer = (
    (__ \ 'id).json.pickBranch(string) and
    (__ \ 'owner).json.pickBranch(string) and
    (__ \ 'html_url).json.pickBranch(string) and
    (__ \ 'created_at).json.pickBranch(string) and
    (__ \ 'updated_at).json.pickBranch(string) and
    (__ \ 'name).json.pickBranch(string) and
    (__ \ 'glsl).json.pickBranch(string) and
    (__ \ 'uniforms).json.pickBranch(Reads.of[JsObject])
  ).reduce

  def snapshot(): Future[JsValue] = Transitions.all().flatMap { transitionsRaw =>
    val transitionsFutures = transitionsRaw
      .flatMap(transition => transition.validate(transitionTransformer).fold(
        err => {
          Logger.warn("failed for transition "+(transition \ "id"))
          Logger.warn(""+err)
          None
        },
        result => Some(result)
      ))
      .map(minifier.apply)
      .map(_.map(Some(_)).recover { case e =>
        Logger.warn("Transition fails to minify:", e)
        None
      })
    Future.sequence(transitionsFutures).map(_.flatten)
  }.map(JsArray(_))

}
