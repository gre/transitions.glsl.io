/** @jsx React.DOM */
var React = require("react");
var _ = require("lodash");
var GlslTransition = require("glsl-transition");
var Q = require("q");
var TransitionCanvas = require("../TransitionCanvas");
var TransitionCanvasCache = require("../TransitionCanvasCache");
var Link = require("../Link");

function circular (n, l) {
  return n < l ? n : 0;
}

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
    getTransitionViewer: React.PropTypes.func,
    controlsMode: React.PropTypes.oneOf(["hover", "mousedown"]),
    cache: React.PropTypes.shape({
      drawer: React.PropTypes.func.isRequired,
      resolution: React.PropTypes.number,
      delay: React.PropTypes.number
    })
  },

  getInitialState: function () {
    return {
      progress: this.props.defaultProgress || 0.4,
      i: 0,
      cursorEnabled: this.props.controlsMode !== "mousedown"
    };
  },

  render: function() {
    var length = this.props.images.length;
    var i = circular(this.state.i, length);
    var j = circular(i+1, length);
    var from = this.props.images[i];
    var to = this.props.images[j];
    var OverlayElement = this.props.href ? Link : React.DOM.div;

    var transitionCanvas = (
      this.props.cache ?
      <TransitionCanvasCache ref="transition" progress={this.state.progress} width={this.props.width} height={this.props.height} glsl={this.props.glsl} uniforms={this.props.uniforms} from={from} to={to} drawer={this.props.cache.drawer} resolution={this.props.cache.resolution} delay={this.props.cache.delay} />
      :
      <TransitionCanvas ref="transition" progress={this.state.progress} width={this.props.width} height={this.props.height} glsl={this.props.glsl} uniforms={this.props.uniforms} from={from} to={to} />
    );

    return (
    <div className="vignette" style={{width: this.props.width+"px", height: this.props.height+"px"}}>
      {transitionCanvas}
      {this.props.children}
      <OverlayElement href={this.props.href} className="overlay" ref="overlay" onMouseDown={this.onMouseDown} onMouseUp={this.onMouseUp} onMouseMove={this.onMouseMove} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
        <span className="cursor" ref="cursor" style={{ display: this.state.cursorEnabled ? "block" : "none", left: (this.state.progress * 100)+"%" }}></span>
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

  onMouseDown: function (e) {
    if (this.props.controlsMode === "mousedown") {
      e.preventDefault();
      this.setState({
        cursorEnabled: true
      });
      this.setProgress(this.progressForEvent(e));
    }
  },

  onMouseUp: function () {
    if (this.props.controlsMode === "mousedown") {
      this.setState({
        cursorEnabled: false
      });
      this.maybeRestart();
    }
  },

  onMouseMove: function (e) {
    if (this.props.controlsMode !== "mousedown" || this.state.cursorEnabled) {
      e.preventDefault();
      this.setProgress(this.progressForEvent(e));
    }
  },

  onMouseEnter: function (e) {
    if (this.props.controlsMode !== "mousedown") {
      if (this.props.autostart || this.props.startonleave)
        this.stop();
      this.setProgress(this.progressForEvent(e));
    }
  },

  onMouseLeave: function () {
    if (this.props.controlsMode === "mousedown") {
      if (this.state.cursorEnabled) {
        this.setState({
          cursorEnabled: false
        });
        this.maybeRestart();
      }
    }
    else {
      this.maybeRestart();
    }
  },

  maybeRestart: function () {
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
    this.refs.transition.abort();
  }
});

module.exports = Vignette;
