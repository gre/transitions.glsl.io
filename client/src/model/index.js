var Qajax = require("qajax");
var app = require("../core/app");
var cache = require("../core/cache");

// TODO rename to 'api'

module.exports = {
  articles: cache.getOrSetAsync("articles", 30000, function () {
    return Qajax("/api/blog/articles")
      .then(Qajax.filterSuccess)
      .then(Qajax.toJSON);
  }),

  getTransitions: cache.getOrSetAsync("gists", 30000, function () {
    return Qajax("/api/transitions")
      .then(Qajax.filterSuccess)
      .then(Qajax.toJSON)
      .then(function (transitions) {
        if (transitions.length === 0) throw new Error("no transitions in gallery. Try again.");
        return transitions;
      });
  }),

  getTransition: function (id) {
    return Qajax("/api/transitions/"+id)
      .then(Qajax.filterSuccess)
      .then(Qajax.toJSON);
  },

  createNewTransition: function () {
    cache.remove("gists");
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
    cache.remove("gists");
    return Qajax({
      method: "POST",
      url: "/api/transitions/"+transition.id,
      data: transition
    })
      .then(Qajax.filterSuccess)
      .thenResolve(undefined);
  }
};
