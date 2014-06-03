/** @jsx React.DOM */
var React = require("react");
var Button = require("../../../ui/Button");

var PublishButton = React.createClass({
  propTypes: {
    f: React.PropTypes.func.isRequired
  },
  render: function () {
    var f = this.props.f;
    return <Button className="publish-transition action primary" f={f}>
      <i class="if-active fa fa-circle-o-notch fa-spin"></i><i class="if-not-active fa fa-cloud-upload"></i>&nbsp;
      {this.props.children || "Publish"}
    </Button>;
  }
});

module.exports = PublishButton;

