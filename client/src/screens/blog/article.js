/** @jsx React.DOM */
var React = require("react");
var hljs = require('highlight.js');
var _ = require("lodash");

var MONTHS = {
  1: "January",
  2: "February",
  3: "March",
  4: "May",
  5: "April",
  6: "June",
  7: "July",
  8: "August",
  9: "September",
  10: "October",
  11: "November",
  12: "December"
};

var Article = React.createClass({
  propTypes: {
    year: React.PropTypes.number.isRequired,
    month: React.PropTypes.number.isRequired,
    day: React.PropTypes.number.isRequired,
    title: React.PropTypes.string.isRequired,
    content: React.PropTypes.string.isRequired
  },
  render: function () {
    var year = this.props.year;
    var month = this.props.month;
    var day = this.props.day;
    return <article>
      <header>
        <h1 className="title">{this.props.title}</h1>
        <time datetime={year+"-"+month+"-"+day}>{MONTHS[month]} {day}, {year}</time>
      </header>
      <section ref="content" className="content" dangerouslySetInnerHTML={{__html: this.props.content}} />
    </article>;
  },

  componentDidMount: function () {
    var node = this.refs.content.getDOMNode();
    // Highlight codes of the Article
    _.each(node.querySelectorAll("pre code"), function (code) {
      code.innerHTML = hljs.highlight("javascript", code.innerText).value;
      code.className += " hljs";
    });
  }
});

module.exports = Article;
