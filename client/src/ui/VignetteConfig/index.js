/** @jsx React.DOM */
var React = require("react");
var NumberInput = require("../NumberInput");
var Button = require("../Button");
var BezierEditor = require("../BezierEditor");

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
    onBezierEasingChange: React.PropTypes.func.isRequired,
    onResetConfig: React.PropTypes.func.isRequired
  },
  onDelayChange: function (e) {
    this.props.onDelayChange(parseInt(e.target.value, 10));
  },
  onDurationChange: function (e) {
    this.props.onDurationChange(parseInt(e.target.value, 10));
  },
  render: function () {
    return <div className="vignette-config">
      <h2>Transition configuration</h2>
      <ConfigField title="Bezier Easing">
        <BezierEditor
          width={135}
          height={150}
          value={this.props.bezierEasing}
          onChange={this.props.onBezierEasingChange} />
      </ConfigField>
      <ConfigField title="Duration">
        <NumberInput onChange={this.onDurationChange} type="range" step={100} min={100} max={4000} value={this.props.transitionDuration} />
      </ConfigField>
      <ConfigField title="Pause Delay">
        <NumberInput onChange={this.onDelayChange} type="range" step={100} min={0} max={1000} value={this.props.transitionDelay} />
      </ConfigField>

      <ConfigField>
        <Button className="action" f={this.props.onResetConfig}>Reset</Button>
      </ConfigField>
  
      <div className="extra">
        {this.props.children}
      </div>
    </div>;
  }
});

module.exports = VignetteConfig;
