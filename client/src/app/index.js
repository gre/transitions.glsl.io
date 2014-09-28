var _ = require("lodash");
var Q = require("q");
var GlslTransition = require("glsl-transition");

var app = require("../core/app");
var router = require("../core/router");
var cache = require("../core/cache");
var Link = require("../ui/Link");
var TexturePicker = require("../ui/UniformComponentInput/TexturePicker");
var screens = require("./screens");
var model = require("./models");

Link.setRouter(router);
Link.excludePath("/logout");
Link.excludePath("/authenticate");
TexturePicker.setOverlayFunction(app.overlay);

function reload () {
  return app.reload();
}

function redirect (url) {
  app.router.url = url;
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

  '/': function home () {
    if (GlslTransition.isSupported()) {
      var page = parseInt(this.query.page||0, 10);
      if (isNaN(page)) page = 0;
      return Q()
        .then(model.getGalleryTransitions) // FIXME in the future we may use the snapshot version
        .then(function (transitions) {
          return {
            transitions: transitions,
            page: page
          };
        })
        .then(_.bind(app.show, app, "home"));
    }
    else {
      redirect("/blog");
    }
  },

  '/gallery': function gallery () {
    var sort = this.query.sort || "mix";
    var page = parseInt(this.query.page||0, 10);
    var mode = this.query.mode;
    if (isNaN(page)) page = 0;
    return Q(sort)
      .then(model.getGalleryTransitions)
      .then(function (transitions) {
        return {
          transitions: transitions,
          page: page,
          sort: sort,
          mode: mode
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

