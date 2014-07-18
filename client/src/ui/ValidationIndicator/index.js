/** @jsx React.DOM */
var React = require("react");
var _ = require("lodash");
var Button = require("../Button");

var ValidationIndicator = React.createClass({
  propTypes: {
    errors: React.PropTypes.array.isRequired
  },
  getInitialState: function () {
    return {
      opened: false
    };
  },
  toggle: function () {
    this.setState({
      opened: !this.state.opened
    });
  },
  render: function () {
    var errors = this.props.errors;
    if (errors.length) {
      return <Button className="validation-indicator error" f={this.toggle}>
        <div className="icon">
          <i className="fa fa-warning"></i>
        </div>
        { !this.state.opened ? '' :
        <div className="reasons">
          <ul>{_.map(errors, function (error) {
            return <li>{error}</li>;
          })}
          </ul>
        </div>
        }
      </Button>;
    }
    else {
      return <Button className="validation-indicator success" f={_.noop}>

      </Button>;
    }
  }
});

module.exports = ValidationIndicator;
