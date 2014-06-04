/** @jsx React.DOM */
var React = require("react");

var TransitionInfos = React.createClass({
  propTypes: {
    env: React.PropTypes.object.isRequired,
    isPublished: React.PropTypes.bool.isRequired,
    transition: React.PropTypes.object.isRequired
  },
  render: function () {
    var isPublished = this.props.isPublished;
    var isRootGist = this.props.transition.id === this.props.env.rootGist;
    var transition = this.props.transition;
    var href = "https://gist.github.com/"+ transition.owner +"/"+ transition.id;
    var openGist =
      isRootGist ? 
      <a className="open-gist transition-name" target="_blank" href={href}>
        This is the <i className="fa fa-github"></i>&nbsp;transition template.
      </a>
      : isPublished ?
      <a className="open-gist transition-name" target="_blank" href={href}>
        <i className="fa fa-github"></i>&nbsp;{ transition.name }
      </a>
      :
      <a className="open-gist transition-name" target="_blank" href={href}>
        <i className="fa fa-github"></i>&nbsp;Gist
      </a>
    ;

    return <span className="transition-infos">
      {openGist}
      {isRootGist ? '' :
        <span>by <a target="_blank" href={"https://gist.github.com/"+transition.owner }>{ transition.owner }</a></span>
      }
    </span>;
  }
});

module.exports = TransitionInfos;

