/** @jsx React.DOM */
var React = require("react");
var _ = require("lodash");
var UniformEditor = require("../UniformEditor");

var UniformsEditor = React.createClass({
  propTypes: {
    uniforms: React.PropTypes.object.isRequired,
    initialUniformValues: React.PropTypes.object,
    onUniformsChange: React.PropTypes.func
  },
  getInitialState: function () {
    return {
      uniformValues: this.props.initialUniformValues || {}
    };
  },
  render: function () {
    var onUniformsChange = this.props.onUniformsChange || _.noop;
    var uniforms = _.map(this.props.uniforms, function (type, u) {
      var onUniformChange = _.bind(function (value, index) {
        var uniformValues = _.cloneDeep(this.state.uniformValues);
        if (_.isArray(uniformValues[u])) {
          uniformValues[u][index] = value;
        }
        else {
          uniformValues[u] = value;
        }
        this.setState({ uniformValues: uniformValues });
        onUniformsChange(uniformValues);
      }, this);
      var id = "uniform_"+u;
      return <UniformEditor id={id} key={id} type={type} name={u} value={this.state.uniformValues[u]} onChange={onUniformChange} />;
    }, this);

    if (uniforms.length) {
      return <div>{uniforms}</div>;
    }
    else {
      return <div class="no-uniforms">
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
