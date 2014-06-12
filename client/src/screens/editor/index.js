var _ = require("lodash");
var Q = require("q");
var Qstart = require("qstart");
var EditorScreen = require("./EditorScreen");
var Images = require("../../images");
var resolveTextureUniforms = require("../../images/resolveTextureUniforms");

var imagesRequiredNow = Q.defer();
var imagesP =
  // Only preload images after a page time load or if it is required now
  Q.race([ Qstart.delay(1200), imagesRequiredNow.promise ])
  .then(function () {
    return Images.allImagesForFormat("editor");
  });

function show (transition, env) {
  imagesRequiredNow.resolve();
  var uniformsResolved = resolveTextureUniforms(transition.uniforms);
  return uniformsResolved.then(function () {
    return imagesP.then(_.bind(function (images) {
      return EditorScreen({
        key: "transition-"+transition.id,
        env: env,
        initialTransition: transition,
        images: images,
        previewWidth: 256,
        previewHeight: 256
      });
    }, this));
  });
}

function init () {
  return {
    show: show
  };
}

module.exports = init;
