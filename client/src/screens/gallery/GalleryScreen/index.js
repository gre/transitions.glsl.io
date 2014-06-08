/** @jsx React.DOM */
var React = require("react");
var _ = require("lodash");
var TransitionsBrowser = require("../TransitionsBrowser");
var Link = require("../../../ui/Link");

function getWidth () {
  return window.innerWidth-20;
}

var GalleryScreen = React.createClass({

  propTypes: {
    env: React.PropTypes.object.isRequired,
    transitions: React.PropTypes.array.isRequired,
    pageSize: React.PropTypes.number.isRequired
  },

  render: function () {
    var createNewTransition = <Link className="new-transition" href="/transition/new">
      <i className="fa fa-plus"></i>&nbsp;Create a new Transition
    </Link>;
    var groups = _.groupBy(this.props.transitions, function (transition) {
      if (transition.owner === this.props.env.user && transition.name === "TEMPLATE")
        return 'unpublished';
      return 'published';
    }, this);
    var pageSize = this.props.pageSize;

    var unpublishedHasData = function () {
      return true;
    };
    var unpublishedGetData = function () {
      return groups.unpublished;
    };
    var publishedHasData = function (page) {
      return 0 <= page && page * pageSize < groups.published.length;
    };
    var publishedGetData = function (page) {
      return _.take(_.tail(groups.published, page * pageSize), pageSize);
    };

    var index = 0;
    return <div className="gallery-screen">
      {!groups.unpublished ? '': this.transferPropsTo(
        <TransitionsBrowser paginated={false} getWidth={getWidth} hasData={unpublishedHasData} getData={unpublishedGetData}>
        <div className="toolbar">
          Your unpublished transitions:
          {index++===0 ? createNewTransition : ''}
        </div>
        </TransitionsBrowser>)
      }
      {!groups.published ? '': this.transferPropsTo(
        <TransitionsBrowser paginated={true} getWidth={getWidth} hasData={publishedHasData} getData={publishedGetData}>
        <div className="toolbar">
          All published transitions:
          {index++===0 ? createNewTransition : ''}
        </div>
        </TransitionsBrowser>)
      }
    </div>;
  }
});

module.exports = GalleryScreen;

