/** @jsx React.DOM */
var React = require("react");
var Button = require("../Button");
var StatusMessage = require("../StatusMessage");

var SaveButton = React.createClass({
  propTypes: {
    f: React.PropTypes.func.isRequired
  },
  render: function () {
    return <span className="save-button">
      <Button className="save-transition action primary" f={this.props.f} disabled={this.props.disabled}>
        <i className="if-active fa fa-circle-o-notch fa-spin"></i><i className="if-not-active fa fa-cloud-upload"></i>
        &nbsp;
        {this.props.children || "Save"}
      </Button>
      &nbsp;
      <StatusMessage type={this.props.status}>{this.props.statusMessage}</StatusMessage>
    </span>;
  }
});

module.exports = SaveButton;

