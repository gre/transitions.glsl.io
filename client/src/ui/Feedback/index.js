/** @jsx React.DOM */
var React = require("react");
var Link = require("../Link");

var Feedback = React.createClass({
  render: function () {
    return <Link className="feedback" href="https://github.com/glslio/transitions.glsl.io/issues/new">
      <i className="fa fa-paper-plane"></i>&nbsp;
      Feedback
    </Link>;
  }
});

module.exports = Feedback;
