/** @jsx React.DOM */
var React = require("react");
var _ = require("lodash");
var LicenseLabel = require("../LicenseLabel");
var TransitionPreview = require("../TransitionPreview");
var TransitionInfos = require("../TransitionInfos");
var TransitionActions = require("../TransitionActions");
var TransitionComments = require("../TransitionComments");
var TransitionEditor = require("../TransitionEditor");
var UniformsEditor = require("../UniformsEditor");

var arityForType = require("../UniformEditor/arityForType");
var primitiveForType = require("../UniformEditor/primitiveForType");
var ignoredUniforms = ["progress", "resolution", "from", "to"];

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

function uniformValuesForUniforms (uniforms, initialValues) {
  var values = _.extend({}, withoutInvalidValues(initialValues||{}, uniforms));
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

var EditorScreen = React.createClass({
  propTypes: {
    env: React.PropTypes.object.isRequired,
    transition: React.PropTypes.object.isRequired,
    images: React.PropTypes.array.isRequired,
    previewWidth: React.PropTypes.number.isRequired,
    previewHeight: React.PropTypes.number.isRequired
  },
  computeWidth: function () {
    return window.innerWidth;
  },
  computeHeight: function () {
    return window.innerHeight - 60;
  },
  getInitialState: function () {
    return {
      width: this.computeWidth(),
      height: this.computeHeight()
    };
  },
  componentDidMount: function () {
    window.addEventListener("resize", this._onResize=_.bind(this.onResize, this), false);
  },
  componentWillUnmount: function () {
    window.removeEventListener("resize", this._onResize);
  },
  onResize: function () {
    this.setState({
      width: this.computeWidth(),
      height: this.computeHeight()
    });
  },
  render: function () {
    var env = this.props.env;
    var transition = this.props.transition;
    var images = this.props.images;
    var previewWidth = this.props.previewWidth;
    var previewHeight = this.props.previewHeight;
    var width = this.state.width;
    var height = this.state.height;
    
    var editorWidth = width - 336;
    var editorHeight = height - 40;
    var isPublished = transition.name !== "TEMPLATE";

    // Mock / Not Implemented Yet
    var onSave = _.bind(console.log, console, "onSave");
    var onPublish = _.bind(console.log, console, "onPublish");
    var onUniformsChange = _.bind(console.log, console, "onUniformsChange");
    var onGlslChangeSuccess = _.bind(console.log, console, "onGlslChangeSuccess");
    var onGlslChangeFailure = _.bind(console.log, console, "onGlslChangeFailure");
    var uniforms = { a: "int", b: "float", c: "vec3", foo: "mat4" };
    var uniformValues = uniformValuesForUniforms(uniforms);

    return <div className="editor-screen" style={{width:width,height:height}}>
      <div className="toolbar">
        <LicenseLabel />
        <TransitionActions onSave={onSave} onPublish={onPublish} env={env} isPublished={isPublished} transition={transition} />
        <TransitionInfos env={env} isPublished={isPublished} transition={transition} />
      </div>
      <div className="main">
        <div className="view">
          <div className="leftPanel">
            <TransitionComments count={transition.comments} href={transition.html_url} />
          </div>
          <TransitionPreview transition={transition} images={images} width={previewWidth} height={previewHeight} />
          <div className="properties">
            <UniformsEditor initialUniformValues={uniformValues} uniforms={uniforms} onUniformsChange={onUniformsChange} />
          </div>
        </div>

        <TransitionEditor onChangeSuccess={onGlslChangeSuccess} onChangeFailure={onGlslChangeFailure} initialGlsl={transition.glsl} onSave={onSave} width={editorWidth} height={editorHeight} />
      </div>
    </div>;
  }
});

module.exports = EditorScreen;

