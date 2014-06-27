/** @jsx React.DOM */
var React = require("react");
var _ = require("lodash");
var Button = require("../../../ui/Button");

var ValidationIndicator = React.createClass({
  propTypes: {
    errors: React.PropTypes.array.isRequired
  },
  render: function () {
    var errors = this.props.errors;
    if (errors.length) {
      return <Button className="validation-indicator error" f={_.noop}>
        <i className="fa fa-warning"></i>
        <div className="reasons">
          <ul>{_.map(errors, function (error) {
            return <li>{error}</li>;
          })}
          </ul>
        </div>
      </Button>;
    }
    else {
      return <Button className="validation-indicator success" f={_.noop}>

      </Button>;
    }
  }
});

module.exports = ValidationIndicator;
