/** @jsx React.DOM */
var React = require("react");
var _ = require("lodash");
var Q = require("q");
var GlslContextualHelp = require("../GlslContextualHelp");
var LicenseLabel = require("../LicenseLabel");
var TransitionPreview = require("../TransitionPreview");
var TransitionInfos = require("../TransitionInfos");
var TransitionActions = require("../TransitionActions");
var TransitionComments = require("../TransitionComments");
var TransitionEditor = require("../TransitionEditor");
var UniformsEditor = require("../UniformsEditor");
var Toolbar = require("../../../ui/Toolbar");
var Button = require("../../../ui/Button");
var PromisesMixin = require("../../../mixins/Promises");
var uniformValuesForUniforms = require("../UniformsEditor/uniformValuesForUniforms");

var validator = require("../../../glslio/validator");
var router = require("../../../core/router");
var model = require("../../../model");
var textures = require("../../../images/textures");

var ignoredUniforms = ["progress", "resolution", "from", "to"];

var unsupportedTypes = ["samplerCube"];

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
  tabs: {
    uniforms: {
      title: "Params",
      icon: "fa-tasks",
      render: function () {
        return <UniformsEditor initialUniformValues={this.state.rawTransition.uniforms} uniforms={this.state.uniformTypes} onUniformsChange={this.onUniformsChange} />;
      }
    },
    doc: {
      title: "Help",
      icon: "fa-info",
      render: function () {
        return <GlslContextualHelp token={this.state.token} />;
      }
    },
    config: {
      title: "Config.",
      icon: "fa-cogs",
      render: function () { return "Nothing yet."; }
    }
  },
  getInitialState: function () {
    var validation = validator.forGlsl(this.props.initialTransition.glsl);
    var uniformTypes = validation.compiles() ? validation.uniforms() : {};
    validation.destroy();
    var uniforms = textures.resolver.resolveSync(this.props.initialTransition.uniforms);
    return {
      width: this.computeWidth(),
      height: this.computeHeight(),
      // FIXME: we should rename rawTransition to transition, and just keep the transformedUniforms
      rawTransition: this.props.initialTransition,
      transition: _.defaults({ uniforms: uniforms }, this.props.initialTransition),
      uniformTypes: keepCustomUniforms(uniformTypes),
      saveStatusMessage: null,
      saveStatus: null,
      token: null,
      tab: _.size(_.keys(uniforms))>0 ? "uniforms" : "doc"
    };
  },
  componentWillMount: function () {
    this.lastSavingTransition = this.lastSavedTransition = this.state.rawTransition;
  },
  componentDidMount: function () {
    window.addEventListener("resize", this._onResize=_.bind(this.onResize, this), false);
  },
  componentWillUnmount: function () {
    window.removeEventListener("resize", this._onResize);
    this.lastSavingTransition = this.lastSavedTransition = null;
    window.onbeforeunload = null;
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

    var tab = this.tabs[this.state.tab];
    var tabContent = tab.render.apply(this, arguments);
    var tabs = _.map(this.tabs, function (t, tid) {
      var isCurrent = this.state.tab === tid;
      var f = _.bind(function () {
        return this.setStateQ({ tab: tid });
      }, this);
      var cls = ["tab"];
      if (isCurrent) cls.push("current");
      return <Button className={cls.join(" ")} f={f} title={t.title}>
        <i className={ "fa "+t.icon }></i><span> {t.title}</span>
      </Button>;
    }, this);

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

          <div className="tabs">{tabs}</div>
          <div className="tabContent">{tabContent}</div>
        </div>

        <TransitionEditor onCursorTokenChange={this.onCursorTokenChange} onChangeSuccess={this.onGlslChangeSuccess} onChangeFailure={this.onGlslChangeFailure} initialGlsl={transition.glsl} onSave={this.onSave} width={editorWidth} height={editorHeight} />
      </div>
    </div>;
  },
  computeWidth: function () {
    return window.innerWidth;
  },
  computeHeight: function () {
    return window.innerHeight - 60;
  },
  setStateWithUniforms: function (state) {
    return textures.resolver.resolve(state.transition.uniforms)
      .then(_.bind(function (uniforms) {
        var transition = _.defaults({ uniforms: uniforms }, state.transition);
        return this.setStateQ(_.defaults({ transition: transition, rawTransition: state.transition }, state));
      }, this));
  },
  setSaveStatus: function (status, message) {
    return this.setStateQ({
      saveStatus: status,
      saveStatusMessage: message
    });
  },
  saveTransition: function () {
    var transition = _.cloneDeep(this.state.rawTransition);
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
    var transition = _.cloneDeep(this.state.rawTransition);
    this.lastSavingTransition =  transition;
    return this.setSaveStatus("info", "Creating...")
      .thenResolve(transition)
      .then(_.bind(model.createNewTransition, model))
      .then(_.bind(function (r) {
        transition.id = r.id;
        return model.saveTransition(transition);
      }, this))
      .then(_.bind(function () {
        return this.setStateWithUniforms({ transition: transition });
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
      return this.setStateWithUniforms({
          transition: _.defaults({ name: name }, this.state.rawTransition)
        })
        .then(_.bind(this.saveTransition, this))
        .then(_.bind(router.reload, router));
    }
    else {
      window.alert("Title must be alphanumeric.");
    }
  },  
  onCursorTokenChange: function (token) {
    this.setState({
      token: token
    });
  },
  onGlslChangeFailure: function () {
  },
  onGlslChangeSuccess: function (glsl, allUniformTypes) {
    var uniformTypes = keepCustomUniforms(allUniformTypes);
    this.setStateWithUniforms({
      transition: _.defaults({
        glsl: glsl,
        uniforms: uniformValuesForUniforms(uniformTypes, this.state.rawTransition.uniforms)
      }, this.state.transition),
      uniformTypes: uniformTypes
    });
  },
  onUniformsChange: function (uniforms) {
    this.setStateWithUniforms({
      transition: _.defaults({ uniforms: uniforms }, this.state.rawTransition)
    });
  },
  hasUnsavingChanges: function () {
    return !_.isEqual(this.lastSavingTransition, this.state.rawTransition);
  },
  hasUnsavedChanges: function () {
    return !_.isEqual(this.lastSavedTransition, this.state.rawTransition);
  }
});

module.exports = EditorScreen;

