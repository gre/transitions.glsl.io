/** @jsx React.DOM */
var React = require("react");
var _ = require("lodash");
var TransitionsBrowser = require("../../gallery/TransitionsBrowser");
var Link = require("../../../ui/Link");
var Toolbar = require("../../../ui/Toolbar");

function getWidth () {
  return window.innerWidth-20;
}

var UserScreen = React.createClass({

  propTypes: {
    user: React.PropTypes.string.isRequired,
    images: React.PropTypes.array.isRequired,
    env: React.PropTypes.object.isRequired,
    transitions: React.PropTypes.array.isRequired,
    pageSize: React.PropTypes.number.isRequired
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
    var createNewTransition = <Link className="new-transition" href="/transition/new">
      <i className="fa fa-plus"></i>&nbsp;Create a new Transition
    </Link>;
    var groups = _.groupBy(this.props.transitions, function (transition) {
      if (transition.name !== "TEMPLATE")
        return 'published';
      else {
        if (transition.owner === this.props.env.user)
          return 'unpublished';
      }
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
    var publishedNbPages = !groups.published ? 0 : Math.ceil(groups.published.length/pageSize);

    var isMe = this.props.env.user === this.props.user;
    var index = 0;
    return <div className="user-screen">
      {!groups.unpublished ? '': this.transferPropsTo(
        <TransitionsBrowser key="unpublished" width={width} paginated={false} getWidth={getWidth} hasData={unpublishedHasData} getData={unpublishedGetData}>
        <Toolbar>
          Your unpublished transitions:
          {index++===0 ? createNewTransition : ''}
        </Toolbar>
        </TransitionsBrowser>)
      }
      {!groups.published ? '': this.transferPropsTo(
        <TransitionsBrowser key="published" width={width} paginated={true} getWidth={getWidth} hasData={publishedHasData} getData={publishedGetData} numberOfPages={publishedNbPages}>
        { isMe ? 
        <Toolbar>
          Your published transitions:
          {index++===0 ? createNewTransition : ''}
        </Toolbar>
        :
        <Toolbar>
          <h2>Transitions of <Link href={"https://gre.github.com/"+this.props.user}>{ this.props.user }</Link></h2>
        </Toolbar>
        }
        </TransitionsBrowser>)
      }
    </div>;
  }
});

module.exports = UserScreen;
