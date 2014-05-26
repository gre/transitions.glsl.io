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
var Validator = require("../../validator");

var WIDTH = 300;
var HEIGHT = 200;

var defaultHoverProgress = 0.4;

var unbind;

function Paginator (collection, size, onPaginate) {
  this.collection = collection;
  this.size = size;
  this.onPaginate = onPaginate;
}

Paginator.prototype = {
  paginate: function (page) {
    this.page = page;
    this.view = _.take(_.tail(this.collection, page * this.size), this.size);
    return this.onPaginate(this.view);
  },
  hasPrev: function () {
    return this.page !== 0;
  },
  hasNext: function () {
    return (this.page+1) * this.size < this.collection.length;
  },
  fromUrlParameter: function (params) {
    this.paginate(params.page || 0);
  },
  getUrlParameter: function () {
    return { page: this.page };
  }
};

function show (transitions) {
  var validator = new Validator();
  return imagesP.then(function (images) {

    var dpr = window.devicePixelRatio || 1;

    var previewComputations = [];

    var canvasTransition = document.createElement("canvas");
    canvasTransition.width = dpr * WIDTH;
    canvasTransition.height = dpr * HEIGHT;
    var Transition = GlslTransition(canvasTransition);

    function createGlslTransition (transition) {
      var uniforms = _.extend({}, transition.uniforms, {
        from: images[0],
        to: images[1]
      });
      try {
        return {
          transition: Transition(transition.glsl, uniforms),
          uniforms: uniforms
        };
      } catch (e) {
        console.log("Invalid Transition", transition);
        console.log(e);
      }
    }

    function createPreviewList (transitions) {
      var objs = _.flatten(_.map(transitions, function (transition) {
        var glsl = createGlslTransition(transition);
        if (glsl) {
          return createPreview(transition, glsl.transition, glsl.uniforms);
        }
      }));
      var div = document.createElement("div");
      _.each(objs, function (obj) {
        div.appendChild(obj.node);
      });
      return {
        node: div,
        destroy: function () {
          _.each(objs, function (o) {
            o.destroy();
          });
          objs = null;
        }
      };
    }

    function createPreview (transition, t, uniforms) {
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
      var overlay = document.createElement("a");
      overlay.href = "/transition/"+transition.id;
      overlay.className = "overlay";
      /*
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
      */
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

      /*
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
      */

      previewComputations.push(function(){
        transitionViewerCache.hover(defaultHoverProgress);
      });
      return {
        node: element,
        destroy: function () {
          transitionViewerCache.destroy();
          t.destroy();
        }
      };
    }

    var groups = _.groupBy(transitions, function (transition) {
      var valid = validator.validate(transition);
      if (!valid) return 'invalid';
      if (transition.owner === env.user && transition.name === "TEMPLATE")
        return 'unpublished';
      return 'published';
    });

    var elt = document.createElement("div");
    var toolbar = document.createElement("div");
    elt.innerHTML = template(groups);
    toolbar.innerHTML = templateToolbar(groups);

    var publishedPreviewList, unpublishedPreviewList;

    if (groups.published) {
      var $galleryPublished = elt.querySelector(".gallery-published");
      var paginator = new Paginator(groups.published, 12, function (view) {
        $galleryPublished.innerHTML = "";
        if (this.hasPrev()) {
          var prev = document.createElement("a");
          prev.className = "page-nav prev";
          prev.textContent = "← Page "+(this.page);
          ClickButton({
            el: prev,
            f: function () {
              return paginator.paginate(paginator.page - 1);
            }
          }).bind();
          $galleryPublished.appendChild(prev);
        }
        if (publishedPreviewList) publishedPreviewList.destroy();
        publishedPreviewList = createPreviewList(view);
        $galleryPublished.appendChild(publishedPreviewList.node);
        if (this.hasNext()) {
          var next = document.createElement("a");
          next.className = "page-nav next";
          next.textContent = "Page "+(this.page+2)+" →";
          ClickButton({
            el: next,
            f: function () {
              return paginator.paginate(paginator.page + 1);
            }
          }).bind();
          $galleryPublished.appendChild(next);
        }

        _.reduce(previewComputations, function (promise, computation) {
          return promise.delay(50).then(computation);
        }, Q());
        previewComputations = [];
      });
      paginator.paginate(0);
    }

    if (groups.unpublished) {
      var $galleryUnpublished = elt.querySelector(".gallery-unpublished");
      $galleryUnpublished.innerHTML = "";
      unpublishedPreviewList = createPreviewList(groups.unpublished);
      $galleryUnpublished.appendChild(unpublishedPreviewList.node);
    }

    _.reduce(previewComputations, function (promise, computation) {
      return promise.delay(50).then(computation);
    }, Q());
    previewComputations = [];

    unbind = function () {
      if (unpublishedPreviewList) unpublishedPreviewList.destroy();
      if (publishedPreviewList) publishedPreviewList.destroy();
      $galleryPublished.innerHTML = "";
      $galleryUnpublished.innerHTML = "";
      previewComputations = null;
      glslTransitions = null;
      transitions = null;
      elements = null;
      all = null;
    }

    return { elt: elt, toolbar: toolbar };
  });
}

function init () {
  return {
    show: show,
    hide: function () {
      if (unbind) unbind(); // FIXME: a destroy() should be given by the show
    }
  };
}

module.exports = init;
