/** @jsx React.DOM */
var React = require("react");
var Button = require("../Button");
var router = require("../../core/router");

var Link = React.createClass({
  propTypes: {
    href: React.PropTypes.string.isRequired
  },
  isRouterLink: function () {
    var href = this.props.href;
    return href[0] === "/" && !(
      href === "/logout" ||
      href === "/authenticate"
    );
  },
  f: function () {
    return router.route(this.props.href);
  },
  render: function () {
    return this.transferPropsTo(
      <Button f={this.f} href={this.props.href} isHandledClickEvent={this.isRouterLink}>{this.props.children}</Button>
    );
  }
});

module.exports = Link;

