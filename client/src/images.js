var Q = require("q");
var Qimage = require("qimage");

module.exports = {
  gallery: Q.all([
    Qimage("/assets/images/gallery/1.jpg"),
    Qimage("/assets/images/gallery/2.jpg"),
    Qimage("/assets/images/gallery/3.jpg")
  ]),
  editor: Q.all([
    Qimage("/assets/images/editor/1.jpg"),
    Qimage("/assets/images/editor/2.jpg"),
    Qimage("/assets/images/editor/3.jpg")
  ])
};
