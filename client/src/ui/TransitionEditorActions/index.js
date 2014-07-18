/** @jsx React.DOM */
var React = require("react");
var SaveButton = require("../SaveButton");
var PublishButton = require("../PublishButton");
var Link = require("../Link");

var TransitionActions = React.createClass({
  propTypes: {
    onSave: React.PropTypes.func.isRequired,
    onPublish: React.PropTypes.func.isRequired,
    env: React.PropTypes.object.isRequired,
    isPublished: React.PropTypes.bool.isRequired,
    transition: React.PropTypes.object.isRequired,
    saveDisabled: React.PropTypes.bool.isRequired
  },
  render: function () {
    if (this.props.env.user) {
      var isPublished = this.props.isPublished;
      var isRootGist = this.props.transition.id === this.props.env.rootGist;
      var isMyGist = this.props.transition.owner === this.props.env.user;
      if (isRootGist || isMyGist) {
        return <span className="transition-actions actions">
        { isMyGist && !isPublished ? <PublishButton f={this.props.onPublish}>Publish</PublishButton> :''}
        &nbsp;
        <SaveButton disabled={this.props.saveDisabled} f={this.props.onSave} status={this.props.saveStatus} statusMessage={this.props.saveStatusMessage}>{isRootGist ? "Create a new Gist" : "Save"}</SaveButton>
        </span>;
      }
      else {
        return <span className="transition-actions actions"></span>;
      }
    }
    else {
      return <span className="transition-actions actions">
        <span>You must </span>
        <Link className="github connect" href="/authenticate">
          Connect with <i className="fa fa-github"></i> Github
        </Link>
        <span> for creating content.</span>
      </span>;
    }
  }
});

module.exports = TransitionActions;

