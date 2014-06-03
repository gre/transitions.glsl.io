/** @jsx React.DOM */
var React = require("react");
var Button = require("../../../ui/Button");
var StatusMessage = require("../StatusMessage");

var SaveButton = React.createClass({
  propTypes: {
    f: React.PropTypes.func.isRequired
  },
  render: function () {
    var f = this.props.f;
    return <span class="save-button">
      <Button className="save-transition action primary" f={f}>
        <i class="if-active fa fa-circle-o-notch fa-spin"></i><i class="if-not-active fa fa-cloud-upload"></i>
        {this.props.children || "Save"}
      </Button>
      <StatusMessage type={this.props.status}>{this.props.statusMessage}</StatusMessage>
    </span>;
  }
});

module.exports = SaveButton;

