var Qimage = require("qimage");
var React = require("react");
var LinearPlayer = require("./LinearPlayer");

function render (from, to) {
  return React.renderComponent(LinearPlayer({
    width: window.innerWidth,
    height: window.innerHeight,
    transition: window.transition,
    from: from,
    to: to,
    duration: 2000
  }), document.body);
}

Qimage("/assets/images/gallery/1.jpg").then(function (from) {
  return Qimage("/assets/images/gallery/2.jpg").then(function (to) {
    window.addEventListener("resize", function () {
      render(from, to);
    }, false);
    render(from, to);
  });
}).done();

