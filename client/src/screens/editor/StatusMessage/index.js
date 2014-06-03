/** @jsx React.DOM */
var React = require("react");

var StatusMessage = React.createClass({
  render: function () {
    return <div ref="status" class="status {this.props.type}">{this.props.message}</div>;
  },
  componentDidUpdate: function () {
    if (this.timeout) { 
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    if (this.props.type === "success") {
      this.timeout = setTimeout(_.bind(function () {
        this.refs.status.getDOMNode().className = "status";
        this.timeout = null;
      }, this), 500);
    }
  }
});

module.exports = StatusMessage;

