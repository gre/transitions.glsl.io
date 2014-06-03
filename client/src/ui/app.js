/** @jsx React.DOM */

var _ = require("lodash");
var Q = require("q");
var React = require("react");
var Header = require("./Header");
var Footer = require("./Footer");
var ScreenContainer = require("./ScreenContainer");

// FIXME improve how the setScreen works.
var App = React.createClass({
  propTypes: {
    env: React.PropTypes.object.isRequired
  },
  getInitialState: function () {
    return {
      screen: {
        name: "none",
        inner: <div />
      }
    };
  },
  setScreen: function (screen) {
    var d = Q.defer();
    this.setState({
      screen: screen
    }, d.resolve);
    return d.promise;
  },
  render: function () {
    var inner = this.state.screen.inner;
    return <div id="wrapper">
      <Header user={this.props.env.user} />
      <ScreenContainer name={this.state.screen.name}>{inner}</ScreenContainer>
      <Footer version={this.props.env.version} />
    </div>;
  }
});

module.exports = App;
