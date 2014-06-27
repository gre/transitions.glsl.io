var _ = require("lodash");
var Q = require("q");
var Images = require("../../images");
var Qstart = require("qstart");
var UserScreen = require("./UserScreen");

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

function show (params, env) {
  imagesRequiredNow.resolve();
  return imagesP.then(_.bind(function (images) {
    return UserScreen({
      env: env,
      images: images,
      user: params.user,
      transitions: params.transitions,
      pageSize: 12,
      thumbnailWidth: 300,
      thumbnailHeight: 200
    });
  }, this));
}

function init () {
  return {
    show: show
  };
}

module.exports = init;

