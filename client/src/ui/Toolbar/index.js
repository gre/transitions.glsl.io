/** @jsx React.DOM */
var React = require("react");

var Toolbar = React.createClass({
  render: function () {
    return this.transferPropsTo(
      <div className={"toolbar "+this.props.className}>{this.props.children}</div>
    );
  }
});

module.exports = Toolbar;
