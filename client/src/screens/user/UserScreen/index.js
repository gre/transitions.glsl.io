/** @jsx React.DOM */
var React = require("react");
var _ = require("lodash");
var TransitionsBrowser = require("../../gallery/TransitionsBrowser");
var TransitionComments = require("../../editor/TransitionComments");
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
    groups: React.PropTypes.object.isRequired,
    pageSize: React.PropTypes.number.isRequired,
    page: React.PropTypes.number.isRequired,
    publicPage: React.PropTypes.bool.isRequired
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
  childrenForTransition: function (transition) {
    if (!this.props.publicPage && transition.comments) {
      return <TransitionComments count={transition.comments} href={transition.html_url} />;
    }
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
    var groups = this.props.groups;
    var pageSize = this.props.pageSize;

    var invalidHasData = function () {
      return true;
    };
    var invalidGetData = function () {
      return groups.invalid;
    };
    var nbInvalids = groups.invalid && groups.invalid.length || 0;
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

    var usertoolbar = 
      <Toolbar>
        <img src={"https://avatars.githubusercontent.com/"+this.props.user+"?s=40"} />
        <h2>
        Transitions of
        <Link href={"https://gist.github.com/"+this.props.user}>
          <span> { this.props.user }</span>
        </Link>
      </h2>
      </Toolbar>
      ;

    var index = 0;

    if (!_.keys(groups).length) {
      return <div className="user-screen">
        { !this.props.publicPage ? 
          <Toolbar>
            You have not created Transitions yet.
            {index++===0 ? createNewTransition : ''}
          </Toolbar>
          :
          usertoolbar
        }
        <div className="notransitions">
          No transition yet.
        </div>
      </div>;
    }

    return <div className="user-screen">
      {!groups.invalid ? '': this.transferPropsTo(
        <TransitionsBrowser key="invalid" width={width} paginated={false} getWidth={getWidth} hasData={invalidHasData} getData={invalidGetData} childrenForTransition={this.childrenForTransition}>
        <Toolbar>
          <span className="invalids">
          <i className="fa fa-warning"></i>&nbsp;
          {nbInvalids} Transition{nbInvalids>1?'s':''} detected invalid, please fix {nbInvalids>1?'them':'it'}:
          </span>
          {index++===0 ? createNewTransition : ''}
        </Toolbar>
        </TransitionsBrowser>)
      }
      {!groups.unpublished ? '': this.transferPropsTo(
        <TransitionsBrowser key="unpublished" width={width} paginated={false} getWidth={getWidth} hasData={unpublishedHasData} getData={unpublishedGetData} childrenForTransition={this.childrenForTransition}>
        <Toolbar>
          Your unpublished transitions:
          {index++===0 ? createNewTransition : ''}
        </Toolbar>
        </TransitionsBrowser>)
      }
      {!groups.published ? '': this.transferPropsTo(
        <TransitionsBrowser page={this.props.page} key="published" width={width} paginated={true} getWidth={getWidth} hasData={publishedHasData} getData={publishedGetData} numberOfPages={publishedNbPages} childrenForTransition={this.childrenForTransition}>
        { !this.props.publicPage ? 
        <Toolbar>
          Your published transitions:
          {index++===0 ? createNewTransition : ''}
        </Toolbar>
        :
        usertoolbar
        }
        </TransitionsBrowser>)
      }
    </div>;
  }
});

module.exports = UserScreen;
