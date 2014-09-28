/**
 * A mini-framework for making multi-screen and Promise-based screens.
 */

var Q = require("q");
var _ = require("lodash");
var React = require("react");
var router = require("./router");
var App = require("../app/App");

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
      var titleF = screens[screen].title;
      document.title = "GLSL.io – "+( titleF ? titleF(args, app?app.state.env:initialEnv) : "Open Collection of GLSL Transitions" );
      if (!app) {
        var d = Q.defer();
        app = React.renderComponent(App({
          initialEnv: initialEnv,
          initialScreen: s
        }), document.body, d.resolve);
        return d.promise;
      }
      else {
        console.log("Scroll Top");
        //window.scrollTo(0, 0);
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
  var preRoute = function () {
    if (app)
      return app.setStateQ({ loading: true });
  };
  var postRoute = function () {
    if (app)
      return app.setStateQ({ loading: false });
  };
  screens = _.mapValues(_screens, function (f) {
    return f();
  });
  return Q.all(_.compact(_.pluck(_.values(screens), "ready")))
    .then(function () {
      return router.init(_routes, routeNotFound, preRoute, postRoute);
    })
    .fin(function () {
      document.body.className = "";
    });
}

module.exports = {
  init: init,
  show: show,
  router: router,
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
