package glslio

import org.specs2.mutable._
import org.specs2.runner._
import org.junit.runner._

import play.api.test._
import play.api.test.Helpers._
import play.api._

class GlslMinifierSpec extends Specification {

  val template = """
#ifdef GL_ES
precision highp float;
#endif
uniform sampler2D from, to;
uniform float progress;
uniform vec2 resolution;

void main() {
  vec2 p = gl_FragCoord.xy / resolution.xy;
  gl_FragColor = mix(texture2D(from, p), texture2D(to, p), progress);
}
"""

  val expectedMinifiedTemplate = "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from,to;uniform float progress;uniform vec2 resolution;void main(){vec2 a=gl_FragCoord.xy/resolution.xy;gl_FragColor=mix(texture2D(from,a),texture2D(to,a),progress);}";

  "GlslMinifier" should {
    running(FakeApplication()) {
      import Play.current
      val minifier = new GlslMinifier()

      "produce smaller glsl" in {
        val minified = minifier(template).get
        0 < minified.length && minified.length < template.length
      }

      "still contain uniforms full name" in {
        val minified = minifier(template).get
        minified.contains("from") &&
        minified.contains("to") &&
        minified.contains("progress") &&
        minified.contains("resolution")
      }

      "should strictly produce this minified glsl" in {
        val minified = minifier(template).get
        minified == expectedMinifiedTemplate
      }
    }
  }
}
