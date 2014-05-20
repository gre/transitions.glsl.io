package services.auth

import scala.concurrent.Future

import play.api.Play.current
import play.api.mvc._
import play.api.libs.ws._
import play.api.libs.json._
import play.api.Logger
import play.api.libs.concurrent.Execution.Implicits._

sealed case class AuthenticatedRequest(token: OAuth2Token, private val request: Request[AnyContent])
  extends WrappedRequest(request)

trait OAuth2Authentication {
  self: Controller with OAuth2Configuration =>

  private lazy val logger = Logger("services.auth.OAuth2Authentication")
  private val sessionKeyToken = "oauth2token"
  private val sessionKeyCsrf = "oauth2csrf"

  implicit def token(implicit request: AuthenticatedRequest) = request.token


  object Authenticated {
    def async (action: AuthenticatedRequest => Future[SimpleResult]) = Action.async { implicit request =>
      parseToken match {
        case Some(token) => action(AuthenticatedRequest(token, request))
        case _ => Future(Redirect(authenticateCall))
      }
    }
  }

  def Authenticated(action: AuthenticatedRequest => Result) = Action { implicit request =>
    parseToken match {
      case Some(token) => action(AuthenticatedRequest(token, request))
      case _ => Redirect(authenticateCall)
    }
  }

  def authenticate = Action.async { implicit request =>
    val redirectUri = request.headers.get(REFERER)
      .filter(!_.endsWith("/authenticate"))
      .getOrElse("/")
    request.getQueryString("error") match {
      case Some(error) =>
        Future(displayError(error, request.getQueryString("error_description")))
      case _ =>
        (request.getQueryString("code"), request.getQueryString("state"), request.session.get(sessionKeyCsrf)) match {
          // Step 1: request Access code
          case (None, _, _) =>
            Future(redirectToLoginPage)
          // Step 2: request Access token
          case (Some(code), Some(csrf), Some(csrfSess)) if csrf == csrfSess =>
            checkAccessToken(code, redirectUri)
          // Error: CSRF verification failed
          case (Some(code), csrf, csrfSess) =>
            Future(displayError("Error during authentication",
              Some("CSRF field doesn't match: %s != %s (%s)".format(csrf, csrfSess, request.remoteAddress))))
        }
    }
  }

  private def checkAccessToken(code: String, redirectUri: String)(implicit request: RequestHeader) = {
    logger.trace(s"AccessCode received: $code")
    requestAccessToken(code).map(result =>
      result.status match {
        case OK => redirectSuccessful(result, redirectUri)
        case _ => displayError("Unexpected error after requesting token", Some("(%d) %s".format(result.status, result.body)))
      })
  }

  private def requestAccessToken(code: String)(implicit request: RequestHeader) = {
    val params = Map(
      "grant_type" -> "authorization_code",
      "code" -> code,
      "redirect_uri" -> authenticateCall.absoluteURL(false),
      "client_id" -> oauth2info.clientId,
      "client_secret" -> oauth2info.clientSecret)
    logger.trace(s"Request access token : $params")

    WS.url(oauth2info.urlAccessToken)
      .withHeaders("Accept" -> "application/json")
      .post(params.mapValues(Seq(_)))
  }

  private def redirectSuccessful(response: play.api.libs.ws.Response, redirectUri: String)(implicit request: RequestHeader) = {
    response.status match {
      case 200 => {
        logger.trace(s"AccessToken received: ${response.json}")
        val token = response.json.as[OAuth2Token]
        val tokenStr = Json.stringify(Json.toJson(token))
        Redirect(redirectUri)
          .withSession(request.session - sessionKeyCsrf + (sessionKeyToken -> tokenStr))
      }
      case _ => displayError("Invalid authentication (%s:%s)".format(response.status, response.body))
    }
  }

  private def redirectToLoginPage(implicit request: RequestHeader) = {
    val csrf = java.util.UUID.randomUUID().toString
    val redirectQueryString = Map(
      "client_id"       -> oauth2info.clientId,
      "redirect_uri"    -> authenticateCall.absoluteURL(false),
      "state"           -> csrf,
      "scope"           -> oauth2info.scope,
      "response_type"   -> "code")
    val url = redirectQueryString.foldLeft(oauth2info.urlAuthorize+"?")((url, qs) => url + qs._1+"="+qs._2+"&")
    logger.trace(s"Redirect to login page: $url")

    Redirect(url).withSession(request.session + (sessionKeyCsrf -> csrf))
  }

  def parseToken(implicit request: RequestHeader): Option[OAuth2Token] = {
    request.session.get(sessionKeyToken).flatMap(Json.parse(_).asOpt[OAuth2Token])
  }

  private def displayError(techError: String, userError: Option[String] = None) = {
    logger.error(userError.map("\n" + _).getOrElse("") + techError)
    BadRequest(userError.getOrElse(techError))
  }
}
