
var _ = require("lodash");
var Qajax = require("qajax");
var app = require("../core/app");

module.exports = {
  getTransitions: function () {
    return Qajax("/api/transitions")
      .then(Qajax.filterSuccess)
      .then(Qajax.toJSON)
      .then(function (gists) {
        return gists;
      });
  },

  getTransition: function (id) {
    return Qajax("/api/transitions/"+id)
      .then(Qajax.filterSuccess)
      .then(Qajax.toJSON);
  },

  createNewTransition: function () {
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
    return Qajax({
      method: "POST",
      url: "/api/transitions/"+transition.id,
      data: transition
    })
      .then(Qajax.filterSuccess)
      .thenResolve(undefined);
  }
};
