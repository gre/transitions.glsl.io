var Qimage = require("qimage");

module.exports = {
  names: [
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
  resolveName: function (imgId) {
    var name = typeof imgId === "number" ? this.names[imgId] : imgId;
    if (!name) throw new Error("texture name not found. "+imgId);
    return name;
  },
  getImage: function (imgId) {
    return Qimage("/assets/textures/"+this.resolveName(imgId));
  }
};
