
var Qajax = require("qajax");
var template = require("./screen.hbs");

function show () {
  var elt = document.createElement("div");
  elt.innerHTML = template({});
  var content = elt.querySelector(".content");
  return Qajax("/api/home")
    .then(Qajax.filterSuccess)
    .get("responseText")
    .then(function (html) {
      content.innerHTML = html;
    })
    .then(function () {
      return { elt: elt };
    });
}

function init () {
  return {
    show: show
  };
}

module.exports = init;
