/** @jsx React.DOM */

var React = require("react");
var Header = require("./Header");
var Footer = require("./Footer");
var Feedback = require("./Feedback");
var ScreenContainer = require("./ScreenContainer");

var App = React.createClass({
  propTypes: {
    env: React.PropTypes.object.isRequired,
    screen: React.PropTypes.object.isRequired
  },
  render: function () {
    var screen = this.props.screen;
    return <div id="wrapper">
      <Header user={this.props.env.user} screenName={screen.name} />
      <ScreenContainer name={screen.name}>{screen.inner}</ScreenContainer>
      <Footer version={this.props.env.version} />
      <Feedback />
    </div>;
  }
});

module.exports = App;
