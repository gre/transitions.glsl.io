/** @jsx React.DOM */
var React = require("react");
var Vignette = require("../../../ui/Vignette");
var GLSLio = require("../../../ui/Logo");

var HomeScreen = React.createClass({

  propTypes: {
    env: React.PropTypes.object.isRequired,
    transitions: React.PropTypes.array.isRequired,
    images: React.PropTypes.array.isRequired
  },

  getInitialState: function () {
    return {
      transitionIndex: 0
    };
  },

  onTransitionPerformed: function (stats) {
    console.log(stats.frames && "fps: "+Math.round(1000*stats.frames/stats.elapsedTime) || stats);
    this.setState({
      transitionIndex: (this.state.transitionIndex+1) % this.props.transitions.length
    });
  },

  render: function () {
    var transition = this.props.transitions[this.state.transitionIndex];
    return <div className="home-screen">
      <h2>
        WebGL Transitions for your images slideshow
      </h2>
      <Vignette
        images={this.props.images}
        autostart={true}
        controlsMode="none"
        width={512}
        height={384}
        glsl={transition.glsl}
        uniforms={transition.uniforms}
        onTransitionPerformed={this.onTransitionPerformed}>
        <span className="title">
          <em>{transition.name}</em>
          <span> by </span>
          <strong>{transition.owner}</strong>
          </span>
      </Vignette>
      <p>
        This slideshow shows all transitions created by <strong><GLSLio /></strong> contributors!
      </p>

    </div>;
  }

});

module.exports = HomeScreen;

