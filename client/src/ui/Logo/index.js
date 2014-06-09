/** @jsx React.DOM */
var React = require("react");
var Link = require("../Link");

var Logo = React.createClass({
  render: function () {
    return (
      <h1>
        <Link className="logo" href="/">
          <span>GLSL</span>
          <span>.io</span>
        </Link>
      </h1>
    );
  }
});

module.exports = Logo;

