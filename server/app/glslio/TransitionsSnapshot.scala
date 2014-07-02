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

  val minifyGlsl: Reads[JsString] = Reads { case JsString(str) =>
    minifier(str) match {
      case Success(minified) => JsSuccess(JsString(minified))
      case Failure(e) => {
        Logger.debug(e.toString, e)
        JsError(e.toString)
      }
    }
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
    Logger.debug("snapshotting...")
    Transitions.all().map { case transitions =>
      val transformed = transitions.flatMap { case transition =>
        val validation = transition.validate(transitionTransformer)
        // FIXME: probably need to incrementally detect if something has changed. MongoDB could be used
        validation.fold( err => {
            Logger.warn("failed for transition "+(transition \ "id"))
            Logger.warn(""+err)
            None
          }, result => Some(result)
        )
      }
      Logger.info("snapshot results of "+transformed.size+" out of "+transitions.size)
      JsArray(transformed)
    }
  }

}
