/** @jsx React.DOM */

var React = require("react");
var _ = require("lodash");

var Header = React.createClass({
  propTypes: {
    user: React.PropTypes.string,
    screenName: React.PropTypes.string.isRequired
  },
  render: function () {
    var screenName = this.props.screenName;
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

    var navs = _.map([
      { id: "about", href: "/", name: "About" },
      { id: "gallery", href: "/gallery", name: "Gallery" },
      { id: "editor", href: "/transition/new", name: "Editor" },
    ], function (nav) {
      return <a key={nav.id} className={nav.id+(screenName==nav.id ? " current" : "")} href={nav.href}>{nav.name}</a>;
    });

    return <header className="app-header">
      <h1>
        <a href="/" className="logo" id="logo">
          <span>GLSL</span><span>.io</span>
        </a>
      </h1>
      <nav>
        {navs}
      </nav>
      {userPart}
    </header>;
  }
});

module.exports = Header;
