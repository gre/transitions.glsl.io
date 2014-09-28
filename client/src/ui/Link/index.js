/** @jsx React.DOM */
var React = require("react");
var Button = require("../Button");

var router;
var blacklist = [];

var Link = React.createClass({
  statics: {
    setRouter: function (routerFunction) {
      router = routerFunction;
    },
    excludePath: function (path) {
      blacklist.push(path);
    }
  },
  propTypes: {
    href: React.PropTypes.string.isRequired
  },
  componentDidMount: function () {
    if (!router)
      throw new Error("router function must be defined with Link.setRouter(routerFunction)");
  },
  isRouterLink: function () {
    var href = this.props.href;
    return href[0] === "/" && blacklist.indexOf(href)===-1;
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

