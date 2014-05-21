var imagesP = require("../../images").gallery;
var _ = require("lodash");
var Q = require("q");
var Qajax = require("qajax");
var ClickButton = require("../../clickbutton");
var GlslTransition = require("glsl-transition");
var TransitionViewerCache = require("../../transitionViewerCache");
var routes = require("../../routes");
var templateToolbar = require("./toolbar.hbs");
var template = require("./screen.hbs");
var env = require("../../env");
var model = require("../../model");

var WIDTH = 300;
var HEIGHT = 200;

var defaultHoverProgress = 0.4;

function show (transitions) {
  var elt = document.createElement("div");
  var toolbar = document.createElement("div");
  elt.innerHTML = template({});
  toolbar.innerHTML = templateToolbar({});

  var $gallery = elt.querySelector(".gallery");

  var dpr = window.devicePixelRatio || 1;

  return imagesP.then(function (images) {
    var previewComputations = [];
    var canvasTransition = document.createElement("canvas");
    canvasTransition.width = dpr * WIDTH;
    canvasTransition.height = dpr * HEIGHT;
    var Transition = GlslTransition(canvasTransition);

    var elements = _.map(transitions, function (transition) {
      var uniforms = _.extend({}, transition.uniforms, {
        from: images[0],
        to: images[1]
      });
      var t = Transition(transition.glsl, uniforms);

      // FIXME: refactor this stuff. React?
      var element = document.createElement("div");
      element.className = "vignette "+(transition.starred ? "starred" : "");
      transition.syncChange("starred", function (s) {
        element.classList.toggle("starred", s);
      });
      var canvas = document.createElement("canvas");
      canvas.width = canvasTransition.width;
      canvas.height = canvasTransition.height;
      element.appendChild(canvas);
      var overlay = document.createElement("div");
      overlay.className = "overlay";
      var stars = document.createElement("span");
      stars.className = "stars";
      stars.title = "Click to star/unstar";
      var starsIcon = document.createElement("i");
      starsIcon.className = "stars-icon fa fa-star";
      var starsCount = document.createElement("span");
      starsCount.className = "stars-count";
      transition.syncChange("stars", function (s) {
        starsCount.textContent = s;
      });
      stars.appendChild(starsCount);
      stars.appendChild(starsIcon);
      element.appendChild(stars);
      var title = document.createElement("span");
      title.className = "title";
      var tname = document.createElement("em");
      tname.textContent = transition.name;
      var tauthor = document.createElement("strong");
      tauthor.textContent = transition.owner;
      title.appendChild(tname);
      title.appendChild(document.createTextNode(" by "));
      title.appendChild(tauthor)
      element.appendChild(title);
      element.appendChild(overlay);
      var cursor = document.createElement("span");
      cursor.className = "cursor";
      overlay.appendChild(cursor);

      var transitionViewerCache = new TransitionViewerCache(function (p) {
        if (t.reset()) {
          _.each(uniforms, function (value, u) {
            t.setUniform(u, value);
          });
        }
        t.setUniform("progress", p);
        t.draw();
        return canvasTransition;
      }, canvas, 50);

      if ("ontouchstart" in document) {
        // FIXME: the current mobile support is pretty unfinished...
        element.addEventListener("touchstart", function (e) {
          element.classList.add("swiping");
          e.preventDefault();
        }, false);
        element.addEventListener("touchmove", function (e) {
          e.preventDefault();
          // FIXME find the right touch
          // TODO skip when swiping enough vertically (scroll detected)
          var p = (e.changedTouches[0].clientX - element.getBoundingClientRect().left) / element.clientWidth;
          cursor.style.left = (p * 100)+"%";
          p = p * 1.06 - 0.03; // Make the edges more accessible
          transitionViewerCache.hover(p);
        }, false);
        element.addEventListener("touchend", function () {
          element.classList.remove("swiping");
          transitionViewerCache.hover(defaultHoverProgress);
        }, false);
        element.addEventListener("touchcancel", function () {
          element.classList.remove("swiping");
          transitionViewerCache.hover(defaultHoverProgress);
        }, false);
      }
      else {
        overlay.addEventListener("mousemove", function (e) {
          var p = (e.clientX - overlay.getBoundingClientRect().left) / overlay.clientWidth;
          cursor.style.left = (p * 100)+"%";
          p = p * 1.06 - 0.03; // Make the edges more accessible
          transitionViewerCache.hover(p);
        }, false);
        overlay.addEventListener("mouseenter", function () {
        }, false);
        overlay.addEventListener("mouseleave", function () {
          transitionViewerCache.hover(defaultHoverProgress);
        }, false);
      }

      previewComputations.push(function(){
        transitionViewerCache.hover(defaultHoverProgress);
      });
      return element;
    });

    _.each(_.zip(elements, transitions), function (o) {
      var element = o[0], transition = o[1];
      ClickButton({
        el: element.querySelector(".overlay"),
        f: function () {
          return routes.route("/transition/"+transition.id);
        }
      }).bind();
    });

    _.each(_.zip(elements, transitions), function (o) {
      var element = o[0], transition = o[1];
      ClickButton({
        el: element.querySelector(".stars"),
        f: function () {
          element.classList.add("starred-loading");
          return Q.fcall(function(){
            if (transition.starred) {
              return Qajax({
                url: "/api/transitions/"+transition.id+"/star",
                method: "DELETE"
              })
              .then(Qajax.filterSuccess)
              .then(function () {
                transition.starred = false;
                transition.stars --;
                element.classList.remove("starred");
              });
            }
            else {
              return Qajax({
                url: "/api/transitions/"+transition.id+"/star",
                method: "PUT"
              })
              .then(Qajax.filterSuccess)
              .then(function () {
                transition.starred = true;
                transition.stars ++;
                element.classList.add("starred");
              });
            }
          })
          .fin(function () {
            element.classList.remove("starred-loading");
          });
        }
      }).bind();
    });

    $gallery.innerHTML = "";
    _.each(elements, function (element) {
      $gallery.appendChild(element);
    });

    _.reduce(previewComputations, function (promise, computation) {
      return promise.delay(50).then(computation);
    }, Q());

    return { elt: elt, toolbar: toolbar };
  });
}

function init () {
  return {
    show: show
  };
}

module.exports = init;
