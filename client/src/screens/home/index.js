
var Qajax = require("qajax");
var template = require("./screen.hbs");
var hljs = require('highlight.js');
var _ = require("lodash");

function show () {
  var elt = document.createElement("div");
  elt.innerHTML = template({});
  var content = elt.querySelector(".content");
  return Qajax("/api/home")
    .then(Qajax.filterSuccess)
    .get("responseText")
    .then(function (html) {
      content.innerHTML = html;
      return content;
    })
    .then(function highlightAllCode (node) {
      _.each(node.querySelectorAll("pre code"), function (code) {
        code.innerHTML = hljs.highlight("javascript", code.innerHTML).value;
        code.className += " hljs";
      });
    })
    .thenResolve({ elt: elt });
}

function init () {
  return {
    show: show
  };
}

module.exports = init;
