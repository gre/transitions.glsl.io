var GlslTransition = require("glsl-transition");
var _ = require("lodash");
var Q = require("q");

function TransitionViewer (canvas, Transition) {
  if (!(this instanceof TransitionViewer)) return new TransitionViewer(canvas);
  this.canvas = canvas;
  this.Transition = Transition || GlslTransition(canvas);
  this.lastHover = 0.4;
}

TransitionViewer.prototype = {
  destroy: function () {
    if (this.transition) this.transition.destroy();
    this.transition = null;
    this.canvas = null;
    this.Transition = null;
  },
  setGlsl: function (glsl, uniforms) {
    if (this.transition) {
      this.Transition.abort();
      this.transition.destroy();
    }
    this.transition = this.Transition(glsl, uniforms||{});
    if (!this.running) {
      this.hover(this.lastHover);
    }
  },
  setUniforms: function (uniforms) {
    this.uniforms = uniforms;
    this.transition.reset();
    _.each(this.getAllUniforms(), function (value, u) {
      this.transition.setUniform(u, value);
    }, this);
    if (!this.running) {
      this.transition.setUniform("progress", this.lastHover);
      this.transition.draw();
    }
  },
  setImages: function (images) {
    this.images = images;
    this.i = 0;
    this.nextFromTo();
  },
  nextFromTo: function () {
    var i = this.i, j = i;
    var l = this.images.length;
    j = i < l-1 ? i+1 : 0;
    this.from = this.images[i];
    this.to = this.images[j];
    this.i = j;
  },
  getAllUniforms: function () {
    return _.extend({ from: this.from, to: this.to }, this.uniforms);
  },
  animate: function (duration) {
    this.transition.reset();
    return this.transition(this.getAllUniforms(), duration);
  },
  hover: function (p) {
    this.lastHover = p;
    this.stop();
    this.transition.reset();
    _.each(this.getAllUniforms(), function (value, u) {
      this.transition.setUniform(u, value);
    }, this);
    this.transition.setUniform("progress", p);
    this.transition.draw();
  },
  start: function (transitionDuration, transitionPause) {
    var self = this;
    var args = arguments;
    this.restart = function () {
      return self.start.apply(self, args);
    };
    this.running = true;
    return (function loop () {
      if (!self.running) return;
      return Q.fcall(_.bind(self.animate, self, transitionDuration||1500))
        .delay(transitionPause||0)
        .then(function () {
          self.nextFromTo();
        })
        .then(loop)
        .fail(function(e){
          // Recover an interrupted animation
          if (e instanceof GlslTransition.TransitionAbortedError) {
            return Q.delay(200).then(loop);
          }
          else {
            console.log("TransitionViewer transition anormally aborted", e.stack);
            return Q.delay(2000).then(loop);
          }
        });
    }());
  },
  stop: function () {
    this.running = false;
    this.Transition.abort();
  }
};

module.exports = TransitionViewer;
