var _ = require("lodash");
var Q = require("q");
var Qimage = require("qimage");
var Qstart = require("qstart");
var GalleryScreen = require("./GalleryScreen");
var Validator = require("glsl-transition-validator");

var imagesRequiredNow = Q.defer();
var imagesP =
  // Only preload images after a page time load or if it is required now
  Q.race([ Qstart.delay(400), imagesRequiredNow.promise ])
  .then(function () {
    return Q.all([
      Qimage("/assets/images/gallery/1.jpg"),
      Qimage("/assets/images/gallery/2.jpg")
    ]);
  });

function show (transitions, env) {
  imagesRequiredNow.resolve();
  var validator = new Validator();
  return imagesP.then(_.bind(function (images) {
    return GalleryScreen({
      env: env,
      pageSize: 12,
      images: images,
      thumbnailWidth: 300,
      thumbnailHeight: 200,
      transitions: _.filter(transitions, validator.validate)
    });
  }, this));
}

function init () {
  return {
    show: show
  };
}

module.exports = init;
