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

  def snapshot(minified: Boolean): Future[JsValue] = {
    val transitions = Transitions.all().flatMap { transitionsRaw =>
      val transitionsFuture = transitionsRaw
        .flatMap(transition => transition.validate(transitionTransformer).fold(
          err => {
            Logger.warn("failed for transition "+(transition \ "id"))
            Logger.warn(""+err)
            None
          },
          result => Some(result)
        ))
      if (!minified) {
        Future(transitionsFuture)
      }
      else {
        val minifiedFutures = transitionsFuture.map { transition =>
          val glsl = (transition \ "glsl").as[String]
          minifier(glsl).map { maybeMinifiedGlsl =>
            maybeMinifiedGlsl.map { minifiedGlsl =>
              transition + ("glsl" -> JsString(minifiedGlsl))
            }
          }
        }
        Future.sequence(minifiedFutures).map(_.flatten)
      }
    }.flatMap { transitions =>
      if (transitions.size == 0)
        Future.failed(new Exception("No transitions could have been minified."))
      else
        Future(transitions)
    }
    transitions.map(JsArray(_))
  }
}
