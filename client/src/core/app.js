/**
 * A mini-framework for making multi-screen and Promise-based screens.
 */

var Q = require("q");
var _ = require("lodash");
var React = require("react");
var router = require("./router");
var App = require("../ui/app");

var env = _.clone(window.ENV);
var screens;
var currentlyShowing = Q();
var current;

function render (env, screen) {
  return React.renderComponent(App({
    env: env,
    screen: screen
  }), document.body);
}

function show (screen, args) {
  currentlyShowing = 
    Q.fcall(function(){
      current = screen;
      var s = screens[screen];
      return s.show(args, env);
    })
    .then(function (nodes) {
      return render(env, {
        inner: nodes,
        name: screen
      });
    });
  return currentlyShowing;
}


function init (_screens, _routes, routeNotFound) {
  screens = _.mapValues(_screens, function (f) {
    return f();
  });
  return Q.all(_.compact(_.pluck(_.values(screens), "ready")))
    .then(function () {
      return router.init(_routes, routeNotFound);
    })
    .fin(function () {
      document.body.className = "";
    });
}

module.exports = {
  init: init,
  show: show,
  get env () {
    return env;
  },
  set env (e) {
    env = e;
    render(env, screens[current]);
  }
};
