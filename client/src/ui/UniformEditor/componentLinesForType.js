module.exports = function componentLinesForType (t) {
  if (t === "mat2") return 2;
  if (t === "mat3") return 3;
  if (t === "mat4") return 4;
  return 1;
};
