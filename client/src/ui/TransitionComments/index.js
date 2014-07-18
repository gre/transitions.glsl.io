/** @jsx React.DOM */
var React = require("react");
var Link = require("../Link");

var TransitionComments = React.createClass({
  propTypes: {
    count: React.PropTypes.number.isRequired,
    href: React.PropTypes.string.isRequired
  },
  render: function () {
    return <Link className={"transition-comments " + (this.props.count ? "" : "no-comments")} target="_blank" href={this.props.href}>
      <i className="fa fa-comments"></i>&nbsp;{this.props.count}
    </Link>;
  }
});

module.exports = TransitionComments;
