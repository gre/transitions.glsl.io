/** @jsx React.DOM */
var React = require("react");
var _ = require("lodash");
var GlslTransition = require("glsl-transition");

var validSampler2D = React.PropTypes.oneOfType([
  React.PropTypes.instanceOf(window.HTMLImageElement),
  React.PropTypes.instanceOf(window.HTMLCanvasElement)
]);

var TransitionCanvas = React.createClass({ // FIXME need to implement more cache and lazy-ness
  propTypes: {
    glsl: React.PropTypes.string.isRequired,
    from: validSampler2D,
    to: validSampler2D,
    uniforms: React.PropTypes.object.isRequired,
    width: React.PropTypes.number.isRequired, // FIXME handle width/height changes@
    height: React.PropTypes.number.isRequired,
    progress: React.PropTypes.number.isRequired
  },
  render: function () {
    var dpr = window.devicePixelRatio || 1;
    var width = this.props.width;
    var height = this.props.height;
    return (
      <canvas ref="render" width={width*dpr} height={height*dpr} style={{width: width+"px", height: height+"px"}}></canvas>
    );
  },
  componentDidMount: function () {
    this.running = 0;
    this.Transition = GlslTransition(this.getDOMNode());
    this.componentDidUpdate();
  },
  componentWillUnmount: function () {
    if (this.transition) this.transition.destroy();
    this.transition = null;
    this.Transition = null;
  },
  componentDidUpdate: function () {
    if (this.props.glsl !== this.lastGlsl) {
      this.syncGlsl();
    }
    else if (
      this.props.to !== this.lastTo ||
      this.props.from !== this.lastFrom ||
      !_.isEqual(this.props.uniforms, this.lastUniforms) ||
      this.props.progress !== this.lastProgress
    ) {
      this.syncUniforms();
    }
    this.lastTo = this.props.to;
    this.lastFrom = this.props.from;
    this.lastUniforms = this.props.uniforms;
    this.lastProgress = this.props.progress;
    this.lastGlsl = this.props.glsl;
  },
  syncGlsl: function () {
    var glsl = this.props.glsl;
    if (this.transition) {
      this.Transition.abort();
      this.transition.destroy();
    }
    this.transition = this.Transition(glsl);
    this.syncUniforms();
  },
  syncUniforms: function () {
    this.transition.reset();
    _.each(this.getAllUniforms(), function (value, u) {
      this.transition.setUniform(u, value);
    }, this);
    if (!this.running) {
      this.transition.setUniform("progress", this.props.progress);
      this.transition.draw();
    }
  },
  getAllUniforms: function () { // FIXME is that a bottleneck?
    return _.extend({ from: this.props.from, to: this.props.to }, this.props.uniforms);
  },
  animate: function (duration) {
    this.transition.reset();
    var p = this.transition(this.getAllUniforms(), duration);
    this.running++;
    p.fin(_.bind(function () {
      this.running--;
    }, this));
    return p;
  },
  abort: function () {
    this.Transition.abort();
  }
});

module.exports = TransitionCanvas;
