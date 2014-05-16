package services.auth

import play.api.libs.json._
import play.api.libs.functional.syntax._
import java.util.Date

case class OAuth2Token(
  accessToken: String,
  tokenType: String
)

object OAuth2Token {

  implicit val OAuth2TokenFormater = (
    (__ \ 'access_token).format[String] and
    (__ \ 'token_type).format[String]
  )(OAuth2Token.apply _, unlift(OAuth2Token.unapply _))
}
