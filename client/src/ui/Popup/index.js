/** @jsx React.DOM */
var React = require("react");
var _ = require("lodash");

var popupParams = "status,toolbar,location,menubar,directories,resizable,scrollbars,height,width".split(",");

var Popup = React.createClass({
  propTypes: {
    href: React.PropTypes.string.isRequired,
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired
  },
  getDefaultProps: function () {
    return {
      width: 500,
      height: 500
    };
  },
  open: function (e) {
    e.preventDefault();
    var url = this.props.href;
    var name = this.props.name;
    var params = _.map(_.pick(this.props, function(value, key) {
      return _.contains(popupParams, key);
    }), function (value, key) { return key+"="+value; }).join(",");
    return window.open(url, name, params);
  },
  render: function () {
    return <a className={"popup "+this.props.className} onClick={this.open} href={this.props.href}>{this.props.children}</a>;
  }
});

module.exports = Popup;

