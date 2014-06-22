/** @jsx React.DOM */
var React = require("react");
var _ = require("lodash");
var textures = require("../../../images/textures");

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
  onChange: function (e) {
    this.props.onChange(e);
  },
  render: function () {
    var maybeUrl;
    if (this.props.value) {
      try {
        maybeUrl = textures.resolveUrl(this.props.value);
      }
      catch (e) {
        console.error(e && e.stack || e);
      }
    }
    return <div className={"texture-picker "+(this.props.className||"")}>
      <select onChange={this.onChange} defaultValue={this.props.value}>
        <option key="null" value={null}>(none)</option>
        {_.map(textures.names, function (name) {
          return <option key={name} value={name}>{name}</option>;
        }, this)}
      </select>
      { !maybeUrl ? '' :
        <img src={maybeUrl} style={{ width: "24px", height: "24px" }} />
      }
    </div>;
  }
});

module.exports = TexturePicker;
