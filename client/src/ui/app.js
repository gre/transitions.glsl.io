/** @jsx React.DOM */

var _ = require("lodash");
var Q = require("q");
var React = require("react");
var Header = require("./Header");
var Footer = require("./Footer");
var ScreenContainer = require("./ScreenContainer");

var App = React.createClass({
  getInitialState: function () {
    return {
      env: this.props.env,
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
    return <div id="wrapper">
      <Header user={this.state.env.user} />
      <ScreenContainer name={this.state.screen.name}>{this.state.screen.inner}</ScreenContainer>
      <Footer version={this.state.env.version} />
    </div>;
  }
});

module.exports = App;
