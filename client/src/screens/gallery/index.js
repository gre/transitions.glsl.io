var _ = require("lodash");
var Q = require("q");
var Images = require("../../images");
var Qstart = require("qstart");
var GalleryScreen = require("./GalleryScreen");

var imagesRequiredNow = Q.defer();
var imagesP =
  // Only preload images after a page time load or if it is required now
  Q.race([ Qstart.delay(400), imagesRequiredNow.promise ])
  .then(function () {
    return Q.all([
      Images.getImage(0, "gallery"),
      Images.getImage(1, "gallery")
    ]);
  });

function show (args, env) {
  imagesRequiredNow.resolve();
  return imagesP.then(_.bind(function (images) {
    return GalleryScreen({
      env: env,
      pageSize: 12,
      images: images,
      thumbnailWidth: 300,
      thumbnailHeight: 200,
      transitions: args.transitions,
      page: args.page
    });
  }, this));
}

function init () {
  return {
    show: show
  };
}

module.exports = init;
