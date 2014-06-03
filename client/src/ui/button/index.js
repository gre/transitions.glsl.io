/** @jsx React.DOM */
var React = require("react");
var ClickButton = require("../../core/clickbutton");

/**
 * FIXME reimplement the button logic inline and with State
 */

var Button = React.createClass({
  propTypes: {
    f: React.PropTypes.func.isRequired
  },
  render: function () {
    return this.transferPropsTo(
      <a href="">{this.props.children}</a>
    );
  },
  componentDidMount: function () {
    this.button = ClickButton.create({
      el: this.getDOMNode(),
      f: this.props.f
    });
    this.button.bind();
  },
  componentWillUnmount: function () {
    this.button.unbind();
    delete this.button;
  }
});

module.exports = Button;

