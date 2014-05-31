/** @jsx React.DOM */

var React = require("react");

var ErrorScreen = React.createClass({
  render: function () {
    var e = this.props.error;
    var msg = e.message || e;
    if (e instanceof window.XMLHttpRequest) {
      msg = e.statusText;
    }
    return <div id="screen-error">
      <h2 className="error-title">
        <i className="fa fa-meh-o"></i>&nbsp;Oops
      </h2>
      <h3 className="error-msg">{msg}</h3>
      <p className="error-btns">
        <a href="">
          <i className="fa fa-refresh"></i>&nbsp;Reload
        </a>
      </p>
    </div>;
  }
});

function show (e) {
  return ErrorScreen({ error: e });
}

function init () {
  return {
    show: show
  };
}

module.exports = init;
