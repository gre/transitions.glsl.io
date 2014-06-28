
var Url = require("url");
var Router = require("director").Router;

var _ = require("lodash");
var Q = require("q");
var Qdebounce = require("qdebounce");

var currentPromise;
var _url;
var _router;
var _ignoreNext = false; // FIXME this is for a workaround – to be removed

function routeFunction (r) {
  if (!_ignoreNext && window.onbeforeunload) {
    if (!window.confirm(window.onbeforeunload())) {
      return currentPromise;
    }
  }
  _router.setRoute(r);
  return currentPromise;
}

function computeUrl () {
  return Url.parse(window.location.href, true);
}

function reload () {
  return routeFunction(window.location.pathname);
}

var route = Qdebounce(function (f, ctx, args, next) {
  console.log(ctx.path+" -> "+f.name, args);
  if (_ignoreNext) {
    currentPromise = Q();
    _ignoreNext = false;
  }
  else
    currentPromise = Q.fapply(_.bind(f, ctx), args);
  currentPromise.fin(function () {
    next(false);
  });
  return currentPromise;
}, 20);

var Qroute = function (f) {
  return function () {
    var next = _.last(arguments);
    var args = _.initial(arguments);
    var ctx = (_url = computeUrl());
    return route(f, ctx, args, next);
  };
};

module.exports = {
  init: function (routes, notFound) {
    _url = computeUrl();
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
  route: routeFunction,
  overridesUrl: function (url) { // FIXME this is a workaround for now
    _ignoreNext = true;
    routeFunction(url);
  },
  get url () {
    return _url;
  }
};
