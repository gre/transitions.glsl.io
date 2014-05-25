var GlslTransition = require("glsl-transition");
var _ = require("lodash");

function Transition (id, uniforms, glsl, name, stars, starred, owner, comments) {
  this._f = {};
  this._prop("id", id);
  this._prop("owner", owner);
  this._prop("glsl", glsl);
  this._prop("name", name);
  this._prop("uniforms", uniforms);
  this._prop("starred", starred);
  this._prop("stars", stars);
  this._prop("comments", comments);
}

Transition.fromServerData = function (data) {
  return new Transition(data.id, data.defaults, data.glsl, data.name, data.stars||0, !!data.stars, data.owner, data.comments);
};

var validationGlslTransitionContext = GlslTransition(document.createElement("canvas"));

Transition.prototype = {
  clone: function () {
    return new Transition(this.id, _.clone(this.uniforms, true), this.glsl, this.name, this.stars, this.starred, this.owner);
  },
  equals: function (t) {
    return this.id === t.id &&
      _.isEqual(this.uniforms, t.uniforms) &&
      this.glsl === t.glsl &&
      this.name === t.name &&
      this.owner === t.owner;
  },
  toServerData: function () {
    return {
      id: this.id,
      defaults: _.clone(this.uniforms),
      glsl: this.glsl,
      name: this.name
    };
  },
  _prop: function (prop, initialValue) {
    var self = this;
    Object.defineProperty(this, prop, {
      get: function () {
        return initialValue;
      },
      set: function (v) {
        initialValue = v;
        self._dispatchChange(prop, v);
      }
    });
  },
  _dispatchChange: function (prop, s) {
    _.each(this._f[prop]||[], function (f) {
      f(s);
    });
  },
  onChange: function (prop, f) {
    this._f[prop] = (this._f[prop]||[]).concat([ f ]);
  },
  syncChange: function (prop, f) {
    this.onChange(prop, f);
    f(this[prop]);
  },
  validate: function () {
    try {
      validationGlslTransitionContext(this.glsl, this.uniforms);
      return true;
    }
    catch (e) {
      return false;
    }
  }
};

module.exports = Transition;
