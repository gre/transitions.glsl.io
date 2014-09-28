/** @jsx React.DOM */
var React = require("react");
var Link = require("../../ui/Link");

var Footer = React.createClass({
  propTypes: {
    version: React.PropTypes.string.isRequired
  },
  render: function () {
    return <footer className="app-footer">
      <span>GLSL.io</span>
      <span>v{this.props.version}</span>
      <Link href="https://twitter.com/glslio">@glslio</Link>
      <Link href="mailto:contact@glsl.io">contact@glsl.io</Link>
    </footer>;
  }
});
module.exports = Footer;
