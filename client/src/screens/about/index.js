var Qajax = require("qajax");
var Article = require("./article");

function show () {
  return Qajax("/api/home")
    .then(Qajax.filterSuccess)
    .get("responseText")
    .then(function (html) {
      return Article({ content: html });
    });
}

function init () {
  return {
    show: show
  };
}

module.exports = init;
