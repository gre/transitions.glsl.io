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
  render: function () {
    var screen = this.props.screen;
    return <div id="wrapper">
      <Header user={this.props.env.user} screenName={screen.name} />
      <ScreenContainer name={screen.name}>{screen.inner}</ScreenContainer>
      <Footer version={this.props.env.version} />
    </div>;
  }
});

module.exports = App;
