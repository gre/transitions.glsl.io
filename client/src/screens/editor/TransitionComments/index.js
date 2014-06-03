/** @jsx React.DOM */
var React = require("react");

var TransitionComments = React.createClass({
  propTypes: {
    count: React.PropTypes.number.isRequired,
    href: React.PropTypes.string.isRequired
  },
  render: function () {
    return <a className={"comments " + this.props.count ? "" : "no-comments"} target="_blank" href={this.props.href}>
      <i class="fa fa-comments"></i>&nbsp;{this.props.count}
    </a>;
  }
});

module.exports = TransitionComments;
