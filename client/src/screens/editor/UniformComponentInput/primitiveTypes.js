var textures = require("../../../images/textures");

module.exports = {
  "float": {
    type: "number",
    step: 0.1,
    value: 0.0,
    get: function (input) { return parseFloat(input.value, 10); }
  },
  "int": {
    type: "number",
    step: 1,
    value: 0,
    get: function (input) { return parseInt(input.value, 10); }
  },
  "bool": {
    type: "checkbox",
    checked: false,
    get: function (input) { return input.checked; }
  },
  "sampler2D": {
    get: function (select) {
      var i = select.selectedIndex;
      var value = i===0 ? null : textures.names[i-1];
      return value;
    }
  }
};
