/** @jsx React.DOM */
var React = require("react");
var hljs = require('highlight.js');
var _ = require("lodash");
var Link = require("../../ui/Link");

var MONTHS = {
  "01": "January",
  "02": "February",
  "03": "March",
  "04": "May",
  "05": "April",
  "06": "June",
  "07": "July",
  "08": "August",
  "09": "September",
  "10": "October",
  "11": "November",
  "12": "December"
};

var Article = React.createClass({
  propTypes: {
    year: React.PropTypes.string.isRequired,
    month: React.PropTypes.string.isRequired,
    day: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired,
    content: React.PropTypes.string.isRequired,
    url: React.PropTypes.string.isRequired
  },
  render: function () {
    var year = this.props.year;
    var month = this.props.month;
    var day = this.props.day;
    return <article key={this.props.url}>
      <header>
        <h1 className="title"><Link href={this.props.url}>{this.props.title}</Link></h1>
        <time dateTime={year+"-"+month+"-"+day}>{MONTHS[month]} {day}, {year}</time>
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
