/** @jsx React.DOM */
var React = require("react");
var TransitionPreview = require("../TransitionPreview");
var TransitionsBrowserPager = require("../TransitionsBrowserPager");

var TransitionsBrowser = React.createClass({
  propTypes: {
    thumbnailWidth: React.PropTypes.number.isRequired,
    thumbnailHeight: React.PropTypes.number.isRequired,
    width: React.PropTypes.number.isRequired,
    hasData: React.PropTypes.func.isRequired,
    getData: React.PropTypes.func.isRequired,
    images: React.PropTypes.array.isRequired,
    paginated: React.PropTypes.bool
  },
  getInitialState: function() {
    return {
      page: 0
    };
  },

  hasNextPage: function () {
    return this.props.hasData(this.state.page + 1);
  },
  hasPrevPage: function () {
    return this.props.hasData(this.state.page - 1);
  },
  nextPage: function () {
    this.setState({ page: this.state.page + 1 });
  },
  prevPage: function () {
    this.setState({ page: this.state.page - 1 });
  },

  render: function () {
    var width = this.props.width;
    var transitions = this.props.getData(this.state.page);
    var previews = transitions.map(function (transition) {
      return TransitionPreview({
        width: this.props.thumbnailWidth,
        height: this.props.thumbnailHeight,
        images: this.props.images,
        glsl: transition.glsl,
        uniforms: transition.uniforms,
        id: transition.id,
        key: transition.id,
        name: transition.name,
        owner: transition.owner
      });
    }, this);
    return <div className="transitions-browser">
      {this.props.children}
      <div className="previews" style={{width:width}}>{previews}</div>
      { this.props.paginated ? <TransitionsBrowserPager page={this.state.page} hasPrev={this.hasPrevPage()} hasNext={this.hasNextPage()} onNext={this.nextPage} onPrev={this.prevPage} /> : '' }
    </div>;
  }
});

module.exports = TransitionsBrowser;

