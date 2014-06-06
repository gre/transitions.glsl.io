
var _ = require("lodash");
var Qajax = require("qajax");
var env = require("../env");

module.exports = {
  getTransitions: function () {
    return Qajax("/api/transitions")
      .then(Qajax.filterSuccess)
      .then(Qajax.toJSON)
      .then(function (gists) {
        return gists;
        //return _.map(gists, Transition.fromServerData);
      });
  },

  getTransition: function (id) {
    return Qajax("/api/transitions/"+id)
      .then(Qajax.filterSuccess)
      .then(Qajax.toJSON);
      //.then(Transition.fromServerData);
  },

  createNewTransition: function () {
    return Qajax({
      method: "POST",
      url: "/api/transitions",
      data: {
        fork: env.rootGist
      }
    })
      .then(Qajax.filterSuccess)
      .then(Qajax.toJSON);
  },
  saveTransition: function (transition) {
    return Qajax({
      method: "POST",
      url: "/api/transitions/"+transition.id,
      data: transition//.toServerData()
    })
      .then(Qajax.filterSuccess)
      .thenResolve(undefined);
  }
};
