/** @jsx React.DOM */
var React = require("react");
var TransitionCanvas = require("../../ui/TransitionCanvas");
var PromisesMixin = require("../../mixins/Promises");
var LinearPlayer = require("../LinearPlayer");

var ImageLinearPlayer = React.createClass({
  mixins: [ PromisesMixin ],
  propTypes: {
    from: React.PropTypes.instanceOf(window.HTMLImageElement).isRequired,
    to: React.PropTypes.instanceOf(window.HTMLImageElement).isRequired,
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    duration: React.PropTypes.number.isRequired,
    transition: React.PropTypes.object.isRequired
  },
  getInitialState: function () {
    return {
      running: false,
      reversed: false
    };
  },
  render: function () {
    var transition = this.props.transition;
    var width = this.props.width;
    var height = this.props.height;
    var from = this.state.reversed ? this.props.to : this.props.from;
    var to = !this.state.reversed ? this.props.to : this.props.from;

    return (
      <LinearPlayer
        className="image-linear-player"
        width={this.props.width}
        height={this.props.height}
        transition={this.props.transition}
        running={this.state.running}
        stop={this.stop}
        start={this.start}>

        <TransitionCanvas ref="transition"
          progress={0.4}
          width={width}
          height={height}
          glsl={transition.glsl}
          uniforms={transition.uniforms}
          from={from}
          to={to}
        />

      </LinearPlayer>
    );
  },
  start: function () {
    var self = this;
    this.setStateQ({ reversed: false, running: true })
      .then(function () {
        return self.refs.transition.animate(self.props.duration);
      })
      .then(function () {
        return self.setStateQ({ reversed: true });
      })
      .then(function () {
        return self.refs.transition.animate(self.props.duration);
      })
      .fin(function () {
        self.setState({ reversed: false, running: false });
      })
      .done();
  },
  stop: function () {
    this.setState({ running: false });
    this.refs.transition.abort();
  }
});

module.exports = ImageLinearPlayer;
