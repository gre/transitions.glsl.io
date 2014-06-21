/** @jsx React.DOM */
var React = require("react");
var _ = require("lodash");
var ace = window.ace;

var GlslEditor = React.createClass({
  propTypes: {
    initialGlsl: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired,
    onSave: React.PropTypes.func.isRequired,
    width: React.PropTypes.number,
    height: React.PropTypes.number
  },
  getInitialState: function () {
    return { glsl: this.props.initialGlsl };
  },
  getSession: function () {
    return this.session;
  },
  render: function () {
    var width = this.props.width ? this.props.width+"px" : "100%";
    var height = this.props.height ? this.props.height+"px" : "100%";
    return <div className="glsl-editor" style={{ width: width, height: height }}></div>;
  },
  componentDidMount: function () {
    this._lastWidth = this.props.width;
    this._lastHeight = this.props.height;
    var node = this.getDOMNode();
    ace.require("ace/ext/language_tools");
    var editor = ace.edit(node);
    editor.setOptions({
      enableBasicAutocompletion: true
    });
    editor.commands.addCommand({
      name: 'save',
      bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
      exec: _.bind(function () {
        this.props.onSave();
      }, this),
      readOnly: true
    });
    editor.setFontSize("14px");
    editor.setShowPrintMargin(false);
    editor.setTheme("ace/theme/solarized_light");
    var session = editor.getSession();
    session.setTabSize(2);
    session.setMode("ace/mode/glsl");
    session.setUseWrapMode(true);
    editor.focus();
    this.session = session;
    this.editor = editor;
    session.setValue(this._lastGlsl = this.state.glsl);
    session.on("change", _.bind(function () {
      var glsl = session.getValue();
      this.setState({ glsl: this._lastGlsl = glsl });
      this.props.onChange(this.state.glsl);
    }, this));
  },
  componentDidUpdate: function () {
    var glslChanged = this._lastGlsl !== this.state.glsl;
    var resized = this._lastWidth !== this.props.width || this._lastHeight !== this.props.height;
    if (resized) {
      this.editor.resize();
    }
    if (glslChanged) {
      this.session.setValue(this.state.glsl);
    }
  },
  componentWillUnmount: function () {
    this.editor.destroy();
    delete this.editor;
    delete this.session;
  }
});

module.exports = GlslEditor;
