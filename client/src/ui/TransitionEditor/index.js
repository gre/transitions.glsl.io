/** @jsx React.DOM */
var React = require("react");
var GlslEditor = require("../GlslEditor");
var StatusMessage = require("../StatusMessage");
var validator = require("../../glslio/validator");

var TransitionEditor = React.createClass({
  propTypes: {
    onChangeSuccess: React.PropTypes.func.isRequired,
    onChangeFailure: React.PropTypes.func.isRequired
  },
  getInitialState: function () {
    return this.compile(this.props.initialGlsl);
  },
  isCompiling: function () {
    return this.state.compilationStatus === "success";
  },
  compile: function (glsl) {
    var validation = validator.forGlsl(glsl);
    var compile = validation.compile();
    var result;
    if (compile.compiles) {
      result = {
        uniforms: validation.uniforms(),
        line: null,
        compilationStatus: "success",
        compilationMessage: "Shader successfully compiled"
      };
    }
    else if ('line' in compile) {
      var line = Math.max(0, compile.line - 1);
      var msg = compile.message;
      result = {
        uniforms: {},
        line: line,
        compilationStatus: "error",
        compilationMessage: "Line " + line + " : " + msg
      };
    }
    else {
      result = {
        uniforms: {},
        line: 0,
        compilationStatus: "error",
        compilationMessage: "Shader cannot be empty"
      };
    }
    validation.destroy();
    return result;
  },
  onChange: function (glsl) {
    var result = this.compile(glsl);
    this.setState(result);
    if (result.compilationStatus === "success") {
      this.props.onChangeSuccess(glsl, result.uniforms);
    }
    else {
      this.props.onChangeFailure(glsl, result);
    }
  },
  componentDidUpdate: function () {
    var line = this.state.compilationStatus === "success" ? null : this.state.line;
    if (this.lastLine !== line) {
      this.lastLine = line;
      var session = this.refs.editor.getSession();
      if (this.marker) {
        session.removeMarker(this.marker.id);
        this.marker = null;
      }
      if (line !== null) {
        this.marker = session.highlightLines(line, line);
      }
    }
  },
  render: function () {
    return <div className="transition-editor">
      {this.transferPropsTo(<GlslEditor ref="editor" onChange={this.onChange} />)}
      <StatusMessage type={this.state.compilationStatus}>{this.state.compilationMessage}</StatusMessage>
    </div>;
  }
});

module.exports = TransitionEditor;
