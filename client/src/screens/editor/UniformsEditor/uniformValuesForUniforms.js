var _ = require("lodash");
var arityForType = require("../UniformEditor/arityForType");
var primitiveForType = require("../UniformEditor/primitiveForType");

function uniformTypeCheck (type, value) {
  var arity = arityForType(type);
  var isArray = _.isArray(value);
  if (arity !== (!isArray ? 1 : value.length)) {
    return false; // Invalid arity
  }
  // TODO More checks (bool / number)
  return true;
}

function defaultValueForType (t) {
  var arity = arityForType(t);
  var primitive = primitiveForType(t);
  var v = ({ "bool": false, "int": 0, "float": 0.0 })[primitive];
  if (arity === 1) return v;
  var arr = [];
  for (var i=0; i<arity; ++i) {
    arr.push(v);
  }
  return arr;
}

function uniformValuesForUniforms (uniformTypes, initialValues) {
  return _(uniformTypes)
    .mapValues(function (type, key) {
      var value = key in initialValues && uniformTypeCheck(type, initialValues[key]) ? initialValues[key] : defaultValueForType(type);
      return [type, value];
    })
    .mapValues(function (typeValue) {
      return typeValue[1];
    })
    .value();
}

module.exports = uniformValuesForUniforms;
