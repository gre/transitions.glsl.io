package controllers

import play.api._
import play.api.mvc._

import play.api.http.HeaderNames._

object Github extends GithubOAuthController {

  def logout = Action { req =>
    var redirectUrl =
      req.headers.get(REFERER)
      .filter(!_.endsWith("/logout"))
      .getOrElse("/")
    Redirect(redirectUrl).withSession()
  }
}
