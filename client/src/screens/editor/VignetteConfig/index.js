/** @jsx React.DOM */
var React = require("react");
var NumberInput = require("../../../ui/NumberInput");
//var _ = require("lodash");

var ConfigField = React.createClass({
  render: function () {
    return <dl>
      <label>
        <dt>{ this.props.title }</dt>
        <dd>{ this.props.children }</dd>
      </label>
    </dl>;
  }
});

var VignetteConfig = React.createClass({
  propTypes: {
    transitionDelay: React.PropTypes.number.isRequired,
    transitionDuration: React.PropTypes.number.isRequired,
    bezierEasing: React.PropTypes.array.isRequired,
    onDurationChange: React.PropTypes.func.isRequired,
    onDelayChange: React.PropTypes.func.isRequired,
    onBezierEasingChange: React.PropTypes.func.isRequired
  },
  onDelayChange: function (e) {
    this.props.onDelayChange(parseInt(e.target.value, 10));
  },
  onDurationChange: function (e) {
    this.props.onDurationChange(parseInt(e.target.value, 10));
  },
  onBezierEasingChange: function (e) {
    var arr = [];
    var split = e.target.value.split(" ");
    split.forEach(function (str) {
      var n = parseFloat(str, 10);
      if (!isNaN(n))
        arr.push(n);
    });
    if (split.length === 4 && arr.length === 4 && 0<=arr[2]&&arr[2]<=1 && 0<=arr[0]&&arr[0]<=1) {
      this.props.onBezierEasingChange(arr);
    }
  },
  render: function () {
    return <div className="vignette-config">
      <h2>Transition configuration</h2>
      <ConfigField title="Bezier Easing">
        <input type="text" onChange={this.onBezierEasingChange} defaultValue={this.props.bezierEasing.join(" ")} />
        <em style={{ fontSize: "0.6em", opacity: 0.5 }}>(proper UI soon)</em>
      </ConfigField>
      <ConfigField title="Duration">
        <NumberInput onChange={this.onDurationChange} type="range" step={100} min={100} max={4000} value={this.props.transitionDuration} />
      </ConfigField>
      <ConfigField title="Pause Delay">
        <NumberInput onChange={this.onDelayChange} type="range" step={100} min={0} max={1000} value={this.props.transitionDelay} />
      </ConfigField>
  
      <div className="extra">
        {this.props.children}
      </div>
    </div>;
  }
});

module.exports = VignetteConfig;
