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
    return ClickButton.prototype.isValidClickEvent.apply(this, arguments) &&
      ("href" in e.target) &&
      e.target.getAttribute("href")[0] === "/";
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
