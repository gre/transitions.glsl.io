package models

import scala.concurrent._
import scala.math.Ordering

import play.api._
import play.api.libs.concurrent.Execution.Implicits._
import play.api.Play.current
import play.api.libs.json._
import play.api.libs.json.Json._
import play.api.libs.functional.syntax._
import play.api.libs.json.Reads._
import play.modules.reactivemongo.ReactiveMongoPlugin
import play.modules.reactivemongo.json.collection.JSONCollection
import reactivemongo.api._
import org.joda.time._

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

  val sortModes = Map(
    "mix" ->  Json.obj("stars" -> -1, "created_at" -> -1),
    "star" ->  Json.obj("stars" -> -1, "created_at" -> -1),
    "new" ->  Json.obj("created_at" -> -1),
    "change" ->  Json.obj("updated_at" -> -1)
  );

  def all(
    maybeUser: Option[String] = None,
    withUnpublished: Boolean = false,
    sort: String = "new"
  ) = {
    val sortObject = sortModes.get(sort).getOrElse(sortModes("new"))
    val criteria = Json.obj("id" -> Json.obj("$ne" -> rootGist)) ++
      maybeUser.map { user => Json.obj("owner" -> user) }.getOrElse(Json.obj()) ++
      (if (!withUnpublished) Json.obj("name" -> Json.obj("$ne" -> rootGistFileName)) else Json.obj());

    val result =
      collection
      .find(criteria)
      .sort(sortObject)
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

    if (sort == "mix")
      result.map(_.sorted(MixedOrdering))
    else
      result
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
      .map { _ =>
        Json.obj("stars" -> count, "stargazers" -> stargazers)
      }

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


  object MixedOrdering extends Ordering[JsObject] {
    val jodaTime = Reads(_ match {
      case JsString(str) =>
        try {
          JsSuccess(new DateTime(str))
        } catch { case e: Exception =>
          JsError("failed to parse: "+e)
        }
      case _ =>
        JsError("only parse string")
    })
    val starsAndCreated = (
      (JsPath \ 'stars).read[Int] and 
      (JsPath \ 'created_at).read(jodaTime)
    ).tupled

    def score (stars: Int, created: DateTime) = {
      val recentRange = (1000*60*60*24*7).toDouble
      val recentFactor = math.max(0, (recentRange - (DateTime.now().getMillis - created.getMillis)) / recentRange)
      val s = stars + 2000.0 * math.pow(recentFactor, 6.0)
      (100.0*s).toInt
    }

    def greaterThan(astars: Int, acreated: DateTime, bstars: Int, bcreated: DateTime) = {
      val ascore = score(astars, acreated)
      val bscore = score(bstars, bcreated)
      if (ascore == bscore)
        bcreated.isAfter(acreated)
      else
        bscore > ascore
    }

    def compare(jsa:JsObject, jsb:JsObject) =
      (jsa.validate(starsAndCreated), jsb.validate(starsAndCreated)) match {
        case (JsSuccess((astars, acreated), _), JsSuccess((bstars, bcreated), _)) =>
          if (greaterThan(astars, acreated, bstars, bcreated)) 1 else -1
        case _ => 0
      }
  }

}
