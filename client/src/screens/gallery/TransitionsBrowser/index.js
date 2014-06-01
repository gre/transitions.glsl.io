/** @jsx React.DOM */
var React = require("react");
var TransitionPreview = require("../TransitionPreview");
var TransitionsBrowserPager = require("../TransitionsBrowserPager");

var TransitionsBrowser = React.createClass({
  getWidth: function () {
    return this.props.getWidth ? this.props.getWidth() : window.innerWidth;
  },
  getInitialState: function() {
    return {
      width: this.getWidth(),
      page: 0
    };
  },
  handleResize: function(e) {
    this.setState({ width: this.getWidth() });
  },
  componentDidMount: function() {
    window.addEventListener('resize', this.handleResize);
  },
  componentWillUnmount: function() {
    window.removeEventListener('resize', this.handleResize);
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
    var thumbnailWidth = this.props.thumbnailWidth + 12;
    var width = 1 + thumbnailWidth * Math.floor((this.state.width-20)/thumbnailWidth);
    var transitions = this.props.getData(this.state.page);
    var previews = transitions.map(function (transition) {
      return TransitionPreview({
        width: this.props.thumbnailWidth,
        height: this.props.thumbnailHeight,
        images: this.props.images,
        glsl: transition.glsl,
        uniforms: transition.uniforms,
        id: transition.id,
        name: transition.name,
        owner: transition.owner
      });
    }, this);
    return <div className="transitions-browser" style={{width:width}}>
      {this.props.children}
      <div>{previews}</div>
      <TransitionsBrowserPager page={this.state.page} hasPrev={this.hasPrevPage()} hasNext={this.hasNextPage()} onNext={this.nextPage} onPrev={this.prevPage} />
    </div>;
  }
});

module.exports = TransitionsBrowser;

