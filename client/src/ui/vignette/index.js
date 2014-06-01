/** @jsx React.DOM */
var React = require("react");
var TransitionViewer = require("../../transitionViewer");

// TODO: use states ?
// TODO: takes a TransitionViewer parameter ?

var Vignette = React.createClass({

  render: function() {
    var dpr = window.devicePixelRatio || 1;
    var width = this.props.width;
    var height = this.props.height;

    return (
    <div className="vignette" style={{width: width+"px", height: height+"px"}}>
      <canvas ref="render" width={width*dpr} height={height*dpr} style={{width: width+"px", height: height+"px"}}></canvas>
      <div className="overlay" ref="overlay" onMouseMove={this.onMouseMove} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
        <span className="cursor" ref="cursor"></span>
      </div>
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
    this.stop();
  },

  onMouseLeave: function () {
    this.start();
  },

  componentDidMount: function() {
    this.overlay = this.refs.overlay.getDOMNode();
    this.cursor = this.refs.cursor.getDOMNode();
    this.transitionViewer = new TransitionViewer(this.refs.render.getDOMNode());
    this.transitionViewer.setImages(this.props.images);
    this.transitionViewer.setUniforms(this.props.uniforms);
    this.transitionViewer.setGlsl(this.props.glsl);
  },

  componentWillUnmount: function() {
    this.transitionViewer.destroy();
  }

});

module.exports = Vignette;
