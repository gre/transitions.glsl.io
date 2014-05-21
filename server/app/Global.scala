package glslio

import akka.actor.Props
import com.typesafe.config.ConfigFactory
import play.api._
import play.api.libs.concurrent.Akka
import play.api.libs.concurrent.Execution.Implicits._

import scala.concurrent._
import scala.concurrent.duration._

import reactivemongo.api._
import play.modules.reactivemongo.ReactiveMongoPlugin
import play.modules.reactivemongo.json.collection.JSONCollection

import models._

object Global extends GlobalSettings {

  def rootGist(implicit app: Application) = app.configuration.getString("glslio.rootGist").getOrElse {
    Logger.error("glslio.rootGist is required.")
    System.exit(1)
    ""
  }

  override def onStart(app: Application) {
    implicit val current = app

    // FIXME: only clean the db if application version has changed
    if (app.configuration.getBoolean("cleandb").getOrElse(true)) {
      Transitions.clean()
    }

    Akka.system.scheduler.schedule(0 seconds, 30 seconds, Gists.actor, "refresh")
  }


  override def onStop(app: Application) {
  }

}
