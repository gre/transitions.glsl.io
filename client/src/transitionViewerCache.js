var _ = require("lodash");
var Q = require("q");
var requestAnimationFrame = require("raf");

// FIXME: refactor by extending transitionViewer ?

function screenshot (canvas) {
  var c = document.createElement("canvas");
  c.width = canvas.width;
  c.height = canvas.height;
  var ctx = c.getContext("2d");
  ctx.drawImage(canvas, 0, 0);
  return c;
}

/**
 * FIXME: While the caching is slow,
 * we may need a smarter moment to render it;
 */

function TransitionViewerCache (hover, canvas, resolution) {
  this.canvas = canvas;
  this.ctx = canvas.getContext("2d");
  this.resolution = resolution || 100;
  this.canvases = _.memoize(function (i) {
    return screenshot(hover(i/this.resolution));
  });
  this.stopRequested = 0;
  this.loopI = 1;
}

TransitionViewerCache.prototype = {
  destroy: function () {
    this.canvas = null;
    this.ctx = null;
    this.canvases = null;
  },
  setProgress: function (p) {
    var i = Math.floor(p * this.resolution);
    var canvas = this.canvases(i);
    if (canvas) {
      this.ctx.drawImage(canvas, 0, 0);
    }
  },
  animate: function (duration) {
    var d = Q.defer();
    var start = Date.now();
    var self = this;
    requestAnimationFrame(function loop () {
      var p = (Date.now() - start) / duration;
      if (p<1) {
        requestAnimationFrame(loop);
        self.setProgress(p);
      }
      else {
        self.setProgress(1);
        d.resolve();
      }
    });
    return d.promise;
  },
  hover: function (p) {
    p = Math.max(0, Math.min(p, 1));
    this.stop();
    this.setProgress(p);
  },
  start: function () {
    var self = this;
    this.loopI++;
    var id = this.loopI;
    (function loop () {
      if (id !== self.loopI) return;
      if (self.stopRequested >= id) {
        self.stopRequested = 0;
        return;
      }
      Q.fcall(_.bind(self.animate, self, 1500))
        .delay(500)
        .then(loop);
    }());
  },
  stop: function () {
    if (this.stopRequested) return;
    this.stopRequested = this.loopI;
  }
};

module.exports = TransitionViewerCache;
