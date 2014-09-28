var Q = require("q");
var _ = require("lodash");
var Url = require("url");
var Images = require("../../../glslio/images");
var GalleryScreen = require("./GalleryScreen");
var app = require("../../../core/app");


var modes = {
  "normal": {
    pageSize: 12,
    thumbnailWidth: 300,
    thumbnailHeight: 200,
    images: function () {
      return Q.all([
        Images.getImage(0, "gallery"),
        Images.getImage(1, "gallery")
      ]);
    },
    expandTransition: function (transition, props) {
      var i = props.transitions.indexOf(transition);
      var url = {
        pathname: app.router.url.pathname,
        query: _.defaults({ page: i, mode: "big" }, app.router.url.query)
      };
      app.router.url = Url.format(url);
    }
  },
  "big": {
    pageSize: 1,
    thumbnailWidth: 1024 * 3/4,
    thumbnailHeight: 768 * 3/4,
    images: function () {
      return Q.all([
        Images.getImage(0, "gallery-big"),
        Images.getImage(1, "gallery-big"),
        Images.getImage(2, "gallery-big")
      ]);
    },
    transitionPreviewProps: {
      autostart: true,
      cache: null
    }
  }
};

// Trigger a preload after some time for predictively going to gallery
Q.delay(400).then(modes.normal.images).done();

function show (args, env) {
  var mode = modes[args.mode] || modes.normal;
  return mode.images().then(function (images) {
    return GalleryScreen(_.defaults({
      env: env,
      images: images,
      transitions: args.transitions,
      page: args.page,
      sort: args.sort
    }, mode));
  });
}

function init () {
  return {
    title: function () {
      return "Gallery";
    },
    show: show
  };
}

module.exports = init;
