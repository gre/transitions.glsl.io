/** @jsx React.DOM */
var React = require("react");
var _ = require("lodash");
var Vignette = require("../Vignette");

var Slideshow = React.createClass({

  propTypes: {
    transitions: React.PropTypes.array.isRequired,
    onSlideChange: React.PropTypes.func
  },

  getDefaultProps: function () {
    return {
      onSlideChange: _.noop
    };
  },

  getInitialState: function () {
    return {
      transitionIndex: 0
    };
  },

  onTransitionPerformed: function (stats) {
    this.props.onSlideChange(stats);
    this.setState({
      transitionIndex: (this.state.transitionIndex+1) % this.props.transitions.length
    });
  },

  render: function () {
    var transition = this.props.transitions[this.state.transitionIndex];
    return this.transferPropsTo(<Vignette
      autostart={true}
      controlsMode="none"
      glsl={transition.glsl}
      uniforms={transition.uniforms}
      onTransitionPerformed={this.onTransitionPerformed}>
      <span className="title">
        <em>{transition.name}</em>
        <span> by </span>
        <strong>{transition.owner}</strong>
        </span>
    </Vignette>);
  }
});


module.exports = Slideshow;
