package services.auth

import play.api.mvc._

case class OAuth2Infos(
  clientId: String,
  clientSecret: String,
  urlAuthorize: String,
  urlAccessToken: String,
  scope: String
)

/**
 * Generic configuration required in the OAuth2 proccess
 */
trait OAuth2Configuration {
  def authenticateCall: Call
  def authenticatedCall: Call
  def oauth2info: OAuth2Infos
}

/**
 * Default configuration for Play2 project, loaded from application.conf
 */
trait OAuth2DefaultConfiguration extends OAuth2Configuration {
  import play.api.Play.current

  // Path where OAuth2 configuration must be set (can be overrided)
  val configuration: String = "oauth2"
  private lazy val conf = current.configuration.getConfig(configuration).getOrElse(throwConfigurationNotFound)

  override lazy val oauth2info = OAuth2Infos(
    get("client.id"),
    get("client.secret"),
    get("urlAuthorize"),
    get("urlAccessToken"),
    get("scope"))

  private def throwMissingFieldError(key: String) =
    throw conf.globalError("OAuth2Configuration - Unable to find key: [%s.%s]" format (configuration, key))

  private def throwConfigurationNotFound() =
    throw current.configuration.globalError("OAuth2Configuration - Configuration not found: [%s]" format (configuration))

  private def get(key: String) = {
    conf.getString(key).getOrElse(throwMissingFieldError(key))
  }
}
