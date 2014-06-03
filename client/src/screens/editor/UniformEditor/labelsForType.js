
var _ = require("lodash");
module.exports = function labelsForType (t, name) {
  if (_.contains(t, "vec")) {
    var colorLike = (name||"").toLowerCase().indexOf("color") > -1 && (t[3]==="3" || t[3]==="4");
    return colorLike ? ["r","g","b","a"] : ["x", "y", "z", "w"];
  }
  if (t === "mat2") {
    return [
      "[0].x", "[0].y",
      "[1].x", "[1].y"
    ];
  }
  if (t === "mat3") {
    return [
      "[0].x", "[0].y", "[0].z",
      "[1].x", "[1].y", "[1].z",
      "[2].x", "[2].y", "[2].z"
    ];
  }
  if (t === "mat4") {
    return [
      "[0].x", "[0].y", "[0].z", "[0].w",
      "[1].x", "[1].y", "[1].z", "[1].w",
      "[2].x", "[2].y", "[2].z", "[2].w",
      "[3].x", "[3].y", "[3].z", "[3].w"
    ];
  }
};
