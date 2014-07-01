package glslio

import scala.util.{Try}

import play.api._
import java.io._
import sys.process._


class GlslMinifier (implicit app: Application) {

  val glslUnitScript = app.resource("template_glsl_compiler.js").map(_.getFile).getOrElse {
    throw new Error("template_glsl_compiler.js can't be found in the classpath.")
    ""
  }

  def apply (source: String): Try[String] = Try {
    val tmpdir = File.createTempFile("glsl_transition_source", "")
    tmpdir.delete()
    tmpdir.mkdir()
    val tmpfile = new File(tmpdir, "in.glsl");
    val writer = new BufferedWriter(new FileWriter(tmpfile))
    writer.write(source)
    writer.close()
    val cmd = Process(
      Seq("node", 
        glslUnitScript,
        "--input", tmpfile.getName(),
        "--variable_renaming", "INTERNAL"
      ), tmpdir)
    val minified = cmd.!!.split("\n").last.replace("\\n", "\n").trim
    tmpfile.delete()
    tmpdir.delete()
    minified
  }

}
