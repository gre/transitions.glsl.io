/** @jsx React.DOM */
var React = require("react");
var Link = require("../../../ui/Link");

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
    var href = transition.html_url;
    var openGist =
      isRootGist ? 
      <Link className="open-gist transition-name" target="_blank" href={href}>
        This is the <i className="fa fa-github"></i>&nbsp;transition template.
      </Link>
      : isPublished ?
      <Link className="open-gist transition-name" target="_blank" href={href}>
        <i className="fa fa-github"></i>&nbsp;{ transition.name }
      </Link>
      :
      <Link className="open-gist transition-name" target="_blank" href={href}>
        <i className="fa fa-github"></i>&nbsp;Gist
      </Link>
    ;

    return <span className="transition-infos">
      {openGist}
      {isRootGist ? '' :
        <span> by <Link target="_blank" href={"https://gist.github.com/"+transition.owner }>{ transition.owner }</Link></span>
      }
    </span>;
  }
});

module.exports = TransitionInfos;

