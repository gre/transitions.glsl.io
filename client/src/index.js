/**
 * Entry point of the editor app
 */

var _ = require("lodash");
var screens = require("./screens");
var app = require("./app");
var routes = require("./routes");
var ClickButton = require("./clickbutton");
var dom = require("./dom");

ClickButton({
  el: document.body,
  isValidClickEvent: function (e) {
    if (!ClickButton.prototype.isValidClickEvent.apply(this, arguments))
      return false;
    if (!("href" in e.target))
      return false;
    var href = e.target.getAttribute("href");
    return href[0] === "/" && !(
      href === "/logout" ||
      href === "/authenticate"
    );
  },
  f: function (e) {
    return routes.route(e.target.href);
  }
}).bind();

var run = app.init(screens)
  .then(function(){
    return routes.init();
  });

run.fin(function () {
  dom.footer.removeAttribute("hidden");
});
run.fail(_.bind(app.show, app, "error")).done();
run.done();
