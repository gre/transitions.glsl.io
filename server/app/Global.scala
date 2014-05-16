package glslio

import akka.actor.Props
import com.typesafe.config.ConfigFactory
import play.api._
import play.api.libs.concurrent.Akka
import play.api.libs.concurrent.Execution.Implicits._
import play.api.Play.current

import scala.concurrent._
import scala.concurrent.duration._

import reactivemongo.api._
import play.modules.reactivemongo.ReactiveMongoPlugin
import play.modules.reactivemongo.json.collection.JSONCollection

object Global extends GlobalSettings {

  def rootGist(implicit app: Application) = app.configuration.getString("glslio.rootGist").getOrElse {
    Logger.error("glslio.rootGist is required.")
    System.exit(1)
    ""
  }

  def actorSystem = {
    Akka.system
  }

  var crawler: akka.actor.ActorRef = null

  def actorCrawler = {
    crawler
  }

  override def onStart(app: Application) {
    val cleanDb = app.configuration.getBoolean("cleandb").getOrElse(true)

    // FIXME: only clean the db if application version has changed
    if (cleanDb) {
      val db = ReactiveMongoPlugin.db
      def gists: JSONCollection = db.collection[JSONCollection]("gists")
      gists.drop().map { _ =>
        Logger.info("Gists collection dropped.");
      }.onFailure { case _ =>
        Logger.error("Can't drop Gists collection.");
      }
    }

    crawler = Akka.system.actorOf(Props(new actors.TransitionsIndexer(rootGist)), name = "gist-crawler")
    Akka.system.scheduler.schedule(0 seconds, 60 seconds, crawler, "refreshForks")
    /*
    Akka.system.scheduler.schedule(60 seconds, 60 seconds, crawler, "refreshStars")
    Akka.system.scheduler.schedule(10 seconds, 10 seconds, crawler, "refreshPending")
    */
  }


  override def onStop(app: Application) {
  }

}
