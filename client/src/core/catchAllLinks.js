var router = require("./router");
var ClickButton = require("./clickbutton");

module.exports = function () {
  return ClickButton({
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
      return router.route(this.resolveTarget(e).getAttribute("href"));
    }
  });
};
