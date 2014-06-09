/** @jsx React.DOM */
var React = require("react");
var _ = require("lodash");
var UniformEditor = require("../UniformEditor");
var uniformValuesForUniforms = require("./uniformValuesForUniforms");

var UniformsEditor = React.createClass({
  propTypes: {
    uniforms: React.PropTypes.object.isRequired,
    initialUniformValues: React.PropTypes.object,
    onUniformsChange: React.PropTypes.func
  },
  getInitialProps: function () {
    return {
      onUniformsChange: _.noop
    };
  },
  getInitialState: function () {
    var uniformTypes = this.props.uniforms;
    return {
      uniformValues: uniformValuesForUniforms(uniformTypes, this.props.initialUniformValues || {})
    };
  },
  recomputeUniformValues: function () {
    return _.cloneDeep(uniformValuesForUniforms(this.props.uniforms, this.state.uniformValues));
  },
  onUniformChange: function (u) {
    return _.bind(function (value, index) {
      var uniformValues = this.recomputeUniformValues();
      if (_.isArray(uniformValues[u])) {
        uniformValues[u][index] = value;
      }
      else {
        uniformValues[u] = value;
      }
      this.setState({ uniformValues: uniformValues });
      this.props.onUniformsChange(uniformValues);
    }, this);
  },
  render: function () {
    var uniforms = _.map(this.props.uniforms, function (type, u) {
      var onUniformChange = this.onUniformChange(u);
      var id = "uniform_"+u;
      return <UniformEditor id={id} key={id} type={type} name={u} value={this.state.uniformValues[u]} onChange={onUniformChange} />;
    }, this);

    if (uniforms.length) {
      return <div className="uniforms-editor">{uniforms}</div>;
    }
    else {
      return <div className="uniforms-editor-no-uniforms">
        <p>
          No uniform parameters are currently used by this transition.
        </p>
        <p>
          You could define a few custom uniforms for allowing
          a better Transition customization?
        </p>
      </div>;
    }
  }
});

module.exports = UniformsEditor;
