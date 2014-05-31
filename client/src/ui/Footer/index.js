/** @jsx React.DOM */

var React = require("react");
var Footer = React.createClass({
  render: function () {
    return <footer id="footer">
      <span>GLSL.io</span>
      <span>v{this.props.version}</span>
      <a href="https://twitter.com/glslio">@glslio</a>
      <a href="mailto:contact@glsl.io">contact@glsl.io</a>
      <a href="https://github.com/glslio/glsl.io/issues/new">Found a bug?</a>
    </footer>;
  }
});
module.exports = Footer;
