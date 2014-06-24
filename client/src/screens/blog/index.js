var Article = require("./article");
var Articles = require("./articles");

function show (data) {
  if (data instanceof Array) {
    return Articles({ articles: data });
  }
  else {
    return Article(data);
  }
}

function init () {
  return {
    show: show
  };
}

module.exports = init;
