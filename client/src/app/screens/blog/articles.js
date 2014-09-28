/** @jsx React.DOM */
var React = require("react");
var _ = require("lodash");
var Article = require("./article");

// Not pagninate yet, but we will
var Articles = React.createClass({
  propTypes: {
    articles: React.PropTypes.array.isRequired
  },
  render: function () {
    var articles = _.map(this.props.articles, function (article) {
      return Article(article);
    }, this);
    return <div className="articles">
      {articles}
    </div>;
  }
});

module.exports = Articles;
