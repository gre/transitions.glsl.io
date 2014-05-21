
var Qajax = require("qajax");
var env = require("./env");

module.exports = {
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
      data: transition.toServerData()
    })
      .then(Qajax.filterSuccess)
      .thenResolve(undefined);
  }
};
