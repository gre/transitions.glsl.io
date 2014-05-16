var GlslTransition = require("glsl-transition");
var _ = require("lodash");
var Q = require("q");

function TransitionViewer (canvas, Transition) {
  if (!(this instanceof TransitionViewer)) return new TransitionViewer(canvas);
  this.canvas = canvas;
  this.Transition = Transition || GlslTransition(canvas);
}

TransitionViewer.prototype = {
  setGlsl: function (glsl, uniforms) {
    this.transition = this.Transition(glsl, uniforms||{});
  },
  setUniforms: function (uniforms) {
    this.uniforms = uniforms;
    var running = this.running;
    if (running) {
      this.stop();
    }
    this.transition.reset();
    _.each(this.getAllUniforms(), function (value, u) {
      this.transition.setUniform(u, value);
    }, this);
    this.transition.draw();
    //console.log("RUNNING", running);
    if (running) {
      this.start();
    }
    else {
      this.hover(this.lastHover);
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
    //console.log("start()");
    var self = this;
    (function loop () {
      self.running = true;
      // console.log("<- true");
      Q.fcall(_.bind(self.animate, self, transitionDuration||1500))
        .delay(transitionPause||500)
        .then(function () {
          self.nextFromTo();
        })
        .then(loop)
        .fail(function(){
          // Recover an interrupted animation
          self.running = false;
          // console.log("interrupted");
          // console.log("<- false");
        });
    }());
  },
  stop: function () {
    this.Transition.abort();
  }
};

module.exports = TransitionViewer;
