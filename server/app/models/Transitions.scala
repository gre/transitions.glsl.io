package models

import scala.concurrent._

import play.api._
import play.api.libs.concurrent.Execution.Implicits._

import play.api.Play.current

import play.api.libs.json._
import play.api.libs.json.Json._
import play.api.libs.functional.syntax._
import play.api.libs.json.Reads._

import reactivemongo.api._
import play.modules.reactivemongo.ReactiveMongoPlugin
import play.modules.reactivemongo.MongoController
import play.modules.reactivemongo.json.collection.JSONCollection

object Transitions {
  val db = ReactiveMongoPlugin.db
  def collection: JSONCollection = db.collection[JSONCollection]("transitions")

  val rootGist = glslio.Global.rootGist
  val rootGistFileName = Play.application.configuration.getString("glslio.rootGistFilename").getOrElse("TEMPLATE")

  def all(maybeUser: Option[String] = None) = {
    val criteria = maybeUser.map { user =>
      Json.obj(
        "id" -> Json.obj("$ne" -> rootGist),
        "$or" -> Json.arr(
          Json.obj("name" -> Json.obj("$ne" -> rootGistFileName)),
          Json.obj("owner" -> user)))
    }.getOrElse {
      Json.obj(
        "id" -> Json.obj("$ne" -> rootGist),
        "name" -> Json.obj("$ne" -> rootGistFileName))
    }

    collection
      .find(criteria)
      .sort(Json.obj("updated_at" -> -1))
      .cursor[JsObject]
      .collect[Seq]()
  }

  def get (id: String) =
    collection
      .find(Json.obj("id" -> id))
      .cursor[JsObject]
      .headOption

  def save (id: String, transition: JsValue) =
    collection
      .update(Json.obj("id" -> id), transition, upsert = true)

  def clean() =
    collection.drop().map { _ =>
      Logger.info("Gists collection dropped.");
    }.onFailure { case _ =>
      Logger.error("Can't drop Gists collection.");
    }

}
