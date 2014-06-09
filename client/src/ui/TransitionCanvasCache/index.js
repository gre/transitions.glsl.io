/** @jsx React.DOM */
var React = require("react");
var Q = require("q");
var _ = require("lodash");
var requestAnimationFrame = require("raf");

var validSampler2D = React.PropTypes.oneOfType([
  React.PropTypes.instanceOf(window.HTMLImageElement),
  React.PropTypes.instanceOf(window.HTMLCanvasElement)
]);

function screenshot (canvas) {
  var c = document.createElement("canvas");
  c.width = canvas.width;
  c.height = canvas.height;
  var ctx = c.getContext("2d");
  ctx.drawImage(canvas, 0, 0);
  return c;
}

var TransitionCanvasCache = React.createClass({
  propTypes: {
    glsl: React.PropTypes.string.isRequired,
    from: validSampler2D,
    to: validSampler2D,
    uniforms: React.PropTypes.object.isRequired,
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    progress: React.PropTypes.number.isRequired,
    drawer: React.PropTypes.func.isRequired,
    resolution: React.PropTypes.number
    // TODO: add a "thumbnail" image parameter
  },
  getInitialProps: function () {
    return {
      resolution: this.props.width
    };
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
    this.ctx = this.refs.render.getDOMNode().getContext("2d");
    this.sync();
  },
  componentWillUnmount: function () {
    this.clearCache();
  },
  componentDidUpdate: function () {
    this.sync();
  },
  sync: function () {
    if (this.props.glsl !== this.lastGlsl ||
      this.props.to !== this.lastTo ||
      this.props.from !== this.lastFrom ||
      !_.isEqual(this.props.uniforms, this.lastUniforms)
      ) {
      this._allUniforms = _.extend({ from: this.props.from, to: this.props.to }, this.props.uniforms);
      this.resetCache();
      this.setProgress(this.props.progress);
    }
    else if (this.props.progress !== this.lastProgress) {
      this.setProgress(this.props.progress);
    }
    this.lastTo = this.props.to;
    this.lastFrom = this.props.from;
    this.lastUniforms = this.props.uniforms;
    this.lastProgress = this.props.progress;
    this.lastGlsl = this.props.glsl;
  },
  drawer: function (i) {
    return screenshot(this.props.drawer(i / this.props.resolution, this._allUniforms));
  },
  clearCache: function () {
    if (this.canvases) {
      for (var k in this.canvases.cache) {
        delete this.canvases.cache[k];
      }
      this.canvases.cache = null;
      this.canvases = null;
    }
  },
  resetCache: function () {
    this.clearCache();
    this.canvases = _.memoize(_.bind(this.drawer, this));
  },
  setProgress: function (p) {
    var i = Math.floor(p * this.props.resolution);
    if (this.canvases) {
      var canvas = this.canvases(i);
      if (canvas) {
        this.ctx.drawImage(canvas, 0, 0);
      }
    }
  },
  animate: function (duration) {
    var d = Q.defer();
    var start = Date.now();
    var self = this;
    this.abortRequest = false;
    requestAnimationFrame(_.bind(function loop () {
      if (this.abortRequest) {
        d.reject(new Error("TransitionCanvasCache: Transition Aborted"));
        return;
      }
      var p = (Date.now() - start) / duration;
      if (p<1) {
        requestAnimationFrame(loop);
        self.setProgress(p);
      }
      else {
        self.setProgress(1);
        d.resolve();
      }
    }, this));
    return d.promise;
  },
  abort: function () {
    this.abortRequest = true;
  }
});

module.exports = TransitionCanvasCache;

