/** @jsx React.DOM */
var React = require("react");

module.exports = function (validator, transition) {
  var validation = validator.forGlsl(transition.glsl);
  var uniforms = transition.uniforms;
  var reasons = [];
  if (!validation.compiles())
    reasons.push(<div>Transition does not compile</div>);
  else {
    if (!validation.isValidFrom(uniforms))
      reasons.push(<div>image <code>from</code> is not correctly displayed when progress=0</div>);
    if (!validation.isValidTo(uniforms))
      reasons.push(<div>image <code>to</code> is not correctly displayed when progress=1</div>);
  }
  validation.destroy();
  return reasons;
};
