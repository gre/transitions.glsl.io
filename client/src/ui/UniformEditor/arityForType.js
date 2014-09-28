var _ = require("lodash");

module.exports = function arityForType (t) {
  if (_.contains(t, "vec2")) return 2;
  if (_.contains(t, "vec3")) return 3;
  if (_.contains(t, "vec4")) return 4;
  if (t === "mat2") return 4;
  if (t === "mat3") return 9;
  if (t === "mat4") return 16;
  return 1;
};
