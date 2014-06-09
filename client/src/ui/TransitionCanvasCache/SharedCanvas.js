var GlslTransition = require("glsl-transition");
var _ = require("lodash");

function SharedCache () {
}

SharedCache.prototype = {
  init: function (width, height) {
    var dpr = window.devicePixelRatio || 1;
    var canvasTransition = document.createElement("canvas");
    canvasTransition.width = dpr * width;
    canvasTransition.height = dpr * height;
    var Transition = GlslTransition(canvasTransition);
    this._Transition = Transition;
    this.canvasTransition = canvasTransition;
    this.transitions = {};
  },
  destroy: function () {
    _.each(this.transitions, function (t) {
      t.transition.destroy();
    });
    this._Transition = null;
    this.transitions = null;
    this.canvasTransition = null;
  },
  clear: function () {
    _.each(this.transitions, function (t) {
      t.transition.destroy();
    });
    this.transitions = {};
  },
  getAllIds: function () {
    return _.keys(this.transitions);
  },
  getTransitionDrawer: function (id) {
    return this.transitions[id].res;
  },
  removeTransitionDrawer: function (id) {
    if (this.transitions[id]) {
      this.transitions[id].transition.destroy();
      delete this.transitions[id];
    }
  },
  createTransitionDrawer: function (id, glsl) {
    var transition = this._Transition(glsl);
    if (this.transitions[id]) {
      this.transitions[id].destroy();
    }
    var res = _.bind(function (p, uniforms) {
      if (transition.reset()) {
        _.each(uniforms, function (value, u) {
          transition.setUniform(u, value);
        });
      }
      transition.setUniform("progress", p);
      transition.draw();
      return this.canvasTransition;
    }, this);
    this.transitions[id] = {
      glsl: glsl,
      transition: transition,
      res: res
    };
    return res;
  }

};

SharedCache.create = function (width, height) {
  var s = new SharedCache();
  s.init(width, height);
  return s;
};

module.exports = SharedCache;
