/** @jsx React.DOM */
var React = require("react");
var TransitionCanvas = require("../ui/TransitionCanvas");
var PromisesMixin = require("../mixins/Promises");
var GlslTransitionCore = require("glsl-transition-core");

var PlayButton = React.createClass({
  render: function () {
    return <div className="play-button-container" onClick={this.props.onClick}>
      <div className="play-button" style={{ marginTop: this.props.y }}>
        {this.props.children}
      </div>
    </div>;
  }
});

var LinearPlayer = React.createClass({
  mixins: [ PromisesMixin ],
  propTypes: {
    from: React.PropTypes.instanceOf(window.HTMLImageElement).isRequired,
    to: React.PropTypes.instanceOf(window.HTMLImageElement).isRequired,
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    duration: React.PropTypes.number.isRequired,
    transition: React.PropTypes.object.isRequired // FIXME better validation to put in a shared module
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

    return <div className={"linear-player "+(this.state.running ? "running" : "")} style={{width:width+"px", height:height+"px"}}>
      <header>
        <a className="name" href={"/transition/"+transition.id} target="_blank">{ transition.name }</a>
        <span> by </span>
        <a className="owner" href={"/user/"+transition.owner} target="_blank">{ transition.owner }</a>
      </header>
      { !GlslTransitionCore.isSupported() ?
        <div className="error">
          <h2>
          WebGL is not supported.
          </h2>
          <p>
            Supported browsers: Chrome, Firefox, IE 11+, iOS 8+, Android 4+, Opera,...
          </p>
        </div>
        :
        <div>
          <TransitionCanvas ref="transition"
            progress={0.4}
            width={width}
            height={height}
            glsl={transition.glsl}
            uniforms={transition.uniforms}
            from={from}
            to={to}
          />
          { !this.state.running ?
          <PlayButton onClick={this.start} y={Math.floor(38+(height-40-38)/2)}>▶</PlayButton>
          : ''}
        </div>
      }
    </div>;
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

module.exports = LinearPlayer;
