/** @jsx React.DOM */
var React = require("react");
var _ = require("lodash");
var inputPrimitiveTypes = require("./primitiveTypes");
var textures = require("../../../images/textures");

var UniformComponentInput = React.createClass({
  propTypes: {
    id: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired,
    primitiveType: React.PropTypes.string.isRequired
  },
  onSelectChange: function () {
    var i = this.refs.select.getDOMNode().selectedIndex;
    var value = i===0 ? null : textures.names[i-1];
    if (this.props.value !== value) {
      this.props.onChange(value);
    }
  },
  render: function () {
    if (this.props.primitiveType === "sampler2D") {
      return <select ref="select" onChange={this.onSelectChange} defaultValue={this.props.value}>
        <option key="null" value={null}>(none)</option>
        {_.map(textures.names, function (name) {
          return <option key={name} value={name}>{name}</option>;
        }, this)}
      </select>;
    }
    else {
      var primitive = inputPrimitiveTypes[this.props.primitiveType];
      var onChange = this.props.onChange;
      var props = {
        className: "uniform-component-input",
        key: this.props.id,
        type: primitive.type,
        onChange: function (e) {
          onChange(primitive.get(e.target));
        }
      };
      if ("step" in primitive)
        props.step = primitive.step;
      if ("checked" in primitive)
        props.checked = this.props.value || primitive.checked;
      else
        props.value = this.props.value || primitive.value;
      props = _.extend({}, this.props, props);
      var input = React.DOM.input(props);
      return input;
    }
  }
});

module.exports = UniformComponentInput;
