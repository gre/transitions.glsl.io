var _ = require("lodash");
var Q = require("q");
var TransitionViewer = require("../../transitionViewer");
var images = require("../../images").editor;
var noUniforms = require("./noUniforms.hbs");

var ignoredUniforms = ["progress", "resolution", "from", "to"];
function getCurrentUniforms (transition) {
  var uniforms = transition.getUniforms().uniforms;
  var uniformsKeys = _.difference(
      _.keys(uniforms),
      ignoredUniforms
      );
  return _.foldl(uniformsKeys, function (obj, k) {
    obj[k] = uniforms[k];
    return obj;
  }, {});
}


function arityForType (t) {
  if (_.contains(t, "vec2")) return 2;
  if (_.contains(t, "vec3")) return 3;
  if (_.contains(t, "vec4")) return 4;
  if (t == "mat2") return 4;
  if (t == "mat3") return 9;
  if (t == "mat4") return 16;
  return 1;
}
function componentLinesForType (t) {
  if (t == "mat2") return 2;
  if (t == "mat3") return 3;
  if (t == "mat4") return 4;
  return 1;
}

function primitiveForType (t) {
  if (t in inputPrimitiveTypes) return t;
  if (t[0] == "b") return "bool";
  if (t[0] == "i") return "int";
  return "float";
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

var inputPrimitiveTypes = {
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
  }
};

function labelsForType (t, name) {
  if (_.contains(t, "vec")) {
    var colorLike = (name||"").toLowerCase().indexOf("color") > -1 && (t[3]==="3" || t[3]==="4");
    return colorLike ? ["r","g","b","a"] : ["x", "y", "z", "w"];
  }
  if (t == "mat2") {
    return [
      "[0].x", "[0].y",
      "[1].x", "[1].y"
    ];
  }
  if (t == "mat3") {
    return [
      "[0].x", "[0].y", "[0].z",
      "[1].x", "[1].y", "[1].z",
      "[2].x", "[2].y", "[2].z"
    ];
  }
  if (t == "mat4") {
    return [
      "[0].x", "[0].y", "[0].z", "[0].w",
      "[1].x", "[1].y", "[1].z", "[1].w",
      "[2].x", "[2].y", "[2].z", "[2].w",
      "[3].x", "[3].y", "[3].z", "[3].w",
    ];
  }
}

// onChange(value, index/*for vectors and matrixes*/)
function componentForType (type, id, labelName, value, onChange) {
  var arity = arityForType(type);
  var primitive = inputPrimitiveTypes[primitiveForType(type)];
  var componentLines = componentLinesForType(type);
  var labels = labelsForType(type, labelName);

  var p = document.createElement("p");
  p.className = "type-"+type;
  var label = document.createElement("label");
  label.setAttribute("for", id);
  label.textContent = labelName;
  p.appendChild(label);

  _.each(_.range(0, componentLines), function (l) {
    var inputsPerLine = arity / componentLines;
    var inputs = document.createElement("div");
    inputs.className = "inputs inputs-"+inputsPerLine;
    if (inputsPerLine === 1) {
      var input = document.createElement("input");
      input.setAttribute("id", id+"_"+l);
      input.type = primitive.type;
      if ("step" in primitive) input.step = primitive.step;
      if ("checked" in primitive) input.checked = primitive.checked;
      input.value = value || primitive.value;
      input.addEventListener("change", function () {
        onChange(primitive.get(input));
      }, false);
      inputs.appendChild(input);
    }
    else {
      _.each(_.range(0, inputsPerLine), function (i) {
        var index = l * inputsPerLine + i;
        var lab = document.createElement("label");
        var inp = document.createElement("input");
        var span = document.createElement("span");
        lab.setAttribute("for", id+"_"+index);
        inp.setAttribute("id" , id+"_"+index);
        span.textContent = labels && labels[index] || "";
        inp.type = primitive.type;
        if ("step" in primitive) inp.step = primitive.step;
        if ("checked" in primitive) inp.checked = primitive.checked;
        inp.value = value && value[index] || primitive.value;
        inp.addEventListener("change", function () {
          onChange(primitive.get(inp), index);
        }, false);
        lab.appendChild(span);
        lab.appendChild(inp);
        inputs.appendChild(lab);
      });
    }
    p.appendChild(inputs);
  });
  return p;
}

module.exports = {
  init: function (elt, canvas) {

    var $properties = elt.querySelector("#properties");

    var transitionFirstDefinition = Q.defer();
    var transitionDefined = Q.defer();

    var transitionViewerPromise;

    var currentUniformValuesWatcher = _.noop; // FIXME
    var currentUniformValues = {};

    function onUniformsChange () {
      transitionViewerPromise.then(function(transitionViewer){
        transitionViewer.setUniforms(currentUniformValues);
      });
      currentUniformValuesWatcher(currentUniformValues);
    }

    function recomputeUniformsValues (oldUniforms, uniforms) {
      var values = _.extend({}, withoutInvalidValues(currentUniformValues, uniforms));
      var removed = _.difference(_.difference(_.keys(values), _.keys(uniforms)), ignoredUniforms);
      var missing = _.difference(_.keys(uniforms), _.keys(values));
      _.each(removed, function (u) {
        delete values[u];
      });
      _.each(missing, function (u) {
        var type = uniforms[u];
        values[u] = defaultValueForType(type);
      });
      return values;
    }

    function withoutInvalidValues (values, uniforms) {
      var r = {};
      for (var key in values) {
        if (key in uniforms) {
          var arity = arityForType(uniforms[key]);
          var isArray = _.isArray(values[key]);
          if (arity === (!isArray ? 1 : values[key].length)) {
            r[key] = values[key];
          }
        }
      }
      return r;
    }

    function recomputeUniforms (oldUniforms, uniforms) {
      var els = _.compact(_.map(uniforms, function (type, u) {
        return componentForType(type, "uniform_"+u, u, currentUniformValues[u], function (value, i) {
          if (_.isArray(currentUniformValues[u]))
            currentUniformValues[u][i] = value;
          else
            currentUniformValues[u] = value;
        });
      }));

      if (els.length) {
        $properties.innerHTML = "";
        _.each(els, function (el) {
          $properties.appendChild(el);
        });
      }
      else {
        $properties.innerHTML = noUniforms();
      }
      return uniforms;
    }

    var currentUniforms;
    function setTransition (glsl) {
      transitionDefined.resolve();
      return transitionViewerPromise.then(function (transitionViewer) {
        transitionViewer.setGlsl(glsl);
        transitionFirstDefinition.resolve();
        var uniforms = getCurrentUniforms(transitionViewer.transition);
        currentUniformValues = withoutInvalidValues(currentUniformValues, uniforms);
        if (!_.isEqual(currentUniforms, uniforms)) {
          currentUniformValues = recomputeUniformsValues(currentUniforms, uniforms);
          currentUniforms = recomputeUniforms(currentUniforms, uniforms);
        }
        onUniformsChange();
        return transitionViewer.transition;
      });
    }

    var transitionViewer = TransitionViewer(canvas);
    var overlay = elt.querySelector("#renderOverlay");
    var cursor = overlay.querySelector(".cursor");
    transitionViewerPromise = images
    .then(function (images) {
      transitionViewer.setImages(images);
      return transitionViewer;
    });

    Q.all([
      transitionViewerPromise,
      transitionDefined.promise
    ])
    .spread(function (transitionViewer) {
      overlay.addEventListener("mousemove", _.bind(function (e) {
        var p = (e.clientX - overlay.getBoundingClientRect().left) / overlay.clientWidth;
        transitionViewer.hover(p);
        cursor.style.left = (p * 100)+"%";
      }, this));
      overlay.addEventListener("mouseenter", function () {
        transitionViewer.stop();
      });
      overlay.addEventListener("mouseleave", function () {
        transitionViewer.start();
      });
      transitionViewer.start();
    });

    return {
      setTransition: setTransition,
      setUniformValues: function (u) {
        currentUniformValues = u;
      },
      onUniformValues: function (f) {
        currentUniformValuesWatcher = f; // FIXME
      },
      destroy: function () {
        // FIXME
      }
    };
  }
};
