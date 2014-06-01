/** @jsx React.DOM */
var React = require("react");
var TransitionPreview = require("../TransitionPreview");
var TransitionsBrowserPager = require("../TransitionsBrowserPager");

var TransitionsBrowser = React.createClass({
  render: function () {
    var transitions = this.props.transitions.map(function (transition) {
      return TransitionPreview({
        width: this.props.thumbnailWidth,
        height: this.props.thumbnailHeight,
        images: this.props.images,
        glsl: transition.glsl,
        uniforms: transition.uniforms,
        id: transition.id,
        name: transition.name,
        owner: transition.owner
      });
    }, this);
    return <div className="transitions-browser">
      {this.props.children}
      <div>{transitions}</div>
      <TransitionsBrowserPager />
    </div>;
  }
});

module.exports = TransitionsBrowser;

