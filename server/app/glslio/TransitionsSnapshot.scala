package glslio

import concurrent._

import play.api.Play.current
import play.api.libs.concurrent.Execution.Implicits._

import play.api.libs.json._
import play.api.libs.json.Json._
import play.api.libs.functional.syntax._
import play.api.libs.json.Reads._

import models._

object TransitionsSnapshot {
  
  val minifier = new GlslMinifier()

  val string = Reads.of[JsString]

  val minifyGlsl: Reads[JsString] = Reads { case JsString(str) =>
    minifier(str).map(minified => JsSuccess(JsString(minified))).getOrElse(JsError())
  }

  val transitionTransformer = (
    (__ \ 'id).json.pickBranch(string) and
    (__ \ 'owner).json.pickBranch(string) and
    (__ \ 'html_url).json.pickBranch(string) and
    (__ \ 'created_at).json.pickBranch(string) and
    (__ \ 'updated_at).json.pickBranch(string) and
    (__ \ 'name).json.pickBranch(string) and
    (__ \ 'glsl).json.pickBranch(minifyGlsl) and
    (__ \ 'uniforms).json.pickBranch(Reads.of[JsObject])
  ).reduce

  def snapshot(): Future[JsValue] = {
    Transitions.all().map { case transitions =>
      val transformed = transitions.flatMap { case transition =>
        transition.validate(transitionTransformer).asOpt
      }
      JsArray(transformed)
    }
  }

}
