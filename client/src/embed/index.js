var _ = require("lodash");
var Q = require("q");
var React = require("react");
var LinearPlayer = require("./LinearPlayer");
var Images = require("../images");
var resolveTextureUniforms = require("../images/resolveTextureUniforms");

var TRANSITION = window.transition;

function render (transition, from, to) {
  return React.renderComponent(LinearPlayer({
    width: window.innerWidth,
    height: window.innerHeight,
    transition: transition,
    from: from,
    to: to,
    duration: 2000
  }), document.body);
}

Q.all([
  resolveTextureUniforms(TRANSITION.uniforms).then(function (uniforms) {
    return _.defaults({ uniforms: uniforms }, TRANSITION);
  }),
  Images.getImage(0, "embed"),
  Images.getImage(1, "embed")
])
.spread(function (transition, from, to) {
  var draw = _.bind(render, this, transition, from, to);
  window.addEventListener("resize", draw, false);
  draw();
})
.done();

