/** @jsx React.DOM */

var React = require("react");
var ScreenContainer = React.createClass({
  render: function () {
    console.log(this.props.screen.name);
    return <div id="main" className={"screen-"+this.props.screen.name}>{this.props.screen.inner}</div>;
  }
});
module.exports = ScreenContainer;
