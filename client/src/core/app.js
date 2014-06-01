/**
 * Helpers for the workflow of the "app"
 */

var Q = require("q");
var _ = require("lodash");
var env = require("../env");
var dom = require("./dom");
var router = require("./router");
var catchAllLinks = require("./catchAllLinks");

var React = require("react");
var App = require("../ui/app");
var appComponent;


/**
 * FIXME: remove toolbar
 */

var $screen = dom.screen;
var $toolbar = dom.toolbar;
var screensD = Q.defer();
var screensPromise = screensD.promise;

var allReady = screensPromise.then(function(screens){
  return Q.all(_.compact(_.pluck(_.values(screens), "ready")))
    .thenResolve(screens);
});

function display (maybeNode, value) {
  if (maybeNode) {
    maybeNode.style.display = value;
  }
}

var screens;
var currentlyShowing = Q();
var current;
function show (screen, args) {
  document.body.className = "loading";
  $screen.innerHTML = "";
  $toolbar.innerHTML = "";
  currentlyShowing = Q.all([
    Q.fcall(function(){
      if (current) {
        var s = screens[current];
        display(s.$, "none");
        if (s.hide) return s.hide();
      }
    }),
    Q.fcall(function(){
      current = screen;
      var s = screens[screen];
      return s.show(args);
    })
    .then(function (nodes) {
      document.body.className = "current-"+screen; // FIXME remove?
      // $screen.appendChild(nodes.elt);
      if ("toolbar" in nodes) {
        $toolbar.removeAttribute("hidden");
        $toolbar.appendChild(nodes.toolbar);
      }
      else {
        $toolbar.setAttribute("hidden", "hidden");
      }
      return appComponent.setScreen({
        /*
        nodes.elt ?
        nodes.elt.innerHTML :
        */
        inner: nodes,
        name: screen
      });
    })
    .then(function () {
      var s = screens[current];
      if (s.afterShow) s.afterShow(args);
    })
  ]);
  return currentlyShowing;
}

function init (_screens, _routes) {
  appComponent = React.renderComponent(App({
    env: env
  }), document.body);
  catchAllLinks().bind();
  screens = _.mapValues(_screens, function (f) {
    return f();
  });
  screensD.resolve(screens);
  return allReady.then(function () {
    return router.init(_routes, function () {
      show("error", "Not Found");
    });
  });
}

module.exports = {
  init: init,
  show: show,
  allReady: allReady
};
