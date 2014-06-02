/** @jsx React.DOM */
var React = require("react");
var TransitionPreview = require("../TransitionPreview");
var TransitionsBrowserPager = require("../TransitionsBrowserPager");

var TransitionsBrowser = React.createClass({
  propTypes: {
    thumbnailWidth: React.PropTypes.number.isRequired,
    thumbnailHeight: React.PropTypes.number.isRequired,
    getWidth: React.PropTypes.func,
    hasData: React.PropTypes.func.isRequired,
    getData: React.PropTypes.func.isRequired,
    images: React.PropTypes.array.isRequired,
    paginated: React.PropTypes.bool
  },
  getThumbnailFullWidth: function () {
    return this.props.thumbnailWidth + 12;
  },
  getPreviewsPerLine: function () {
    var windowWidth = this.props.getWidth ? this.props.getWidth() : window.innerWidth;
    return Math.floor(windowWidth / this.getThumbnailFullWidth());
  },
  getInitialState: function() {
    return {
      previewsPerLine: this.getPreviewsPerLine(),
      page: 0
    };
  },
  handleResize: function(e) {
    var previewsPerLine = this.getPreviewsPerLine();
    if (this.state.previewsPerLine !== previewsPerLine) {
      this.setState({
        previewsPerLine: previewsPerLine
      });
    }
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
    var width = this.getThumbnailFullWidth() * this.state.previewsPerLine;
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
    return <div className="transitions-browser">
      {this.props.children}
      <div className="previews" style={{width:width}}>{previews}</div>
      { this.props.paginated ? <TransitionsBrowserPager page={this.state.page} hasPrev={this.hasPrevPage()} hasNext={this.hasNextPage()} onNext={this.nextPage} onPrev={this.prevPage} /> : '' }
    </div>;
  }
});

module.exports = TransitionsBrowser;

