/** @jsx React.DOM */
var React = require("react");
var _ = require("lodash");
var Q = require("q");
var Header = require("./Header");
var Footer = require("./Footer");
var Feedback = require("./Feedback");
var ScreenContainer = require("./ScreenContainer");
var PromisesMixin = require("../mixins/Promises");

var App = React.createClass({
  propTypes: {
    initialScreen: React.PropTypes.object.isRequired,
    initialEnv: React.PropTypes.object.isRequired
  },
  mixins: [ PromisesMixin ],
  getInitialState: function () {
    return {
      env: this.props.initialEnv,
      screen: this.props.initialScreen,
      overlay: null,
      loading: false
    };
  },
  onOverlayClose: function () {
    var task;
    if (typeof this.state.overlay === "function") {
      task = Q.fcall(this.state.overlay);
    }
    else {
      task = Q();
    }
    task
      .then(_.bind(function () {
        return this.setStateQ({
          overlay: null
        });
      }, this))
      .done();
  },
  render: function () {
    var env = this.state.env;
    var screen = this.state.screen;
    var overlay = this.state.overlay;
    return <div id="wrapper" className={overlay ? "overlayed" : ""}>
      <Header user={env.user} screenName={screen.name} loading={this.state.loading} />
      <ScreenContainer name={screen.name}>{screen.inner}</ScreenContainer>
      <Footer version={env.version} />
      <Feedback />
      <div onClick={this.onOverlayClose} id="overlay" className={overlay ? "visible": ""}></div>
    </div>;
  }
});

module.exports = App;
