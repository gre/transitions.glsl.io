package controllers

import play.api._
import play.api.mvc._

object Github extends GithubOAuthController {

  def logout = Action(Redirect("/").withSession())
}
