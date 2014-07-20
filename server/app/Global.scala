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

    val cleandb = app.configuration.getBoolean("glslio.cleandb").getOrElse(false)
    val refreshRate = app.configuration.getInt("glslio.refreshRate").getOrElse(30)

    // FIXME: only clean the db if application version has changed
    for {
      _ <- if (cleandb) Transitions.clean() else Future()
      _ <- if (cleandb) Gists.clean() else Future()
    }
    yield {
      Logger.info("glslio.refreshRate set to " + refreshRate)
      Akka.system.scheduler.schedule(0 seconds, refreshRate seconds, Gists.actor, "refresh")
    }
  }


  override def onStop(app: Application) {
  }

}
