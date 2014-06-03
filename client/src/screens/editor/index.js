var Q = require("q");
var Qstart = require("qstart");
var Qimage = require("qimage");
var EditorScreen = require("./EditorScreen");

var imagesRequiredNow = Q.defer();
var imagesP =
  // Only preload images after a page time load or if it is required now
  Q.race([ Qstart.delay(1200), imagesRequiredNow.promise ])
  .then(function () {
    return Q.all([
      Qimage("/assets/images/editor/1.jpg"),
      Qimage("/assets/images/editor/2.jpg"),
      Qimage("/assets/images/editor/3.jpg")
    ]);
  });

function show (transition) {
  console.log(transition);

  imagesRequiredNow.resolve();
  var env = require("../../env");

  return imagesP.then(function (images) {
    return EditorScreen({
      env: env,
      transition: transition,
      images: images,
      previewWidth: 256,
      previewHeight: 256
    });
  });
}

function init () {
  return {
    show: show
  };
}

module.exports = init;
