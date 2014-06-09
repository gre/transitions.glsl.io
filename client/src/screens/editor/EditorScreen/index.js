/** @jsx React.DOM */
var React = require("react");
var _ = require("lodash");
var Q = require("q");
var Validator = require("glsl-transition-validator");
var LicenseLabel = require("../LicenseLabel");
var TransitionPreview = require("../TransitionPreview");
var TransitionInfos = require("../TransitionInfos");
var TransitionActions = require("../TransitionActions");
var TransitionComments = require("../TransitionComments");
var TransitionEditor = require("../TransitionEditor");
var UniformsEditor = require("../UniformsEditor");
var Toolbar = require("../../../ui/Toolbar");
var PromisesMixin = require("../../../mixins/Promises");
var uniformValuesForUniforms = require("../UniformsEditor/uniformValuesForUniforms");

var router = require("../../../core/router");
var model = require("../../../model");

var ignoredUniforms = ["progress", "resolution", "from", "to"];
var unsupportedTypes = ["sampler2D", "samplerCube"];
function keepCustomUniforms (uniforms) {
  return _.omit(uniforms, function (uniformType, uniformName) {
    return _.contains(ignoredUniforms, uniformName) || _.contains(unsupportedTypes, uniformType);
  });
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
      uniformTypes: keepCustomUniforms(uniformTypes),
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
    var onbeforeunload = this.hasUnsavingChanges() ? onLeavingAppIfUnsaved : null;
    if (onbeforeunload !== window.onbeforeunload)
      window.onbeforeunload = onbeforeunload;
  },
  render: function () {
    var hasUnsavingChanges = this.hasUnsavingChanges();
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

    return <div className="editor-screen" style={{width:width,height:height}}>
      <Toolbar>
        <LicenseLabel />
        <TransitionActions saveDisabled={!hasUnsavingChanges} onSave={this.onSave} onPublish={this.onPublish} env={env} isPublished={isPublished} transition={transition} saveStatusMessage={this.state.saveStatusMessage} saveStatus={this.state.saveStatus} />
        <TransitionInfos env={env} isPublished={isPublished} transition={transition} />
      </Toolbar>
      <div className="main">
        <div className="view">
          <div className="leftPanel">
            <TransitionComments count={transition.comments} href={transition.html_url} />
          </div>
          <TransitionPreview transition={transition} images={images} width={previewWidth} height={previewHeight} />
          <div className="properties">
            <UniformsEditor initialUniformValues={transition.uniforms} uniforms={this.state.uniformTypes} onUniformsChange={this.onUniformsChange} />
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
      .fail(throwAgain(function () {
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
        return model.saveTransition(transition);
      }, this))
      .then(_.bind(function () {
        return this.setStateQ({ transition: transition });
      }, this))
      .then(_.bind(this.setSaveStatus, this, "success", "Created."))
      .then(function () {
        return router.route("/transition/"+transition.id);
      })
      .fail(throwAgain(function () {
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
    var name = window.prompt("Please choose a transition name (alphanumeric only):");
    if (name.match(/^[a-zA-Z0-9_ ]+$/)) {
      return this.setStateQ({
          transition: _.defaults({ name: name }, this.state.transition)
        })
        .then(_.bind(this.saveTransition, this))
        .then(_.bind(router.reload, router));
    }
    else {
      window.alert("Title must be alphanumeric.");
    }
  },  
  onGlslChangeFailure: function () {
  },
  onGlslChangeSuccess: function (glsl, allUniformTypes) {
    var uniformTypes = keepCustomUniforms(allUniformTypes);
    this.setState({
      transition: _.defaults({
        glsl: glsl,
        uniforms: uniformValuesForUniforms(uniformTypes, this.state.transition.uniforms)
      }, this.state.transition),
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

