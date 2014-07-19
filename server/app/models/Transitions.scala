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
import play.modules.reactivemongo.json.collection.JSONCollection

object Transitions {
  val db = ReactiveMongoPlugin.db
  def collection: JSONCollection = db.collection[JSONCollection]("transitions")

  val rootGist = glslio.Global.rootGist
  val rootGistFileName = Play.application.configuration.getString("glslio.rootGistFilename").getOrElse("TEMPLATE")

  def all(
    maybeUser: Option[String] = None,
    withUnpublished: Boolean = false,
    sort: JsObject = Json.obj("created_at" -> -1)
  ) = {
    val criteria = Json.obj("id" -> Json.obj("$ne" -> rootGist)) ++
      maybeUser.map { user => Json.obj("owner" -> user) }.getOrElse(Json.obj()) ++
      (if (!withUnpublished) Json.obj("name" -> Json.obj("$ne" -> rootGistFileName)) else Json.obj());

    collection
      .find(criteria)
      .sort(sort)
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

  def clean() = {
    collection.drop().map { _ =>
      Logger.info("Transitions collection dropped.");
    }.recover { case _ =>
      Logger.error("Can't drop Transitions collection.");
    }
  }

}
