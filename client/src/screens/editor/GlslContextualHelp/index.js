/** @jsx React.DOM */
var React = require("react");
var GlslDocumentation = require("glsldoc");
var _ = require("lodash");

var noContent = <div className="glsl-contextual-help none">Nothing found.</div>;

var GlslDocumentationIndexedPerName = _.groupBy(GlslDocumentation, "name");
console.log(GlslDocumentationIndexedPerName);

function findDocumentation (token) {
  var matches = GlslDocumentationIndexedPerName[token.value];
  console.log(token, matches);
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

    return <div className="glsl-contextual-help">
      <dl className="glsl-documentation">
        <dt>Type</dt>
        <dd className="glsl-token-type">{documentation.type}</dd>
        <dt>Name</dt>
        <dd className="glsl-token-name">{documentation.name}</dd>
        <dt>Usage</dt>
        <dd className="glsl-token-usage">{documentation.usage}</dd>
        <dt>Description</dt>
        <dd className="glsl-token-description">{documentation.description}</dd>
      </dl>
    </div>;
  }
});

module.exports = GlslContextualHelp;
