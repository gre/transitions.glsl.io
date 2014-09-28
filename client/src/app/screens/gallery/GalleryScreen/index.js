/** @jsx React.DOM */
var React = require("react");
var _ = require("lodash");
var TransitionsBrowser = require("../../../../ui/TransitionsBrowser");
var Link = require("../../../../ui/Link");
var Toolbar = require("../../../../ui/Toolbar");
var TransitionStar = require("../../../../ui/TransitionStar");
var TransitionExpand = require("../../../../ui/TransitionExpand");
var model = require("../../../../app/models");

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
  componentWillReceiveProps: function () {
    // There is likely to be a change in sizings, so better retrigger a resize
    this.handleResize();
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

  // FIXME The current implementation is mutable but it is a quick workaround to not reload everything.
  starTransition: function (transition) {
    var self = this;
    return model.starTransition(transition.id)
      .get("stars")
      .then(function (count) {
        transition.stars = count;
        self.forceUpdate();
      });
  },
  unstarTransition: function (transition) {
    var self = this;
    return model.unstarTransition(transition.id)
      .get("stars")
      .then(function (count) {
        transition.stars = count;
        self.forceUpdate();
      });
  },

  childrenForTransition: function (transition) {
    var user = this.props.env.user;
    var star = user ? _.bind(this.starTransition, this, transition) : null;
    var unstar = user ? _.bind(this.unstarTransition, this, transition) : null;
    var expand = this.props.expandTransition ? _.bind(this.props.expandTransition, this, transition, this.props) : null;
    return <div>
      <TransitionStar count={transition.stars} starred={_.contains(transition.stargazers, user)} star={star} unstar={unstar} />
      { expand ? <TransitionExpand f={expand} /> : '' }
    </div>;
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

    var navs = _.map({
      "mix": "mix",
      "new": "new",
      "star": "popular",
      "change": "updated"
    }, function (name, key) {
      return <Link key={key} href={"/gallery?sort="+key} className={key===this.props.sort ? "selected" : ""}>{name}</Link>;
    }, this);

    return <div className="gallery-screen">
      {this.transferPropsTo(
        <TransitionsBrowser page={this.props.page} width={width} paginated={true} getWidth={getWidth} hasData={hasData} getData={getData} numberOfPages={nbPages} childrenForTransition={this.childrenForTransition} transitionPreviewProps={this.props.transitionPreviewProps}>
        <Toolbar>
          All published transitions
          <nav>{navs}</nav>
          {createNewTransition}
        </Toolbar>
        </TransitionsBrowser>
      )}
    </div>;
  }
});

module.exports = GalleryScreen;

