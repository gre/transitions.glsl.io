package controllers

import play.api._
import play.api.mvc._
import play.api.Play.current
import play.api.cache.Cached
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.modules.reactivemongo.MongoController

import glslio._
import models._

object Snapshots extends Controller with MongoController {
  def all(minified: Boolean) = Cached((_:RequestHeader) => "snapshots_all_"+minified, 120) {
    Action.async { req =>
    TransitionsSnapshot.snapshot(minified)
      .map(Ok(_))
    }
  }
}
