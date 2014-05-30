
var Router = require("director").Router;

var _ = require("lodash");
var Q = require("q");
var Qdebounce = require("qdebounce");
var Qajax = require("qajax");
var app = require("./app");
var Transition = require("./Transition");
var env = require("./env");

function home() {
  return app.show("home");
}

function openGist (id) {
  if (id === "new") {
    id = env.rootGist;
  }
  return Qajax("/api/transitions/"+id)
    .then(Qajax.filterSuccess)
    .then(Qajax.toJSON)
    .then(function (gist) {
      return {
        gist: gist,
        transition: Transition.fromServerData(gist)
      };
    })
    .then(_.bind(app.show, app, "editor"));
}

function getTransitions () {
  return Qajax("/api/transitions")
    .then(Qajax.filterSuccess)
    .then(Qajax.toJSON)
    .then(function (gists) {
      return _.map(gists, Transition.fromServerData);
    });
}

function gallery () {
  return Q()
    .then(getTransitions)
    .then(_.bind(app.show, app, "gallery"));
}

function reload () {
  window.location.reload();
}

var routes = {
  '/': home,
  '/gallery': gallery,
  '/transition/:gistId': openGist,
  '/authenticate': reload,
  '/logout': reload
};

var currentPromise;

var route = Qdebounce(function (fun, args, next) {
  console.log(window.location.pathname+" -> "+fun.name, args);
  currentPromise = Q.fapply(fun, args);
  currentPromise.fin(function () {
    next(false);
  });
  return currentPromise;
}, 20);

var Qroute = function (f) {
  return function () {
    var next = _.last(arguments);
    var args = _.initial(arguments);
    return route(f, args, next);
  };
};

var _router = Router(_.mapValues(routes, Qroute)).configure({
  /*jshint -W106 */
  run_handler_in_init: true,
  html5history: true,
  async: true,
  notfound: function (next) {
    app.show("error", "Not Found");
    next(false);
  }
});

module.exports = {
  init: function () {
    _router.init();
    return Q.delay(100).then(function(){
      return currentPromise;
    });
  },
  reload: function () {
    return reload(); // We may find a better way later
  },
  route: function (route) {
    if (window.onbeforeunload) {
      if (!window.confirm(window.onbeforeunload())) {
        return currentPromise;
      }
    }
    _router.setRoute(route);
    return currentPromise;
  }
};
