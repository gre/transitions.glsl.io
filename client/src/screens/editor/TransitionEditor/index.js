/** @jsx React.DOM */
var React = require("react");
var Validator = require("glsl-transition-validator");
var GlslEditor = require("../GlslEditor");
var StatusMessage = require("../StatusMessage");

var TransitionEditor = React.createClass({
  propTypes: {
    onChangeSuccess: React.PropTypes.func.isRequired,
    onChangeFailure: React.PropTypes.func.isRequired
  },
  getInitialState: function () {
    this.validator = new Validator();
    return this.compile(this.props.initialGlsl);
  },
  isCompiling: function () {
    return this.state.compilationStatus === "success";
  },
  compile: function (glsl) {
    if (!glsl) {
      return {
        uniforms: {},
        line: 0,
        compilationStatus: "error",
        compilationMessage: "Shader cannot be empty"
      };
    }
    else {
      var _ref = this.validator.validate(glsl), ok = _ref[0], line = _ref[1], msg = _ref[2];
      if (ok) {
        return {
          uniforms: ok,
          line: null,
          compilationStatus: "success",
          compilationMessage: "Shader successfully compiled"
        };
      } else {
        line = Math.max(0, line - 1);
        return {
          uniforms: {},
          line: line,
          compilationStatus: "error",
          compilationMessage: "Line " + line + " : " + msg
        };
      }
    }
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
