/** @jsx React.DOM */

var React = require("react");

var Header = React.createClass({
  propTypes: {
    user: React.PropTypes.string.isRequired
  },
  render: function () {
    var user = this.props.user;
    var userPart = user ?
      <span className="github">
        <a className="logout" href="/logout">logout</a>
        <span> - </span>
        <a className="profile" target="_blank" href="https://gist.github.com/{user}">
          <i className="fa fa-github"></i>&nbsp;
          {user}
        </a>
      </span>
      :
      <a className="github connect" href="/authenticate">
        Connect with <i className="fa fa-github"></i> Github
      </a>
      ;
    // Use a "current screen" state
    return <header id="header">
      <h1>
        <a href="/" className="logo" id="logo">
          <span>GLSL</span><span>.io</span>
        </a>
      </h1>
      <nav>
        <a className="home" href="/">About</a>
        <a className="gallery" href="/gallery">Gallery</a>
        <a className="editor" href="/transition/new">Editor</a>
      </nav>
      {userPart}
    </header>;
  }
});

module.exports = Header;
