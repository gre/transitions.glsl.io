/** @jsx React.DOM */
var React = require("react");
var GlslDocumentation = require("glsldoc");
var hljs = require('highlight.js');
var _ = require("lodash");

var noContent = <div className="glsl-contextual-help none">Nothing found.</div>;

var GlslDocumentationIndexedPerName = _.groupBy(GlslDocumentation, "name");

function prettyType (str) {
  return str.replace("_", " ");
}

function findDocumentation (token) {
  var matches = GlslDocumentationIndexedPerName[token.value];
  if (!matches) return null;
  return matches[0]; // We may not have collision. Otherwise we can figure out some heuristics
}

var GlslContextualHelp = React.createClass({
  propTypes: {
    token: React.PropTypes.shape({
      type: React.PropTypes.string.isRequired,
      value: React.PropTypes.string.isRequired
    })
  },
  render: function () {
    var token = this.props.token;
    if (!token) return noContent;
    var documentation = findDocumentation(token);
    if (!documentation) return noContent;

    var usageHTML = hljs.highlight("glsl", documentation.usage).value;

    return <div className="glsl-contextual-help">
      <div className="glsl-documentation">
        <p className="glsl-token-type-name">
          <span className="glsl-token-type">{prettyType(documentation.type)}</span>
          <span className="glsl-token-name">{documentation.name}</span>
        </p>
        <p className="glsl-token-usage hljs" dangerouslySetInnerHTML={{ __html: usageHTML }} />
        <p className="glsl-token-description">{documentation.description}</p>
      </div>
    </div>;
  }
});

module.exports = GlslContextualHelp;
