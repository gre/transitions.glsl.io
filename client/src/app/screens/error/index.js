/** @jsx React.DOM */
var React = require("react");
var Link = require("../../../ui/Link");

var ErrorScreen = React.createClass({
  render: function () {
    var e = this.props.error;
    if (e && e.stack)
      console.log(e.stack);
    var msg = e.message || e;
    if (e instanceof window.XMLHttpRequest) {
      msg = e.status+" "+e.statusText;
    }

    var reportBugUrl = "https://github.com/glslio/glsl.io/issues/new?"+
      "title="+encodeURIComponent("Crash Report: "+msg)+
      "&body="+encodeURIComponent("**URL:**\n```\n"+window.location.href+"\n```\n**Log detail:**\n```\n"+(e && e.stack || (e+"\n"+msg))+"\n```");

    return <div id="screen-error">
      <h2 className="error-title">
        <i className="fa fa-meh-o"></i>&nbsp;Oops
      </h2>
      <h3 className="error-msg">{msg}</h3>

      <p className="error-btns">
        <Link href="">
          <i className="fa fa-refresh"></i>&nbsp;Reload
        </Link>
      </p>
  
      <p className="error-report">
        <Link href={reportBugUrl}>
          <i className="fa fa-heart"></i> Report this Bug
        </Link>
      </p>
    </div>;
  }
});

function show (e) {
  return ErrorScreen({ error: e });
}

function init () {
  return {
    title: function (e) {
      return "Error – "+e;
    },
    show: show
  };
}

module.exports = init;
