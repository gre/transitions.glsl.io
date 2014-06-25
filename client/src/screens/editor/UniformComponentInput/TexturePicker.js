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
      opened: false,
      url: this.props.value,
      urlInvalid: false
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
      urlInvalid: false,
      opened: false,
      url: name
    });
    app.overlay(null);
    return this.props.onChange(name);
  },
  onUrlEdit: function (e) {
    var url = e.target.value;
    // Because the user can paste without http(s) or without the i.imgur, we force that. Those are the only which seems to support CORS properly (and we also want HTTPS)
    var matches = url.match(/.*imgur.com(.*)/);
    if (matches) {
      url = "https://i.imgur.com" + matches[1];
    }
    this.setState({
      url: url
    });
  },
  onUrlSend: function () {
    var self = this;
    var url = self.state.url;
    return textures.resolver.loadTexture(url)
      .then(function () {
        return self.onPickerChoice(url);
      }, function () {
        self.setState({ urlInvalid: true });
      });
  },
  render: function () {
    var maybeUrl = this.props.value && resolveUrl(this.props.value);
    var value = this.props.value;
    var cls = ["texture-picker"];
    if (this.props.className) cls.push(this.props.className);
    
    var textureButtons = _.map(textures.names, function (name) {
      var onPickerChoice = _.bind(this.onPickerChoice, this, name);
      var isCurrent = name === value;
      return <Button key={name} className={"texture"+(isCurrent ? " current" : "")} f={onPickerChoice}>
        <img src={resolveUrl(name)} style={{ width: "44px", height: "44px" }} />
      </Button>;
    }, this);

    return <div className={cls.join(" ")}>
      <Button key="picker-input" className="picker-input" f={this.openPicker}>
        {value ? value+"" : "(none)"}
      </Button>
      <Button key="overview" className="overview" f={this.openPicker}>
      { !maybeUrl ? '' :
        <img src={maybeUrl} style={{ width: "24px", height: "24px" }} />
      }
      </Button>
      <div className={"picker with-overlay"+(this.state.opened ? " visible" : "")}>
        <div className="picker-container">
          <div className="textures">
            {textureButtons}
          </div>
          <strong>Or use an imgur.com URL:</strong>
          <div className={"url"+(this.state.urlInvalid ? " invalid" : "")}>
            <input type="text" value={this.state.url} onChange={this.onUrlEdit} />
            <Button f={this.onUrlSend}>Use</Button>
          </div>
        </div>
      </div>
    </div>;
  }
});

module.exports = TexturePicker;
