/** @jsx React.DOM */
var React = require("react");
var _ = require("lodash");

var StatusMessage = React.createClass({
  propTypes: {
    type: React.PropTypes.oneOf([ "success", "error", "warning", "info", "unknown" ])
  },
  render: function () {
    return <div ref="status" class="status {this.props.type}">{this.props.children}</div>;
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

