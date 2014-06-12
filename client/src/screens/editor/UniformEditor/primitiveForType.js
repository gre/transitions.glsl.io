var _ = require("lodash");
var primitiveTypes = ["float", "int", "bool"];
module.exports = function primitiveForType (t) {
  if (_.contains(primitiveTypes, t)) return t;
  if (t[0] === "b") return "bool";
  if (t[0] === "i") return "int";
  if (t[0] === "f") return "float";
  return t;
};
