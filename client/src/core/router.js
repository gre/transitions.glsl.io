
var Router = require("director").Router;

var _ = require("lodash");
var Q = require("q");
var Qdebounce = require("qdebounce");

var currentPromise;

function reload () {
  return window.location.reload(); // FIXME: the reload may be trivial now we have React (no more states living everywhere)
}

var route = Qdebounce(function (fun, args, next) {
  console.log(window.location.pathname+" -> "+fun.name, args);
  currentPromise = Q.fapply(fun, args);
  currentPromise.fin(function () {
    next(false);
  });
  return currentPromise;
}, 20);

var Qroute = function (f) {
  if (f === "reload") f = reload;
  return function () {
    var next = _.last(arguments);
    var args = _.initial(arguments);
    return route(f, args, next);
  };
};

var _router;

module.exports = {
  init: function (routes, notFound) {
    _router = Router(_.mapValues(routes, Qroute)).configure({
      /*jshint -W106 */
      run_handler_in_init: true,
      html5history: true,
      async: true,
      notfound: function (next) {
        notFound();
        next(false);
      }
    });
    _router.init();
    return Q.delay(100).then(function(){
      return currentPromise;
    });
  },
  reload: reload,
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
