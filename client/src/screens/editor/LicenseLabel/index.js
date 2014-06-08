/** @jsx React.DOM */
var React = require("react");
var Link = require("../../../ui/Link");

var LicenseLabel = React.createClass({
  render: function () {
    return <span className="license-label">
      <Link href="http://opensource.org/licenses/mit-license.html" target="_blank">
        MIT License
      </Link>
    </span>;
  }
});

module.exports = LicenseLabel;

