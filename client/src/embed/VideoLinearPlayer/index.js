/** @jsx React.DOM */
var React = require("react");
var TransitionCanvas = require("../../ui/TransitionCanvas");
var PromisesMixin = require("../../mixins/Promises");
var LinearPlayer = require("../LinearPlayer");

var VideoLinearPlayer = React.createClass({
  mixins: [ PromisesMixin ],
  propTypes: {
    videos: React.PropTypes.array.isRequired,
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    duration: React.PropTypes.number.isRequired,
    transition: React.PropTypes.object.isRequired
  },
  getInitialState: function () {
    return {
      running: false,
      video: 0
    };
  },
  render: function () {
    var transition = this.props.transition;
    var width = this.props.width;
    var height = this.props.height;
    var from = this.props.videos[this.state.video];
    var to = this.props.videos[this.state.video+1];
    console.log(from, to);

    return (
      <LinearPlayer
        className="image-linear-player"
        width={this.props.width}
        height={this.props.height}
        transition={this.props.transition}
        running={this.state.running}
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
  _playVideo: function (video) {
    video.pause();
    video.currentTime = 0;
    video.play();
  },
  start: function () {
    var self = this;
    this.setStateQ({ video: 0, running: true })
      .then(function loop () {
        self._playVideo(self.props.videos[self.state.video]);
        self._playVideo(self.props.videos[self.state.video+1]);
        return self.refs.transition.animate(self.props.duration)
          .then(function () {
            var video = self.state.video + 1;
            if (video+1 >= self.props.videos.length) {
              return; // Done
            }
            else {
              return self.setStateQ({ video: video }).then(loop);
            }
          });
      })
      .fin(function () {
        self.setState({ video: 0, running: false });
      })
      .done();
  },
  stop: function () {
    this.setState({ running: false });
    this.refs.transition.abort();
  }
});

module.exports = VideoLinearPlayer;
