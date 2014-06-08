/**
 * A mini-framework for making multi-screen and Promise-based screens.
 */

var Q = require("q");
var _ = require("lodash");
var router = require("./router");

var React = require("react");
var App = require("../ui/app");

var screensD = Q.defer();
var screensPromise = screensD.promise;

var allReady = screensPromise.then(function(screens){
  return Q.all(_.compact(_.pluck(_.values(screens), "ready")))
    .thenResolve(screens);
});

var env = _.clone(window.ENV);

function render (env, screen) {
  return React.renderComponent(App({
    env: env,
    screen: screen
  }), document.body);
}

var screens;
var currentlyShowing = Q();
var current;
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
  screensD.resolve(screens);
  return allReady.then(function () {
    return router.init(_routes, routeNotFound);
  })
  .fin(function () {
    document.body.className = "";
  });
}

module.exports = {
  init: init,
  show: show,
  allReady: allReady,
  get env () {
    return env;
  },
  set env (e) {
    env = e;
    render(env, screens[current]);
  }
};
