/** @jsx React.DOM */
var React = require("react");
var Q = require("q");
var TransitionCanvas = require("../../ui/TransitionCanvas");
var PromisesMixin = require("../../mixins/Promises");
var LinearPlayer = require("../LinearPlayer");

function videoAction (action) {
  return function (video) {
    /*
    // Smarter way but don't seem to work properly
    var d = Q.defer();
    video.addEventListener(action, d.resolve, false);
    video[action]();
    d.promise.then(function () {
      video.removeEventListener(action, d.resolve);
    });
    return d.promise;
    */
    video[action]();
    return Q.delay(10).thenResolve(video);
  };
}

var pause = videoAction("pause");
var play = videoAction("play");
var setVideo = function (name, value) {
  return function (video) {
    video[name] = value;
    return Q.delay(10).thenResolve(video);
  };
};

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

    return (
      <LinearPlayer
        className="image-linear-player"
        width={this.props.width}
        height={this.props.height}
        transition={this.props.transition}
        running={this.state.running}
        start={this.start}>

        <TransitionCanvas ref="transition"
          progress={0.1}
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
    // return pause(video).then(setVideo("currentTime", 0)).then(play);
    return setVideo("loop", true)(video).then(play);
  },
  start: function () {
    var self = this;
    this.setStateQ({ video: 0, running: true })
      .then(function loop () {
        return Q.all([
          self._playVideo(self.props.videos[self.state.video]),
          self._playVideo(self.props.videos[self.state.video+1])
        ])
          .then(function(){
            return self.refs.transition.animate(self.props.duration);
          })
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
        return Q.all(self.props.videos.map(pause));
      })
      .fin(function(){
        return self.setState({ video: 0, running: false });
      })
      .done();
  },
  stop: function () {
    this.setState({ running: false });
    this.refs.transition.abort();
  }
});

module.exports = VideoLinearPlayer;
