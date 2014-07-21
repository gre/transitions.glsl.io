var _ = require("lodash");
var Q = require("q");
var Qajax = require("qajax");
var app = require("../../core/app");
var cache = require("../../core/cache");
var textures = require("../../glslio/images/textures");
var validator = require("../../glslio/validator");

function validateTransitionForGallery (transition) {
  var validation = validator.forGlsl(transition.glsl);
  var passes = validation.compiles();
  validation.destroy();
  return passes;
}

function resolveAllTransitions (transitions) {
  return Q.all(_.map(transitions, function (transition) {
    return textures.resolver.resolve(transition.uniforms)
    .then(function (uniforms) {
      return _.defaults({ uniforms: uniforms }, transition);
    });
  }));
}

// TODO rename to 'api'

var getGalleryTransitionsUnresolved = cache.getOrSetAsync("gallery", 30000, function () {
  return Qajax("/api/transitions")
    .then(Qajax.filterSuccess)
    .then(Qajax.toJSON)
    .then(function (transitions) {
      if (transitions.length === 0) throw new Error("no transitions in gallery. Try again.");
      return transitions;
    })
    .then(function (transitions) {
      return _.filter(transitions, validateTransitionForGallery);
    });
});

module.exports = {
  articles: cache.getOrSetAsync("articles", 30000, function () {
    return Qajax("/api/blog/articles")
      .then(Qajax.filterSuccess)
      .then(Qajax.toJSON);
  }),

  getUserTransitions: function (user) {
    var isMe = app.env.user === user;
    return Qajax("/api/user/"+encodeURIComponent(user)+"/transitions")
      .then(Qajax.filterSuccess)
      .then(Qajax.toJSON)
      .then(function (transitions) {
        if (isMe) {
          return transitions;
        }
        else {
          return _.filter(transitions, function (transition) {
            return validateTransitionForGallery(transition) &&
            transition.name !== "TEMPLATE";
          });
        }
      })
      .then(resolveAllTransitions);
  },

  getGalleryTransitions: function () {
    return getGalleryTransitionsUnresolved()
      .then(resolveAllTransitions);
  },

  getTransition: function (id) {
    return Qajax("/api/transitions/"+id)
      .then(Qajax.filterSuccess)
      .then(Qajax.toJSON);
  },

  createNewTransition: function () {
    cache.remove("gallery");
    return Qajax({
      method: "POST",
      url: "/api/transitions",
      data: {
        fork: app.env.rootGist
      }
    })
      .then(Qajax.filterSuccess)
      .then(Qajax.toJSON);
  },

  saveTransition: function (transition) {
    cache.remove("gallery");
    return Qajax({
      method: "POST",
      url: "/api/transitions/"+transition.id,
      data: transition
    })
      .then(Qajax.filterSuccess)
      .thenResolve(undefined);
  },

  starTransition: function (id) {
    return Qajax({
      method: "PUT",
      url: "/api/transitions/"+id+"/star"
    })
      .then(Qajax.filterSuccess)
      .then(Qajax.toJSON);
  },

  unstarTransition: function (id) {
    return Qajax({
      method: "DELETE",
      url: "/api/transitions/"+id+"/star"
    })
      .then(Qajax.filterSuccess)
      .then(Qajax.toJSON);
  }
};
