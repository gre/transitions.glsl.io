/** @jsx React.DOM */
var React = require("react");
var Q = require("q");
var Button = require("../Button");
var PromisesMixin = require("../../core/mixins/Promises");

var TransitionStar = React.createClass({
  mixins: [PromisesMixin],
  propTypes: {
    count: React.PropTypes.number.isRequired,
    starred: React.PropTypes.bool.isRequired,
    star: React.PropTypes.func,
    unstar: React.PropTypes.func
  },
  getInitialState: function () {
    return {
      starred: this.props.starred
    };
  },
  action: function () {
    var self = this;
    if (this.state.starred && this.props.unstar) {
      return Q.fcall(this.props.unstar)
        .then(function () {
          return self.setStateQ({ starred: false });
        });
    }
    else if (!this.state.starred && this.props.star) {
      return Q.fcall(this.props.star)
        .then(function () {
          return self.setStateQ({ starred: true });
        });
    }
  },
  render: function () {
    return <Button f={this.action} className={"transition-star" + (this.props.count ? "" : " no-stars") + (this.state.starred ? " starred" : " unstarred")}>
      <i className="fa fa-star"></i>&nbsp;{this.props.count}
    </Button>;
  }
});

module.exports = TransitionStar;
