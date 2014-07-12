/** @jsx React.DOM */
var React = require("react");
var Button = require("../../../ui/Button");

// FIXME : rename to Pager
// FIXME: the non presence of "next" can determine both onNext cb + hasNext function
var TransitionsBrowserPager = React.createClass({
  propTypes: {
    page: React.PropTypes.number.isRequired,
    numberOfPages: React.PropTypes.number.isRequired,
    prev: React.PropTypes.func,
    next: React.PropTypes.func,
    keyboardControls: React.PropTypes.bool
  },
  componentDidMount: function () {
    window.addEventListener("keydown", this.onKeydown, false);
  },
  componentWillUnmount: function () {
    window.removeEventListener("keydown", this.onKeydown);
  },
  onKeydown: function (e) {
    if (!this.props.keyboardControls) return;
    if (e.which === 37) {
      if (this.props.prev) {
        e.preventDefault();
        this.props.prev();
      }
    }
    else if (e.which === 39 || e.which === 32) {
      if (this.props.next) {
        e.preventDefault();
        this.props.next();
      }
    }
  },
  render: function () {
    var page = this.props.page;
    return <div className="transitions-browser-pager pager">
      {this.props.prev ? <Button f={this.props.prev} className="page-nav prev">← Previous</Button> : ''}
      <span className="page-current">Page <strong>{page+1}</strong> of <strong>{this.props.numberOfPages}</strong></span>
      {this.props.next ? <Button f={this.props.next} className="page-nav next">Next →</Button> : ''}
    </div>;
  }
});

module.exports = TransitionsBrowserPager;

