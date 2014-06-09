/** @jsx React.DOM */
var React = require("react");
var hljs = require('highlight.js');
var _ = require("lodash");

var Article = React.createClass({
  render: function () {
    return <article dangerouslySetInnerHTML={{__html: this.props.content}} />;
  },

  componentDidMount: function () {
    var node = this.getDOMNode();
    // Highlight codes of the Article
    _.each(node.querySelectorAll("pre code"), function (code) {
      code.innerHTML = hljs.highlight("javascript", code.innerHTML).value;
      code.className += " hljs";
    });
  }
});

module.exports = Article;
