/** @jsx React.DOM */
var React = require("react");
var Vignette = require("../../../ui/Vignette");

var TransitionPreview = React.createClass({
  propTypes: {
    id: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
    owner: React.PropTypes.string.isRequired
  },
  render: function () {
    var href = "/transition/"+this.props.id;
    return this.transferPropsTo(
      <Vignette defaultProgress={0.4} href={href}>
        {this.props.children}
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
