/** @jsx React.DOM */
var React = require("react");
var Button = require("../Button");

var TransitionExpand = React.createClass({
  propTypes: {
    f: React.PropTypes.func.isRequired
  },
  render: function () {
    return <Button f={this.props.f} className="transition-expand">
      <i className="fa fa-expand"></i>
    </Button>;
  }
});

module.exports = TransitionExpand;
