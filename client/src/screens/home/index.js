var Q = require("q");
var Qstart = require("qstart");
var Images = require("../../images");
var HomeScreen = require("./HomeScreen");

var imagesRequiredNow = Q.defer();
var imagesP =
  // Only preload images after a page time load or if it is required now
  Q.race([ Qstart.delay(1200), imagesRequiredNow.promise ])
  .then(function () {
    return Images.allImagesForFormat("home");
  });

function show (args, env) {
  imagesRequiredNow.resolve();
  return imagesP.then(function (images) {
    return HomeScreen({
      env: env,
      images: images,
      transitions: args.transitions,
      page: args.page
    });
  });
}

function init () {
  return {
    show: show
  };
}

module.exports = init;
