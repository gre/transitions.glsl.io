/** @jsx React.DOM */
var React = require("react");
var _ = require("lodash");
var inputPrimitiveTypes = require("./primitiveTypes");
var NumberInput = require("./NumberInput");
var TexturePicker = require("./TexturePicker");

var UniformComponentInput = React.createClass({
  propTypes: {
    id: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired,
    primitiveType: React.PropTypes.string.isRequired
  },
  onChange: function (e) {
    var primitive = inputPrimitiveTypes[this.props.primitiveType];
    var value = primitive ? primitive.get(e.target) : e;
    if (value !== this.props.value) {
      this.props.onChange(value);
    }
  },
  render: function () {
    if (this.props.primitiveType === "sampler2D") {
      return <TexturePicker className="uniform-component-input" key={this.props.id} onChange={this.onChange} value={this.props.value} />;
    }
    else {
      var primitive = inputPrimitiveTypes[this.props.primitiveType];
      var props = {
        className: "uniform-component-input",
        key: this.props.id,
        type: primitive.type,
        onChange: this.onChange
      };
      if ("step" in primitive)
        props.step = primitive.step;
      if ("checked" in primitive)
        props.checked = this.props.value || primitive.checked;
      else
        props.value = this.props.value || primitive.value;
      props = _.extend({}, this.props, props);
      if (props.type === "number")
        return NumberInput(props);
      else
        return React.DOM.input(props);
    }
  }
});

module.exports = UniformComponentInput;
