/* FIXME ideally only index.js and index.styl should be in this src/ */

var _ = require("lodash");
var Q = require("q");
if ("production" !== process.env.NODE_ENV) window.React = require("react"); /* Expose React for the react web console */
var screens = require("./screens");
var app = require("./core/app");
var env = require("./env");
var model = require("./model");

var run = app.init(screens, {

  '/': function about() {
    return app.show("about");
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

}, function routeNotFound () {
  app.show("error", "Not Found");
});

run.fail(_.bind(app.show, app, "error")).done();
run.done();
