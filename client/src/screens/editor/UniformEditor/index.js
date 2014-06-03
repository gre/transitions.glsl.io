/** @jsx React.DOM */
var React = require("react");
var _ = require("lodash");
var UniformComponentInput = require("../UniformComponentInput");
var arityForType = require("./arityForType");
var componentLinesForType = require("./componentLinesForType");
var primitiveForType = require("./primitiveForType");
var labelsForType = require("./labelsForType");

var UniformEditor = React.createClass({
  propTypes: {
    onChange: React.PropTypes.func.isRequired,
    id: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
    type: React.PropTypes.string.isRequired
  },
  render: function () {
    var id = this.props.id;
    var type = this.props.type;
    var labelName = this.props.name;
    var onChange = this.props.onChange;
    var value = this.props.value;
    var primitiveType = primitiveForType(type);
    var arity = arityForType(type);
    var componentLines = componentLinesForType(type);
    var labels = labelsForType(type, labelName);
    function onChangeForIndex (index) {
      return function (value) {
        onChange(value, index);
      };
    }

    var inputsLines = _.map(_.range(0, componentLines), function (l) {
      var inputsPerLine = arity / componentLines;
      var inputs = (function(){
        if (inputsPerLine === 1) {
          var iid = id+"_"+l;
          return <UniformComponentInput key={iid} id={iid} primitiveType={primitiveType} value={value} onChange={onChangeForIndex(null)} />;
        }
        else {
          return _.map(_.range(0, inputsPerLine), function (i) {
            var index = l * inputsPerLine + i;
            var iid = id+"_"+index;
            return <label htmlFor={iid}>
              <span>{labels && labels[index] || ""}</span>
              <UniformComponentInput key={iid} id={iid} primitiveType={primitiveType} value={value && value[index]} onChange={onChangeForIndex(index)} />
            </label>;
          });
        }
      }());
      return <div className={"inputs inputs-"+inputsPerLine}>{inputs}</div>;
    });

    return <p className={"type-"+type}>
      <label htmlFor="{id}">{labelName}</label>
      {inputsLines}
    </p>;
  }
});

module.exports = UniformEditor;
