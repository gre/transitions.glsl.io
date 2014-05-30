var _ = require("lodash");
var Q = require("q");
if ("production" !== process.env.NODE_ENV) {
  window.React = require("react"); // Expose React for the react web console
}
var screens = require("./screens");
var app = require("./core/app");
var dom = require("./core/dom");
var env = require("./env");
var model = require("./model");

var run = app.init(screens, {

  '/': function home() {
    return app.show("home");
  },

  '/gallery': function gallery () {
    return Q()
      .then(model.getTransitions)
      .then(_.bind(app.show, app, "gallery"));
  },

  '/transition/:gistId': function openGist (id) {
    if (id === "new") {
      id = env.rootGist;
    }
    return Q(id)
      .then(model.getTransition)
      .then(_.bind(app.show, app, "editor"));
  },

  '/authenticate': "reload",

  '/logout': "reload"

});

run.fin(function () {
  dom.footer.removeAttribute("hidden");
});
run.fail(_.bind(app.show, app, "error")).done();
run.done();
