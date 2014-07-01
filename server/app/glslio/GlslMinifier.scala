package glslio

import scala.util.{Try}
import scala.io.Source

import play.api._
import java.io._
import sys.process._


class GlslMinifier (implicit app: Application) {

  val glslUnitScriptSource = app.resourceAsStream("template_glsl_compiler.js").map(Source.fromInputStream(_).mkString).getOrElse {
    throw new Error("template_glsl_compiler.js can't be found in the classpath.")
    ""
  }

  def temporaryDirectory () = {
    val tmpdir = File.createTempFile("glsl_transition_source", "")
    tmpdir.delete()
    tmpdir.mkdir()
    tmpdir
  }

  def write (file: File, content: String) = {
    val writer = new BufferedWriter(new FileWriter(file))
    writer.write(content)
    writer.close()
    file
  }

  def apply (source: String): Try[String] = Try {
    val tmpdir = temporaryDirectory()
    val script = write(new File(tmpdir, "script.js"), glslUnitScriptSource)
    val tmpfile = write(new File(tmpdir, "in.glsl"), source)

    val cmd = Process(
      Seq("node", 
        script.getName(),
        "--input", tmpfile.getName(),
        "--variable_renaming", "INTERNAL"
      ), tmpdir)
    Logger.debug("GlslMinifier: running command: "+cmd)
    val minified = cmd.!!.split("\n").last.replace("\\n", "\n").trim
    tmpfile.delete()
    tmpdir.delete()
    minified
  }

}
