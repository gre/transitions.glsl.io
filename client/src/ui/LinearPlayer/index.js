/** @jsx React.DOM */
var React = require("react");
var GlslTransitionCore = require("glsl-transition-core");

var PlayButton = React.createClass({
  render: function () {
    return <div className="play-button-container" onClick={this.props.onClick}>
      <div className="play-button" style={{ marginTop: this.props.y }}>
        {this.props.children}
      </div>
    </div>;
  }
});

var LinearPlayer = React.createClass({
  propTypes: {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    transition: React.PropTypes.object.isRequired,
    running: React.PropTypes.bool.isRequired,
    start: React.PropTypes.func,
    stop: React.PropTypes.func
  },
  render: function () {
    var transition = this.props.transition;
    var width = this.props.width;
    var height = this.props.height;

    return <div className={"linear-player "+(this.props.running ? "running" : "")+" "+this.props.className} style={{width:width+"px", height:height+"px"}}>
      <header>
        { this.props.start && !this.props.running ?
        <div onClick={this.props.start} className="play-pause-button">
          <i className="fa fa-play"></i>
        </div>
        : '' }
        { this.props.stop && this.props.running ?
        <div onClick={this.props.stop} className="play-pause-button">
          <i className="fa fa-pause"></i>
        </div>
        : '' }
        <a className="name" href={"/transition/"+transition.id} target="_blank">{ transition.name }</a>
        <span> by </span>
        <a className="owner" href={"/user/"+transition.owner} target="_blank">{ transition.owner }</a>
      </header>
      { !GlslTransitionCore.isSupported() ?
        <div className="error">
          <h2>
          WebGL is not supported.
          </h2>
          <p>
            Supported browsers: Chrome, Firefox, IE 11+, iOS 8+, Android 4+, Opera,...
          </p>
        </div>
        :
        <div>
          {this.props.children}
          { !this.props.running && this.props.start ?
          <PlayButton onClick={this.props.start} y={Math.floor(38+(height-40-38)/2)}>▶</PlayButton>
          : ''}
        </div>
      }
    </div>;
  }
});

module.exports = LinearPlayer;
