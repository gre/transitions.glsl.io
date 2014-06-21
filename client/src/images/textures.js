var Qimage = require("qimage");

var GlslioTextureResolver = require("glslio-texture-resolver");
var uniformResolver = new GlslioTextureResolver(Qimage.anonymously);

module.exports = {
  names: [ // FIXME: we will need dynamic list query
//  for t in `ls server/public/textures/`; do echo "\"$t\","; done
    "bilinear-lateral.png",
    "conical-asym.png",
    "conical-sym.png",
    "linear-sawtooth-lateral-4.png",
    "radial-tri-lateral-4.png",
    "spiral-1.png",
    "spiral-2.png",
    "spiral-3.png",
    "square.png"
  ],
  resolver: uniformResolver
};
