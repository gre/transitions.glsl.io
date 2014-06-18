var _ = require("lodash");
var Q = require("q");
if ("production" !== process.env.NODE_ENV) window.React = require("react"); /* Expose React for the react web console */
var screens = require("./screens");
var app = require("./core/app");
var cache = require("./core/cache");
var model = require("./model");

function reload () {
  return app.reload();
}

function clearCacheAndReload () {
  cache.clear();
  return reload();
}

// Trigger a request for predictive going in gallery
model.getTransitions();

var run = app.init(screens, {

  '/': function gallery () {
    return Q()
      .then(model.getTransitions)
      .then(_.bind(app.show, app, "gallery"));
  },

  '/about': function about() {
    return app.show("about");
  },

  '/transition/:gistId': function openGist (id) {
    if (id === "new") {
      id = app.env.rootGist;
    }
    return Q(id)
      .then(model.getTransition)
      .then(_.bind(app.show, app, "editor"));
  },

  '/authenticate': clearCacheAndReload,

  '/logout': clearCacheAndReload

}, function routeNotFound () {
  return app.show("error", "Not Found");
});

run.fail(_.bind(app.show, app, "error")).done();
run.done();
