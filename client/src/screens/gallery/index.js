var _ = require("lodash");
var Q = require("q");
var Images = require("../../images");
var resolveTextureUniforms = require("../../images/resolveTextureUniforms");
var Qstart = require("qstart");
var GalleryScreen = require("./GalleryScreen");
var Validator = require("glsl-transition-validator");

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

function show (transitions, env) {
  imagesRequiredNow.resolve();
  var validator = new Validator();
  var validatedTransitions = _.filter(transitions, validator.validate);

  var transitionsWithTexturesResolved = Q.all(_.map(validatedTransitions, function (transition) {
    return resolveTextureUniforms(transition.uniforms)
      .then(function (uniforms) {
        return _.defaults({ uniforms: uniforms }, transition);
      });
  }));

  return transitionsWithTexturesResolved.then(function (resolvedTransitions) {
    return imagesP.then(_.bind(function (images) {
      return GalleryScreen({
        env: env,
        pageSize: 12,
        images: images,
        thumbnailWidth: 300,
        thumbnailHeight: 200,
        transitions: resolvedTransitions
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
