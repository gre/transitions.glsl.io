var Qajax = require("qajax");
var Articles = require("./articles");

function show () {
  return Qajax("/api/blog/articles")
    .then(Qajax.filterSuccess)
    .then(Qajax.toJSON)
    .then(function (articles) {
      return Articles({ articles: articles });
    });
}

function init () {
  return {
    show: show
  };
}

module.exports = init;
