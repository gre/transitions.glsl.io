/**
 * A mini-framework for making multi-screen and Promise-based screens.
 */

var Q = require("q");
var _ = require("lodash");
var React = require("react");
var router = require("./router");
var App = require("../ui/app");

var app;

var initialEnv = _.clone(window.ENV);

var screens;
var currentlyShowing = Q();
var current;

function show (screen, args) {
  currentlyShowing = 
    Q.fcall(function(){
      current = screen;
      var s = screens[screen];
      return s.show(args, app ? app.state.env : initialEnv);
    })
    .then(function (nodes) {
      var s = {
        inner: nodes,
        name: screen
      };
      if (!app) {
        var d = Q.defer();
        app = React.renderComponent(App({
          initialEnv: initialEnv,
          initialScreen: s
        }), document.body, d.resolve);
        return d.promise;
      }
      else {
        return app.setStateQ({
          screen: s
        });
      }
    })
    .fail(function (err) {
      if (screen !== "error") {
        return show("error", err);
      }
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
  overlay: function (cbOrBool) {
    return app.setStateQ({
      overlay: cbOrBool
    });
  },
  get env () {
    return !app ? initialEnv : app.state.env;
  },
  set env (e) {
    app.setStateQ({
      env: e
    }).done();
  }
};
