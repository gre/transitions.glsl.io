/** @jsx React.DOM */
var React = require("react");
var Vignette = require("../../../ui/Vignette");

var TransitionPreview = React.createClass({
  render: function () {
    var href = "/transition/"+this.props.id;
    return this.transferPropsTo(
      <Vignette href={href}>
        <span className="title">
          <em>{this.props.name}</em>
          <span> by </span>
          <strong>{this.props.owner}</strong>
          </span>
      </Vignette>
    );
  }
});

module.exports = TransitionPreview;
