name := "GLSLTransitions"

version := "1.0-SNAPSHOT"

libraryDependencies ++= Seq(
  cache,
  "joda-time" % "joda-time" % "2.3",
  "org.jsoup" % "jsoup" % "1.7.3",
  "org.reactivemongo" %% "reactivemongo" % "0.10.0",
  "org.reactivemongo" %% "play2-reactivemongo" % "0.10.2",
  "eu.henkelmann" % "actuarius_2.10.0" % "0.2.6"
)

play.Project.playScalaSettings
// lazy val root = (project in file(".")).enablePlugins(PlayScala)
