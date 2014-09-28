var Qimage = require("qimage");

var GlslioTextureResolver = require("glslio-texture-resolver");
var uniformResolver = new GlslioTextureResolver(Qimage.anonymously);

module.exports = {
  names: [ // FIXME: we will need dynamic list query
//  for t in `ls server/public/textures/`; do echo "\"$t\","; done
    "luma/bilinear-lateral.png",
    "luma/conical-asym.png",
    "luma/conical-sym.png",
    "luma/linear-sawtooth-lateral-4.png",
    "luma/radial-tri-lateral-4.png",
    "luma/spiral-1.png",
    "luma/spiral-2.png",
    "luma/spiral-3.png",
    "luma/square.png"
  ],
  resolver: uniformResolver,
  resolveUrl: GlslioTextureResolver.resolveUrl
};
