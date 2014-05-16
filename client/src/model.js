
var Qajax = require("qajax");
var env = require("./env");

module.exports = {
  createNewTransition: function () {
    return Qajax({
      method: "POST",
      url: "/api/gists",
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
      url: "/api/gists/"+transition.id,
      data: transition.toServerData()
    })
      .then(Qajax.filterSuccess)
      .then(Qajax.toJSON);
  }
};
