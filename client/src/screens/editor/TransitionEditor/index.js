/** @jsx React.DOM */
var React = require("react");
var GlslEditor = require("../GlslEditor");
var StatusMessage = require("../StatusMessage");
var Validator = require("../../../core/glslFragmentValidator");

var TransitionEditor = React.createClass({
  propTypes: {
    onChangeSuccess: React.PropTypes.func.isRequired,
    onChangeFailure: React.PropTypes.func.isRequired
  },
  getInitialState: function () {
    return {
      compilationStatus: "unknown",
      compilationMessage: "Loading..."
    };
  },
  isCompiling: function () {
    return this.state.compilationStatus === "success";
  },
  onChange: function (glsl) {
    if (this.marker) {
      session.removeMarker(this.marker.id);
      this.marker = null;
    }
    if (!glsl) {
      this.marker = session.highlightLines(0, 0);
      this.setState({
        compilationStatus: "warning",
        compilationMessage: "Shader cannot be empty"
      });
      this.props.onChangeFailure(glsl);
    }
    else {
      var _ref = this.validator.validate(glsl), ok = _ref[0], line = _ref[1], msg = _ref[2];
      compiles = !!ok;
      if (ok) {
        this.setState({
          compilationStatus: "success",
          compilationMessage: "Shader successfully compiled"
        });
        this.props.onChangeSuccess(glsl);
      } else {
        line = Math.max(0, line - 1);
        this.marker = session.highlightLines(line, line);
        this.setState({
          compilationStatus: "error",
          compilationMessage: "Line " + line + " : " + msg
        });
        this.props.onChangeFailure(glsl);
      }
    }
  },
  render: function () {
    return <div className="transition-editor">
      {this.transferPropsTo(<GlslEditor onChange={this.onChange} />)}
      <StatusMessage type={this.state.compilationStatus}>{this.state.compilationMessage}</StatusMessage>
    </div>;
  },
  componentDidMount: function () {
    this.validator = new Validator();
  }
});

module.exports = TransitionEditor;
