/** @jsx React.DOM */
var React = require("react");
var _ = require("lodash");
var textures = require("../../../images/textures");
var Button = require("../../../ui/Button");
var app = require("../../../core/app");

function resolveUrl (path) {
  try {
    return textures.resolveUrl(path);
  }
  catch (e) {
    console.error(e && e.stack || e);
  }
}

var TexturePicker = React.createClass({
  propTypes: {
    onChange: React.PropTypes.func,
    value: React.PropTypes.string
  },
  getDefaultProps: function () {
    return {
      onChange: _.noop
    };
  },
  getInitialState: function () {
    return {
      opened: false
    };
  },
  onPickerLeave: function () {
    this.setState({
      opened: false
    });
  },
  openPicker: function () {
    this.setState({
      opened: true
    });
    app.overlay(this.onPickerLeave);
  },
  onPickerChoice: function (name) {
    this.setState({
      opened: false
    });
    app.overlay(null);
    this.props.onChange(name);
  },
  render: function () {
    var maybeUrl = this.props.value && resolveUrl(this.props.value);
    var value = this.props.value;
    var cls = ["texture-picker"];
    if (this.props.className) cls.push(this.props.className);
    
    var textureButtons = _.map(textures.names, function (name) {
      var onPickerChoice = _.bind(this.onPickerChoice, this, name);
      return <Button className="texture" f={onPickerChoice}>
        <img src={resolveUrl(name)} style={{ width: "40px", height: "40px" }} />
      </Button>;
    }, this);

    return <div className={cls.join(" ")}>
      <Button className="picker-input" f={this.openPicker}>
        {value ? value+"" : "(none)"}
      </Button>
      <Button className="overview" f={this.openPicker}>
      { !maybeUrl ? '' :
        <img src={maybeUrl} style={{ width: "24px", height: "24px" }} />
      }
      </Button>
      <div className={"picker with-overlay"+(this.state.opened ? " visible" : "")}>
        <div className="picker-container">
          {textureButtons}
        </div>
      </div>
    </div>;
  }
});

module.exports = TexturePicker;
