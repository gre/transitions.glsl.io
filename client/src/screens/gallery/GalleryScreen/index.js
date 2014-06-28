/** @jsx React.DOM */
var React = require("react");
var _ = require("lodash");
var TransitionsBrowser = require("../TransitionsBrowser");
var Link = require("../../../ui/Link");
var Toolbar = require("../../../ui/Toolbar");

function getWidth () {
  return window.innerWidth-20;
}

var GalleryScreen = React.createClass({

  propTypes: {
    env: React.PropTypes.object.isRequired,
    transitions: React.PropTypes.array.isRequired,
    pageSize: React.PropTypes.number.isRequired,
    page: React.PropTypes.number.isRequired
  },

  componentDidMount: function() {
    window.addEventListener('resize', this.handleResize);
  },
  componentWillUnmount: function() {
    window.removeEventListener('resize', this.handleResize);
  },
  getInitialState: function() {
    return {
      previewsPerLine: this.getPreviewsPerLine()
    };
  },
  getThumbnailFullWidth: function () {
    return this.props.thumbnailWidth + 12;
  },
  getPreviewsPerLine: function () {
    return Math.floor(getWidth() / this.getThumbnailFullWidth());
  },
  handleResize: function() {
    var previewsPerLine = this.getPreviewsPerLine();
    if (this.state.previewsPerLine !== previewsPerLine) {
      this.setState({
        previewsPerLine: previewsPerLine
      });
    }
  },
  render: function () {
    var width = this.getThumbnailFullWidth() * this.state.previewsPerLine;
    var createNewTransition = this.props.env.user ?
      <Link className="new-transition" href="/transition/new">
        <i className="fa fa-plus"></i>&nbsp;Create a new Transition
      </Link>
    :
      <Link className="new-transition" href="/authenticate">
        Connect to Create a new Transition
      </Link>
    ;
    var pageSize = this.props.pageSize;

    var transitions = this.props.transitions;
    var hasData = function (page) {
      return 0 <= page && page * pageSize < transitions.length;
    };
    var getData = function (page) {
      return _.take(_.tail(transitions, page * pageSize), pageSize);
    };
    var nbPages = Math.ceil(transitions.length/pageSize);

    return <div className="gallery-screen">
      {this.transferPropsTo(
        <TransitionsBrowser page={this.props.page} width={width} paginated={true} getWidth={getWidth} hasData={hasData} getData={getData} numberOfPages={nbPages}>
        <Toolbar>
          All published transitions:
          {createNewTransition}
        </Toolbar>
        </TransitionsBrowser>
      )}
    </div>;
  }
});

module.exports = GalleryScreen;

