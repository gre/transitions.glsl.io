/** @jsx React.DOM */
var React = require("react");
var hljs = require('highlight.js');
var _ = require("lodash");
var Link = require("../../../ui/Link");

var GlslDocumentation = _.union(require("glsldoc"), require("./extraDocumentation.json"));

var escapeHTML = require("react/lib/escapeTextForBrowser");

var GlslDocumentationIndexedPerName = _.groupBy(GlslDocumentation, "name");

function prettyType (str) {
  return str.replace(/_/g, " ");
}

function highlightGlslHTML (glsl) {
  try {
    return hljs.highlight("glsl", glsl).value;
  }
  catch (e) {
    return escapeHTML(glsl);
  }
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
    var documentation = token && findDocumentation(token);

    var documentationBlock = (!documentation ? 
      <div className="glsl-documentation-no-context">
        <p>
        All GLSL predefined functions, constants, types, qualifiers,
        selected under the Editor Cursor 
        are automatically documented here.
        </p>
      </div>
      :
      <div className="glsl-documentation">
        <p className="glsl-token-type-name">
          <span className="glsl-token-type">{prettyType(documentation.type)}</span>
          <span className="glsl-token-name">{documentation.name}</span>
        </p>
        { !documentation.usage ? '' :
        <p className="glsl-token-usage hljs" dangerouslySetInnerHTML={{ __html: highlightGlslHTML(documentation.usage) }} />
        }
        <p className="glsl-token-description">{documentation.description}</p>
      </div>
    );

    return <div className="glsl-contextual-help">
      {documentationBlock}

      <ul className="links">
        <li><Link href="https://www.khronos.org/registry/gles/specs/2.0/GLSL_ES_Specification_1.0.17.pdf" target="_blank"><i className="fa fa-external-link"></i>&nbsp;GLSL Specification</Link></li>
        <li><Link href="https://www.khronos.org/files/webgl/webgl-reference-card-1_0.pdf" target="_blank"><i className="fa fa-external-link"></i>&nbsp;Cheat Sheet</Link></li>
      </ul>
    </div>;
  }
});

module.exports = GlslContextualHelp;
