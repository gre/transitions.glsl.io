name := "GLSLTransitions"

version := "1.0-SNAPSHOT"

resolvers += "Sonatype Snapshots" at "https://oss.sonatype.org/content/repositories/snapshots/"

libraryDependencies ++= Seq(
  ws,
  cache,
  "joda-time" % "joda-time" % "2.3",
  "org.jsoup" % "jsoup" % "1.7.3",
  "org.reactivemongo" %% "reactivemongo" % "0.10.5.akka23-SNAPSHOT",
  "org.reactivemongo" %% "play2-reactivemongo" % "0.10.5.akka23-SNAPSHOT",
  "eu.henkelmann" % "actuarius_2.10.0" % "0.2.6"
)

lazy val root = (project in file(".")).enablePlugins(PlayScala)
