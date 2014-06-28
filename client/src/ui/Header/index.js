/** @jsx React.DOM */

var React = require("react");
var _ = require("lodash");
var Link = require("../Link");
var Logo = require("../Logo");

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
        <Link className="logout" href="/logout">logout</Link>
        <span> - </span>
        <Link className="profile" target="_blank" href={"/user/"+user}>
          <i className="fa fa-github"></i>&nbsp;
          {user}
        </Link>
      </span>
      :
      <Link className="github connect" href="/authenticate">
        Connect with <i className="fa fa-github"></i> Github
      </Link>
      ;

    var links = _.compact([
      { id: "gallery", href: "/", name: "Gallery" },
      !this.props.user ? null : { id: "me", href: "/me", name: "My Transitions" },
      { id: "editor", href: "/transition/new", name: "Editor" },
      { id: "blog", href: "/blog", name: "Blog" }
    ]);

    var navs = _.map(links, function (nav) {
      return <Link key={nav.id} className={nav.id+(screenName===nav.id ? " current" : "")} href={nav.href}>{nav.name}</Link>;
    });

    return <header className="app-header">
      <Logo />
      <nav>
        {navs}
      </nav>
      {userPart}
    </header>;
  }
});

module.exports = Header;
