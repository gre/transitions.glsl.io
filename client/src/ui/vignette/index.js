/** @jsx React.DOM */
var React = require("react");
var TransitionViewer = require("../../transitionViewer");

// TODO: use states ?
// TODO: takes a TransitionViewer parameter ?
// TODO: need to reset the state when something changes

var Vignette = React.createClass({

  render: function() {
    var dpr = window.devicePixelRatio || 1;
    var width = this.props.width;
    var height = this.props.height;
    var href = this.props.href;

    return (
    <div className="vignette" style={{width: width+"px", height: height+"px"}}>
      <canvas ref="render" width={width*dpr} height={height*dpr} style={{width: width+"px", height: height+"px"}}></canvas>
      {this.props.children}
      <a href={href} className="overlay" ref="overlay" onMouseMove={this.onMouseMove} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
        <span className="cursor" ref="cursor"></span>
      </a>
    </div>
    );
  },

  onMouseMove: function (e) {
    var p = (e.clientX - this.overlay.getBoundingClientRect().left) / this.overlay.clientWidth;
    this.transitionViewer.hover(p);
    this.cursor.style.left = (p * 100)+"%";
  },

  start: function () {
    this.transitionViewer.start(this.refs.duration, this.refs.delay);
  },

  stop: function () {
    this.transitionViewer.stop();
  },

  onMouseEnter: function () {
    if (this.props.autostart || this.props.startonleave)
      this.stop();
  },

  onMouseLeave: function () {
    if (this.props.autostart || this.props.startonleave)
      this.start();
  },

  componentDidMount: function() {
    this.overlay = this.refs.overlay.getDOMNode();
    this.cursor = this.refs.cursor.getDOMNode();
    var render = this.refs.render.getDOMNode();
    if (this.props.getTransitionViewer) {
      this.transitionViewer = this.props.getTransitionViewer(render, images, uniforms, glsl);
    }
    else {
      this.transitionViewer = new TransitionViewer(render);
      this.transitionViewer.setImages(this.props.images);
      this.transitionViewer.setUniforms(this.props.uniforms);
      this.transitionViewer.setGlsl(this.props.glsl);
    }
    if (this.props.autostart)
      this.transitionViewer.start();
  },

  componentWillUnmount: function() {
    this.transitionViewer.destroy();
  }

});

module.exports = Vignette;
