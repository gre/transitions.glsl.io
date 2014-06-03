/** @jsx React.DOM */
var React = require("react");
var Vignette = require("../../../ui/Vignette");

var EditorTransitionPreview = React.createClass({
  render: function () {
    return this.transferPropsTo(
      <Vignette autostart={true}>
      </Vignette>
    );
  }
});

module.exports = EditorTransitionPreview;

