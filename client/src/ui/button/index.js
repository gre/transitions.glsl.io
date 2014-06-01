/** @jsx React.DOM */
var React = require("react");
var ClickButton = require("../../core/clickbutton");

var Button = React.createClass({
  render: function () {
    return <a href="" className={this.props.className} dangerouslySetInnerHTML={{__html: this.props.content}} />;
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

