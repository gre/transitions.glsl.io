/** @jsx React.DOM */
var React = require("react");
var _ = require("lodash");
var inputPrimitiveTypes = require("./primitiveTypes");

var UniformComponentInput = React.createClass({
  propTypes: {
    id: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired,
    primitiveType: React.PropTypes.string.isRequired
  },
  render: function () {
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
      props.checked = primitive.value || primitive.checked;
    else
      props.value = this.props.value || primitive.value;
    props = _.extend({}, this.props, props);
    var input = React.DOM.input(props);
    return input;
  }
});

module.exports = UniformComponentInput;
