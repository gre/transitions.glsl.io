/** @jsx React.DOM */
var React = require("react");

function dec (n) {
  return Math.floor(n/10);
}

var Fps = React.createClass({
  propTypes: {
    fps: React.PropTypes.number
  },
  render: function () {
    var fps = this.props.fps;
    return <div className={"fps "+(fps ? "dec-"+dec(fps): "none")}>
      <i className="fa fa-tachometer"></i>&nbsp;
      <span className="count">{fps ? fps : "--"}</span>
    </div>;
  }
});

module.exports = Fps;
