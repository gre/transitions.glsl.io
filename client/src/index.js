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
  resolveTarget: function (e) {
    var target = e.target;
    while (target && target !== document.body && target.nodeName.toUpperCase() !== "A") {
      target = target.parentNode;
    }
    return target;
  },
  isValidClickEvent: function (e) {
    var target = this.resolveTarget(e);
    if (!target) return false;
    if (!ClickButton.prototype.isValidClickEvent.apply(this, arguments))
      return false;
    if (!("href" in target))
      return false;
    var href = target.getAttribute("href");
    if (!href) return false;
    return href[0] === "/" && !(
      href === "/logout" ||
      href === "/authenticate"
    );
  },
  f: function (e) {
    return routes.route(this.resolveTarget(e).getAttribute("href"));
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
