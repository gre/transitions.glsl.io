/** @jsx React.DOM */
var React = require("react");
var _ = require("lodash");
var Q = require("q");
var GlslTransition = require("glsl-transition");
var Link = require("../Link");

function circular (n, l) {
  return n < l ? n : 0;
}

var validSampler2D = React.PropTypes.oneOfType([
  React.PropTypes.instanceOf(window.HTMLImageElement),
  React.PropTypes.instanceOf(window.HTMLCanvasElement)
]);

var Transition = React.createClass({ // FIXME need to implement more cache and lazy-ness
  propTypes: {
    glsl: React.PropTypes.string.isRequired,
    from: validSampler2D,
    to: validSampler2D,
    uniforms: React.PropTypes.object.isRequired,
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired
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
    this.lastTo = this.props.to;
    this.lastFrom = this.props.from;
    this.onNewImages();
    this.lastUniforms = this.props.uniforms;
    this.onNewUniforms();
    this.lastProgress = this.props.progress;
    this.onNewProgress();
    this.lastGlsl = this.props.glsl;
    this.onNewGlsl();
  },
  componentWillUnmount: function () {
    if (this.transition) this.transition.destroy();
    this.transition = null;
    this.Transition = null;
  },
  componentDidUpdate: function () {
    if (this.props.to !== this.lastTo || this.props.from !== this.lastFrom) {
      this.lastTo = this.props.to;
      this.lastFrom = this.props.from;
      this.onNewImages();
    }
    if (!_.isEqual(this.props.uniforms, this.lastUniforms)) {
      this.lastUniforms = this.props.uniforms;
      this.onNewUniforms();
    }
    if (this.props.glsl !== this.lastGlsl) {
      this.lastGlsl = this.props.glsl;
      this.onNewGlsl();
    }
    if (this.props.progress !== this.lastProgress) {
      this.lastProgress = this.props.progress;
      this.onNewProgress();
    }
  },
  onNewGlsl: function () {
    var glsl = this.props.glsl;
    if (this.transition) {
      this.Transition.abort();
      this.transition.destroy();
    }
    this.transition = this.Transition(glsl);
    this.syncUniforms();
  },
  onNewUniforms: function () {
    if (this.transition) {
      this.syncUniforms();
    }
  },
  onNewImages: function () {
    if (this.transition) {
      this.syncUniforms();
    }
  },
  onNewProgress: function () {
    if (this.transition) {
      this.syncUniforms();
    }
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
  getAllUniforms: function () {
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
});

var Vignette = React.createClass({

  propTypes: {
    glsl: React.PropTypes.string.isRequired,
    images: React.PropTypes.array.isRequired,
    uniforms: React.PropTypes.object.isRequired,
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    href: React.PropTypes.string,
    autostart: React.PropTypes.bool,
    startonleave: React.PropTypes.bool,
    defaultProgress: React.PropTypes.number,
    getTransitionViewer: React.PropTypes.func
  },

  getInitialState: function () {
    return {
      progress: this.props.defaultProgress || 0.4,
      i: 0
    };
  },

  render: function() {
    var length = this.props.images.length;
    var i = circular(this.state.i, length);
    var j = circular(i+1, length);
    var from = this.props.images[i];
    var to = this.props.images[j];
    var OverlayElement = this.props.href ? Link : React.DOM.div;

    return (
    <div className="vignette" style={{width: this.props.width+"px", height: this.props.height+"px"}}>
      <Transition ref="transition" progress={this.state.progress} width={this.props.width} height={this.props.height} glsl={this.props.glsl} uniforms={this.props.uniforms} from={from} to={to} />
      {this.props.children}
      <OverlayElement href={this.props.href} className="overlay" ref="overlay" onMouseMove={this.onMouseMove} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
        <span className="cursor" ref="cursor" style={{ left: (this.state.progress * 100)+"%" }}></span>
      </OverlayElement>
    </div>
    );
  },

  componentDidMount: function() {
    this.overlay = this.refs.overlay.getDOMNode();
    this.cursor = this.refs.cursor.getDOMNode();
    if (this.props.autostart)
      this.start();
  },

  componentWillUnmount: function() {
  },

  progressForEvent: function (e) {
    return (e.clientX - this.overlay.getBoundingClientRect().left) / this.overlay.clientWidth;
  },

  setProgress: function (p) {
    this.stop();
    this.setState({
      progress: p
    });
  },

  onMouseMove: function (e) {
    this.setProgress(this.progressForEvent(e));
  },

  onMouseEnter: function (e) {
    if (this.props.autostart || this.props.startonleave)
      this.stop();
    this.setProgress(this.progressForEvent(e));
  },

  onMouseLeave: function () {
    if (this.props.autostart || this.props.startonleave)
      this.start();
    else if ("defaultProgress" in this.props)
      this.setProgress(this.props.defaultProgress);
  },

  nextFromTo: function () {
    var l = this.props.images.length;
    this.setState({
      i: circular(this.state.i+1, l)
    });
  },
  start: function () {
    var transitionDuration = this.refs.duration, transitionPause = this.refs.delay;
    var transition = this.refs.transition;
    var self = this;
    var args = arguments;
    this.restart = function () {
      return self.start.apply(self, args);
    };
    this.running = true;
    return (function loop () {
      if (!self.running) return;
      return Q.fcall(_.bind(transition.animate, transition, transitionDuration||1500))
        .delay(transitionPause||100)
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
          }
        });
    }());
  },
  stop: function () {
    this.running = false;
    this.refs.transition.Transition.abort();
  }
});

module.exports = Vignette;
