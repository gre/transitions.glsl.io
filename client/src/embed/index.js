var React = require("react");
var LinearPlayer = require("./LinearPlayer");
var Images = require("../images");

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

Images.getImage(0, "embed").then(function (from) {
  return Images.getImage(1, "embed").then(function (to) {
    window.addEventListener("resize", function () {
      render(from, to);
    }, false);
    render(from, to);
  });
}).done();

