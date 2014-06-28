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

function redirect (url) {
  window.location.href = url;
}

function clearCacheAndReload () {
  cache.clear();
  return reload();
}

function validLinksForArticle (a) {
  var encodedTitle = encodeURIComponent(a.title.replace(/ /g, "_"));
  return [
    a.year+"/"+a.month+"/"+encodedTitle,
    a.year+"/"+a.month+"/"+a.day+"/"+encodedTitle,
    encodedTitle
  ];
}

function articlesWithLinks () {
  return model.articles()
    .then(function (articles) {
      return _.map(articles, function (a) {
        return _.extend({ url: "/blog/"+validLinksForArticle(a)[0] }, a);
      });
    });
}

function needAuthentification (f) {
  return function () {
    if (app.env.user) {
      return f.apply(this, arguments);
    }
    else {
      return redirect("/authenticate");
    }
  };
}

function user (u, me) {
  var page = parseInt(this.query.page||0, 10);
  if (isNaN(page)) page = 0;
  return Q(u)
    .then(model.getUserTransitions)
    .then(function (transitions) {
      return {
        transitions: transitions,
        user: u,
        publicPage: !me,
        page: page
      };
    })
    .then(_.bind(app.show, app, me ? "me" : "user"));
}

var run = app.init(screens, {

  '/': function gallery () {
    var page = parseInt(this.query.page||0, 10);
    if (isNaN(page)) page = 0;
    return Q()
      .then(model.getGalleryTransitions)
      .then(function (transitions) {
        return {
          transitions: transitions,
          page: page
        };
      })
      .then(_.bind(app.show, app, "gallery"));
  },

  '/user/:user': user,

  '/me': needAuthentification(function () {
    return user.call(this, app.env.user, true);
  }),

  '/blog': function blog() {
    return articlesWithLinks()
      .then(_.bind(app.show, app, "blog"));
  },

  '/blog/?(.*)?': function blog (path) {
    return articlesWithLinks()
      .then(function (articles) {
        return _.find(articles, function (a) {
          return _.contains(validLinksForArticle(a), path);
        }) || Q.reject(new Error("Article Not Found"));
      })
      .then(_.bind(app.show, app, "blog"));
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
