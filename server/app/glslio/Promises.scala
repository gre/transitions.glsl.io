package glslio

import play.api._
import play.api.libs.concurrent.Akka
import scala.concurrent._
import scala.concurrent.duration._

object Futures {

  implicit def enhanceFuture[T] (future: Future[T])(implicit app: Application) = new EnhancedFuture(future)

  class EnhancedFuture[T](future: Future[T])(implicit app: Application) {
    def delay (duration: FiniteDuration)(implicit ec: ExecutionContext) = {
      future.flatMap { result =>
        val promise = Promise[T]()
        Akka.system.scheduler.scheduleOnce(duration) { promise.success(result) }
        promise.future
      }
    }
  }


}
