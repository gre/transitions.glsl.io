/** @jsx React.DOM */
var React = require("react");

var TransitionActions = React.createClass({
  propTypes: {
    onSave: React.PropTypes.func.isRequired,
    onPublish: React.PropTypes.func.isRequired,
    env: React.PropTypes.object.isRequired,
    isPublished: React.PropTypes.bool.isRequired,
    transition: React.PropTypes.object.isRequired
  },
  render: function () {
    if (this.props.env.user) {
      var isPublished = this.props.isPublished;
      var isRootGist = this.props.transition.id === this.props.env.rootGist;
      var isMyGist = this.props.transition.owner === this.props.env.user;
      if (isRootGist || isMyGist) {
        return <span className="transition-actions actions">
        { isMyGist && !isPublished ? <PublishButton f={this.onPublish}>Publish</PublishButton> :''}
        <SaveButton f={this.onSave} status={this.props.saveStatus} statusMessage={this.props.saveStatusMessage}>{isRootGist ? "Create a new Gist" : "Save"}</SaveButton>
        </span>;
      }
      else {
        return <span className="transition-actions actions"></span>;
      }
    }
    else {
      return <span className="transition-actions actions">
        You must
        <a class="github connect" href="/authenticate">
          Connect with <i class="fa fa-github"></i> Github
        </a>
      </span>;
    }
  }
});

module.exports = TransitionActions;

