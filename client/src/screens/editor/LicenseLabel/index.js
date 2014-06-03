/** @jsx React.DOM */
var React = require("react");

var LicenseLabel = React.createClass({
  render: function () {
    return <span className="license-label">
      <a href="http://opensource.org/licenses/mit-license.html" target="_blank">
        MIT License
      </a>
    </span>;
  }
});

module.exports = LicenseLabel;

