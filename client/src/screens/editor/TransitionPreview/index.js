/** @jsx React.DOM */
var React = require("react");
var Vignette = require("../../../ui/Vignette");

var TransitionPreview = React.createClass({
  propTypes: {
    transition: React.PropTypes.object.isRequired
  },
  render: function () {
    var transition = this.props.transition;
    return this.transferPropsTo(
      <Vignette autostart={true} glsl={transition.glsl} uniforms={transition.uniforms}>
      </Vignette>
    );
  }
});

module.exports = TransitionPreview;

