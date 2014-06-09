/** @jsx React.DOM */
var React = require("react");
var Button = require("../../../ui/button");

var TransitionsBrowserPager = React.createClass({
  propTypes: {
    onPrev: React.PropTypes.func.isRequired,
    onNext: React.PropTypes.func.isRequired,
    hasPrev: React.PropTypes.bool.isRequired,
    hasNext: React.PropTypes.bool.isRequired
  },
  render: function () {
    var page = this.props.page;
    return <div className="transitions-browser-pager">
      {this.props.hasPrev ? <Button f={this.props.onPrev} className="page-nav prev">← Previous</Button> : ''}
      <span className="page-current">Page {page+1}</span>
      {this.props.hasNext ? <Button f={this.props.onNext} className="page-nav next">Next →</Button> : ''}
    </div>;
  }
});

module.exports = TransitionsBrowserPager;

