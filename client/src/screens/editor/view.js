var _ = require("lodash");
var Q = require("q");
var TransitionViewer = require("../../transitionViewer");
var images = require("../../images").editor;

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

function defaultValueForType (t) {
  if (t === "vec2") return [ 0, 0 ];
  if (t === "vec3") return [ 0, 0, 0 ];
  if (t === "vec4") return [ 0, 0, 0, 0 ];
  return 0;
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
      var values = _.extend({}, currentUniformValues);
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

    var labelsForVector = ["x, r", "y, g", "z, b", "w, a"];
    function recomputeUniforms (oldUniforms, uniforms) {
      var els = _.compact(_.map(uniforms, function (type, u) {
        var id = "uniform_"+u;
        var p = document.createElement("p");
        p.className = "type-"+type;
        var label = document.createElement("label");
        label.setAttribute("for", id);
        label.textContent = u;
        var input;
        var inputs = document.createElement("div");
        inputs.className = "inputs inputs-1";
        if (type === "float") {
          input = document.createElement("input");
          input.setAttribute("id", id);
          input.type = "number";
          input.step = 0.1;
          input.value = currentUniformValues[u] || 0.0;
          input.addEventListener("change", function () {
            var v = parseFloat(input.value, 10);
            currentUniformValues[u] = v;
            onUniformsChange();
          });
          inputs.appendChild(input);
        }
        else if (type === "int") {
          input = document.createElement("input");
          input.setAttribute("id", id);
          input.type = "number";
          input.step = 1;
          input.value = currentUniformValues[u] || 0;
          input.addEventListener("change", function () {
            var v = parseInt(input.value, 10);
            currentUniformValues[u] = v;
            onUniformsChange();
          });
          inputs.appendChild(input);
        }
        else if (type === "bool") {
          input = document.createElement("input");
          input.setAttribute("id", id);
          input.type = "checkbox";
          input.checked = currentUniformValues[u] || false;
          input.addEventListener("change", function () {
            currentUniformValues[u] = input.checked;
            onUniformsChange();
          });
          inputs.appendChild(input);
        }
        else {
          var nb = _.contains(["vec2"], type) ? 2 :
                   _.contains(["vec3"], type) ? 3 :
                   _.contains(["vec4"], type) ? 4 :
                  null;
          if (nb) {
            inputs.className = "inputs inputs-"+nb;
            _.each(_.range(0, nb), function (i) {
              var lab = document.createElement("label");
              lab.setAttribute("for", id+"_"+i);
              var inp = document.createElement("input");
              inp.setAttribute("id", id+"_"+i);
              var span = document.createElement("span");
              span.textContent = labelsForVector[i];
              inp.type = "number";
              inp.step = 0.1;
              inp.value = 0.0;
              inp.value = currentUniformValues[u] && currentUniformValues[u][i] || 0.0;
              inp.addEventListener("change", function () {
                var v = parseFloat(inp.value, 10);
                currentUniformValues[u][i] = v;
                onUniformsChange();
              });
              lab.appendChild(span);
              lab.appendChild(inp);
              inputs.appendChild(lab);
            });
          }
        }
        p.appendChild(label);
        p.appendChild(inputs);
        return p;
      }));

      $properties.innerHTML = "";
      _.each(els, function (el) {
        $properties.appendChild(el);
      });
      return uniforms;
    }

    var currentUniforms;
    function setTransition (glsl) {
      transitionDefined.resolve();
      return transitionViewerPromise.then(function (transitionViewer) {
        transitionViewer.setGlsl(glsl);
        transitionFirstDefinition.resolve();
        var uniforms = getCurrentUniforms(transitionViewer.transition);
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
