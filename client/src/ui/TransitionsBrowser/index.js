/** @jsx React.DOM */
var React = require("react");
var _ = require("lodash");
var Url = require("url");
var TransitionPreview = require("../TransitionPreview");
var TransitionsBrowserPager = require("../TransitionsBrowserPager");
var SharedCanvas = require("../TransitionCanvasCache/SharedCanvas");
var app = require("../../core/app");

// FIXME there is a loading perf bottleneck that we need to fix. Gallery should be bleeding fast to load. We may try our best client-side but also consider server-side thumbnail.

var TransitionsBrowser = React.createClass({
  propTypes: {
    thumbnailWidth: React.PropTypes.number.isRequired,
    thumbnailHeight: React.PropTypes.number.isRequired,
    width: React.PropTypes.number.isRequired,
    hasData: React.PropTypes.func.isRequired,
    getData: React.PropTypes.func.isRequired,
    numberOfPages: React.PropTypes.number,
    images: React.PropTypes.array.isRequired,
    paginated: React.PropTypes.bool,
    childrenForTransition: React.PropTypes.func,
    transitionPreviewProps: React.PropTypes.object
  },
  getDefaultProps: function () {
    return {
      page: 0,
      childrenForTransition: _.noop,
      transitionPreviewProps: {}
    };
  },
  getInitialState: function() {
    return {
      page: this.props.page
    };
  },
  componentWillReceiveProps: function (newProps) {
    if (newProps.page !== this.state.page) {
      this.setState({
        page: newProps.page
      });
    }
  },

  hasNextPage: function () {
    return this.props.hasData(this.state.page + 1);
  },
  hasPrevPage: function () {
    return this.props.hasData(this.state.page - 1);
  },
  goToPage: function (page) {
    // FIXME this should just change the URL and we should let React doing the work.
    var url = {
      pathname: app.router.url.pathname,
      query: _.defaults({ page: page }, app.router.url.query)
    };
    app.router.overridesUrl(Url.format(url));
    this.setState({ page: page });
  },
  nextPage: function () {
    var page = this.state.page + 1;
    this.goToPage(page);
  },
  prevPage: function () {
    var page = this.state.page - 1;
    this.goToPage(page);
  },
  componentWillMount: function() {
    this.cache = SharedCanvas.create(this.props.thumbnailWidth, this.props.thumbnailHeight);
    var transitions = this.props.getData(this.state.page);
    _.each(transitions, function (t) {
      this.cache.createTransitionDrawer(t.id, t.glsl, t.uniforms);
    }, this);
  },
  componentWillUnmount: function() {
    this.cache.destroy();
    this.cache = null;
  },
  componentWillUpdate: function (nextProps, nextState) {
    var data = nextProps.getData(nextState.page);
    var beforeIds = this.cache.getAllIds();
    var afterIds = _.pluck(data, "id");
    var deleted = _.difference(beforeIds, afterIds);
    var created = _.difference(afterIds, beforeIds);
    _.each(deleted, function (id) {
      this.cache.removeTransitionDrawer(id);
    }, this);
    _.each(created, function (id) {
      var transition = _.find(data, function (t) { return t.id === id; });
      this.cache.createTransitionDrawer(id, transition.glsl, transition.uniforms);
    }, this);
  },
  render: function () {
    var width = this.props.width;
    var transitions = this.props.getData(this.state.page);
    var next = this.hasNextPage() ? this.nextPage : null;
    var prev = this.hasPrevPage() ? this.prevPage : null;

    var previews = transitions.map(function (transition, i) {
      return TransitionPreview(_.extend({}, {
        width: this.props.thumbnailWidth,
        height: this.props.thumbnailHeight,
        images: this.props.images,
        glsl: transition.glsl,
        uniforms: transition.uniforms,
        id: transition.id,
        key: transition.id,
        name: transition.name,
        owner: transition.owner,
        cache: this.props.transitionPreviewProps.cache || {
          drawer: this.cache.getTransitionDrawer(transition.id),
          resolution: 64,
          delay: 30 + i * 40
        },
        children: this.props.childrenForTransition(transition)
      }, this.props.transitionPreviewProps));
    }, this);
    return <div className="transitions-browser">
      {this.props.children}
      <div className="previews" style={{width:width}}>{previews}</div>
      { this.props.paginated ? <TransitionsBrowserPager
        numberOfPages={this.props.numberOfPages}
        page={this.state.page}
        prev={prev} next={next} /> : '' }
    </div>;
  }
});

module.exports = TransitionsBrowser;

