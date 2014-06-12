var _ = require("lodash");
var Q = require("q");
var textures = require("./textures");

var lazyLoadingImages = {};
var lazyLoadedImages = {};

function filterUniforms (uniforms) {
 return _.omit(uniforms, function (u) { return typeof u !== "string"; });
}

function loadTexture (name) {
  if (lazyLoadingImages[name]) return lazyLoadingImages[name];
  var maybeImage = Q.fcall(function () {
    return textures.getImage(name);
  });
  lazyLoadingImages[name] = maybeImage;
  maybeImage.then(function (img) {
    lazyLoadedImages[name] = img;
  }, function (e) {
    console.log("Cannot load '"+name+"' :"+e);
    lazyLoadedImages[name] = null;
  }).done();
  return maybeImage;
}

function resolveTextureUniforms (uniforms) {
  var all = _.clone(uniforms);
  var textureUniforms = filterUniforms(all);
  return Q.all(_.map(textureUniforms, function (textureName, key) {
    return loadTexture(textureName).then(function (img) {
      return [ key, img ];
    }, function () {
      return [ key, null ];
    });
  })).then(function (pairsOfTextures) {
    return _.extend(all, _.object(pairsOfTextures));
  });
}

function getTextureOrNull (name) {
  loadTexture(name);
  if (name in lazyLoadedImages)
    return lazyLoadedImages[name];
  else
    return null;
}

function resolveTextureUniformsSync (uniforms) {
  var all = _.clone(uniforms);
  var textureUniforms = filterUniforms(all);
  return _.extend(all, _.mapValues(textureUniforms, getTextureOrNull));
}

resolveTextureUniforms.sync = resolveTextureUniformsSync;

module.exports = resolveTextureUniforms;
