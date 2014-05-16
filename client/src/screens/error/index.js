
var template = require("./screen.hbs");

function show (e) {
  var elt = document.createElement("div");
  elt.innerHTML = template({});
  var $error = elt.querySelector(".error-msg");
  var msg = e;
  if (e instanceof window.XMLHttpRequest) {
    msg = e.statusText;
  }
  $error.textContent = msg;
  return { elt: elt };
}

function init () {
  return {
    show: show
  };
}

module.exports = init;
