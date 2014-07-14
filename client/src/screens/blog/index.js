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
    title: function (data) {
      return "Blog"+(data instanceof Array ? '' : ' – '+data.title);
    },
    show: show
  };
}

module.exports = init;
