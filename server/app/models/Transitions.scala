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

  val transitionFilterTransformer =
    (__ \ '_id).json.prune

  val transitionStarsAndStargazers = (
    (JsPath \ 'stars).read[Int] and
    (JsPath \ 'stargazers).read[Set[String]]
  ).tupled

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
      .map { seq =>
        seq.flatMap { json =>
          json.transform(transitionFilterTransformer).fold(
            err => {
              Logger.error(s"Failed transform with transitionFilterTransformer: $err")
              None
            },
            result => Some(result)
          )
        }
      }
  }

  private def _get (id: String) =
    collection
      .find(Json.obj("id" -> id))
      .cursor[JsObject]
      .headOption

  def get (id: String) =
      _get(id)
      .map(_.flatMap(_.transform(transitionFilterTransformer).fold(
        err => {
          Logger.error(s"Failed transform with transitionFilterTransformer: $err")
          None
        },
        result => Some(result)
      )))

  def save (id: String, transition: JsObject) =
    for {
      existingEntryOptions <- _get(id)
      (stars, stargazers) = existingEntryOptions.flatMap(_.validate(transitionStarsAndStargazers).asOpt).getOrElse((0, Set.empty))
      result <- collection.update(Json.obj("id" -> id), transition ++ Json.obj("stars" -> stars, "stargazers" -> stargazers), upsert = true)
    } yield result

  def setGistStarCount (id: String, count: Int, stargazers: Set[String]) =
    collection
      .update(Json.obj("id" -> id), Json.obj("$set" -> Json.obj("stars" -> count, "stargazers" -> stargazers)), upsert = true)

  def remove (id: String) =
    collection
      .remove(Json.obj("id" -> id))

  def clean() = {
    collection.drop().map { _ =>
      Logger.info("Transitions collection dropped.");
    }.recover { case _ =>
      Logger.warn("Can't drop Transitions collection.");
    }
  }

  def onStarred (id: String, who: String) =
    for {
      transitionOption <- get(id)
      (count, stargazers) <- transitionOption.flatMap(_.validate(transitionStarsAndStargazers).asOpt).map(Future(_)).getOrElse(Future.failed(new Exception("No Transition Found")))
      newStargazers = stargazers + who
      result <- setGistStarCount(id, newStargazers.size, newStargazers)
    } yield result

  def onUnstarred (id: String, who: String) =
    for {
      transitionOption <- get(id)
      (count, stargazers) <- transitionOption.flatMap(_.validate(transitionStarsAndStargazers).asOpt).map(Future(_)).getOrElse(Future.failed(new Exception("No Transition Found")))
      newStargazers = stargazers - who
      result <- setGistStarCount(id, newStargazers.size, newStargazers)
    } yield result


}
