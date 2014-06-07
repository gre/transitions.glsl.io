/** @jsx React.DOM */
var React = require("react");
var _ = require("lodash");
var Q = require("q");
var LicenseLabel = require("../LicenseLabel");
var TransitionPreview = require("../TransitionPreview");
var TransitionInfos = require("../TransitionInfos");
var TransitionActions = require("../TransitionActions");
var TransitionComments = require("../TransitionComments");
var TransitionEditor = require("../TransitionEditor");
var UniformsEditor = require("../UniformsEditor");
var Validator = require("../../../core/glslFragmentValidator");
var PromisesMixin = require("../../../mixins/Promises");

var router = require("../../../core/router");
var model = require("../../../model");

// FIXME Should we move those functions somewhere else? also moving functions defined in this EditorScreen scope
var arityForType = require("../UniformEditor/arityForType");
var primitiveForType = require("../UniformEditor/primitiveForType");
var ignoredUniforms = ["progress", "resolution", "from", "to"];
var unsupportedTypes = ["sampler2D", "samplerCube"];

function keepCustomUniforms (uniforms) {
  return _.omit(uniforms, function (uniformType, uniformName) {
    return _.contains(ignoredUniforms, uniformName) || _.contains(unsupportedTypes, uniformType);
  });
}

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
      var value = key in initialValues ? initialValues[key] : defaultValueForType(type);
      return [type, value];
    })
    .omit(function (typeValue, key) {
      return !uniformTypeCheck.apply(this, typeValue);
    })
    .mapValues(function (typeValue) {
      return typeValue[1];
    })
    .value();
}

function onLeavingAppIfUnsaved () {
  return "Are you sure you want to leave this page?\n\nUNSAVED CHANGES WILL BE LOST.";
}

function throwAgain (f, ctx) {
  return function (e) {
    return Q.fcall(_.bind(f, ctx||this, arguments)).thenReject(e);
  };
}

var EditorScreen = React.createClass({
  mixins: [ PromisesMixin ],
  propTypes: {
    env: React.PropTypes.object.isRequired,
    initialTransition: React.PropTypes.object.isRequired,
    images: React.PropTypes.array.isRequired,
    previewWidth: React.PropTypes.number.isRequired,
    previewHeight: React.PropTypes.number.isRequired
  },
  getInitialState: function () {
    this.validator = new Validator();
    var ok = this.validator.validate(this.props.initialTransition.glsl);
    var uniformTypes = ok ? ok[0] : {};
    return {
      width: this.computeWidth(),
      height: this.computeHeight(),
      transition: this.props.initialTransition,
      uniformTypes: uniformTypes,
      saveStatusMessage: null,
      saveStatus: null
    };
  },
  componentWillMount: function () {
    this.lastSavingTransition = this.lastSavedTransition = this.state.transition;
  },
  componentDidMount: function () {
    window.addEventListener("resize", this._onResize=_.bind(this.onResize, this), false);
  },
  componentWillUnmount: function () {
    window.removeEventListener("resize", this._onResize);
  },
  componentDidUpdate: function () {
    var onbeforeunload = this._hasUnsavingChanges ? onLeavingAppIfUnsaved : null;
    if (onbeforeunload !== window.onbeforeunload)
      window.onbeforeunload = onbeforeunload;
  },
  render: function () {
    this._hasUnsavingChanges = this.hasUnsavingChanges();
    var env = this.props.env;
    var transition = this.state.transition;
    var images = this.props.images;
    var previewWidth = this.props.previewWidth;
    var previewHeight = this.props.previewHeight;
    var width = this.state.width;
    var height = this.state.height;
    
    var editorWidth = width - 336;
    var editorHeight = height - 40;
    var isPublished = transition.name !== "TEMPLATE";

    var uniformTypes = keepCustomUniforms(this.state.uniformTypes);
    var uniformValues = uniformValuesForUniforms(uniformTypes, transition.uniforms);

    return <div className="editor-screen" style={{width:width,height:height}}>
      <div className="toolbar">
        <LicenseLabel />
        <TransitionActions saveDisabled={!this._hasUnsavingChanges} onSave={this.onSave} onPublish={this.onPublish} env={env} isPublished={isPublished} transition={transition} saveStatusMessage={this.state.saveStatusMessage} saveStatus={this.state.saveStatus} />
        <TransitionInfos env={env} isPublished={isPublished} transition={transition} />
      </div>
      <div className="main">
        <div className="view">
          <div className="leftPanel">
            <TransitionComments count={transition.comments} href={transition.html_url} />
          </div>
          <TransitionPreview transition={transition} images={images} width={previewWidth} height={previewHeight} />
          <div className="properties">
            <UniformsEditor initialUniformValues={uniformValues} uniforms={uniformTypes} onUniformsChange={this.onUniformsChange} />
          </div>
        </div>

        <TransitionEditor onChangeSuccess={this.onGlslChangeSuccess} onChangeFailure={this.onGlslChangeFailure} initialGlsl={transition.glsl} onSave={this.onSave} width={editorWidth} height={editorHeight} />
      </div>
    </div>;
  },
  computeWidth: function () {
    return window.innerWidth;
  },
  computeHeight: function () {
    return window.innerHeight - 60;
  },
  setSaveStatus: function (status, message) {
    return this.setStateQ({
      saveStatus: status,
      saveStatusMessage: message
    });
  },
  saveTransition: function () {
    var transition = _.cloneDeep(this.state.transition);
    this.lastSavingTransition =  transition;
    return this.setSaveStatus("info", "Saving...")
      .thenResolve(transition)
      .then(_.bind(model.saveTransition, model))
      .then(_.bind(function () {
        this.lastSavedTransition = transition;
      }, this))
      .then(_.bind(this.setSaveStatus, this, "success", "Saved."))
      .fail(throwAgain(function (e) {
        this.lastSavingTransition = null;
        return this.setSaveStatus("error", "Save failed.");
      }, this));
  },
  createNewTransition: function () {
    var transition = _.cloneDeep(this.state.transition);
    this.lastSavingTransition =  transition;
    return this.setSaveStatus("info", "Creating...")
      .thenResolve(transition)
      .then(_.bind(model.createNewTransition, model))
      .then(_.bind(function (r) {
        transition.id = r.id;
        this.lastSavingTransition = transition;
        return model.saveTransition(transition);
      }, this))
      .then(_.bind(this.setSaveStatus, this, "success", "Created."))
      .then(function () {
        return router.route("/transition/"+transition.id);
      })
      .fail(throwAgain(function (e) {
        this.lastSavingTransition = null;
        return this.setSaveStatus("error", "Create failed.");
      }, this));
  },
  onResize: function () {
    this.setState({
      width: this.computeWidth(),
      height: this.computeHeight()
    });
  },
  onSave: function () {
    if (this.hasUnsavingChanges()) {
      var isRootGist = this.props.env.rootGist === this.state.transition.id;
      if (isRootGist) {
        return this.createNewTransition();
      }
      else {
        return this.saveTransition();
      }
    }
  },
  onPublish: function () {
    // TODO making a proper UI for that. prompt() is the worse but easy solution
    var name = prompt("Please choose a transition name (alphanumeric only):");
    if (name.match(/^[a-zA-Z0-9_ ]+$/)) {
      return this.setStateQ({
          transition: _.defaults({ name: name }, this.state.transition)
        })
        .then(_.bind(this.saveTransition, this))
        .then(_.bind(router.reload, router));
    }
    else {
      alert("Title must be alphanumeric.");
    }
  },  
  onGlslChangeFailure: function () {
  },
  onGlslChangeSuccess: function (glsl, uniformTypes) {
    this.setState({
      transition: _.defaults({ glsl: glsl }, this.state.transition),
      uniformTypes: uniformTypes
    });
  },
  onUniformsChange: function (uniforms) {
    this.setState({
      transition: _.defaults({ uniforms: uniforms }, this.state.transition)
    });
  },
  hasUnsavingChanges: function () {
    return !_.isEqual(this.lastSavingTransition, this.state.transition);
  },
  hasUnsavedChanges: function () {
    return !_.isEqual(this.lastSavedTransition, this.state.transition);
  }
});

module.exports = EditorScreen;

