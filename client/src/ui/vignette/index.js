/** @jsx React.DOM */
var React = require("react");
var _ = require("lodash");
var TransitionViewer = require("./transitionViewer");
var Link = require("../Link");

// TODO: use more states ?
// TODO: takes a TransitionViewer parameter ?
// TODO: need to reset the state when something changes
// FIXME need to implement more cache and lazy-ness

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
      progress: this.props.defaultProgress || 0.4
    };
  },

  render: function() {
    var dpr = window.devicePixelRatio || 1;
    var width = this.props.width;
    var height = this.props.height;
    var href = this.props.href;

    var OverlayElement = href ? Link : React.DOM.div;

    return (
    <div className="vignette" style={{width: width+"px", height: height+"px"}}>
      <canvas ref="render" width={width*dpr} height={height*dpr} style={{width: width+"px", height: height+"px"}}></canvas>
      {this.props.children}
      <OverlayElement href={href} className="overlay" ref="overlay" onMouseMove={this.onMouseMove} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
        <span className="cursor" ref="cursor" style={{ left: (this.state.progress * 100)+"%" }}></span>
      </OverlayElement>
    </div>
    );
  },

  setProgress: function (p) {
    this.transitionViewer.hover(p);
    this.setState({
      progress: p
    });
  },

  progressForEvent: function (e) {
    return (e.clientX - this.overlay.getBoundingClientRect().left) / this.overlay.clientWidth;
  },

  onMouseMove: function (e) {
    this.setProgress(this.progressForEvent(e));
  },

  start: function () {
    this.transitionViewer.start(this.refs.duration, this.refs.delay);
  },

  stop: function () {
    this.transitionViewer.stop();
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
      this.transitionViewer.hover(this.props.defaultProgress);
  },

  componentDidUpdate: function () {
    if (!_.isEqual(this.props.images, this.transitionViewer.images)) this.transitionViewer.setImages(this.props.images);
    if (!_.isEqual(this.props.uniforms, this.transitionViewer.uniforms)) this.transitionViewer.setUniforms(this.props.uniforms);
    if (this.props.glsl !== this.transitionViewer.glsl) this.transitionViewer.setGlsl(this.props.glsl);
  },

  componentDidMount: function() {
    this.overlay = this.refs.overlay.getDOMNode();
    this.cursor = this.refs.cursor.getDOMNode();
    var render = this.refs.render.getDOMNode();
    if (this.props.getTransitionViewer) {
      this.transitionViewer = this.props.getTransitionViewer(render);
    }
    else {
      this.transitionViewer = new TransitionViewer(render);
    }
    this.transitionViewer.setImages(this.props.images);
    this.transitionViewer.setUniforms(this.props.uniforms);
    this.transitionViewer.setGlsl(this.props.glsl);
    if (this.props.autostart)
      this.transitionViewer.start();
  },

  componentWillUnmount: function() {
    this.transitionViewer.destroy();
  }

});

module.exports = Vignette;
