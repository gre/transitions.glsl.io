/** @jsx React.DOM */
var React = require("react");
var LinearPlayer = require("../LinearPlayer");

var LoadingPlayer = React.createClass({
  render: function () {
    return (
      <LinearPlayer
        className="image-linear-player"
        width={this.props.width}
        height={this.props.height}
        transition={this.props.transition}
        running={false}>
        <div className="loading">
          <h2>
            <i className="fa fa-circle-o-notch fa-spin"></i>
            &nbsp;
            Loading...
          </h2>
        </div>
      </LinearPlayer>
    );
  }
});

module.exports = LoadingPlayer;

