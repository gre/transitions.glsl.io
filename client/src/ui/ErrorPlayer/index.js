/** @jsx React.DOM */
var React = require("react");

var ErrorView = React.createClass({
  render: function () {
    var width = this.props.width;
    var height = this.props.height;
    return (
      <div className={"linear-player "+this.props.className} style={{width:width+"px", height:height+"px"}}>
        <div className="error">
          <h2>
            Error loading the video
          </h2>
          <p>
            {""+this.props.error}
          </p>
        </div>
      </div>
    );
  }
});

module.exports = ErrorView;

