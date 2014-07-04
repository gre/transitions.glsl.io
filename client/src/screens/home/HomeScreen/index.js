/** @jsx React.DOM */
var React = require("react");
var Vignette = require("../../../ui/Vignette");
var GLSLio = require("../../../ui/Logo");
var Link = require("../../../ui/Link");

var HomeScreen = React.createClass({

  propTypes: {
    env: React.PropTypes.object.isRequired,
    transitions: React.PropTypes.array.isRequired,
    images: React.PropTypes.array.isRequired
  },

  getInitialState: function () {
    return {
      transitionIndex: 0
    };
  },

  onTransitionPerformed: function (stats) {
    console.log(stats.frames && "fps: "+Math.round(1000*stats.frames/stats.elapsedTime) || stats);
    this.setState({
      transitionIndex: (this.state.transitionIndex+1) % this.props.transitions.length
    });
  },

  render: function () {
    var transition = this.props.transitions[this.state.transitionIndex];
    return <div className="home-screen">
      <h2>
        WebGL Transitions for your images slideshow
      </h2>
      <p>
        This slideshow shows all transitions created by <GLSLio /> contributors!
      </p>
      <Vignette
        images={this.props.images}
        autostart={true}
        controlsMode="none"
        width={512}
        height={384}
        glsl={transition.glsl}
        uniforms={transition.uniforms}
        onTransitionPerformed={this.onTransitionPerformed}>
        <span className="title">
          <em>{transition.name}</em>
          <span> by </span>
          <strong>{transition.owner}</strong>
          </span>
      </Vignette>

      <h3>GLSL Transitions are...</h3>

      <dl>

        <dt><i className="fa fa-tachometer"></i> Highly Performant</dt>
        <dd>
        Incredible Transition Effects running at 60 FPS in your browser.
        </dd>

        <dt><i className="fa fa-magic"></i> Incredible Effects</dt>
        <dd>
        GLSL is really <strong>the</strong> ultimate language to implement Transitions in.
        There is really no limitation on effects you can perform with.
        </dd>

        <dt><i className="fa fa-cogs"></i> Entirely Customisable</dt>
        <dd>
          A transition exposes "uniform" that is helpful to customize the effect parameters.
          Transition Duration and Transition Easing Function are also customisable.
        </dd>

        <dt><i className="fa fa-puzzle-piece"></i> Multi-environnment</dt>
        <dd>
          GLSL can be supported both on Browsers and on Native environnment.
          We are working to make GLSL Transitions working in Video Editors.
        </dd>

        <dt><i className="fa fa-film"></i> Multi-usage</dt>
        <dd>
          GLSL Transitions focus on defining a transition between 2 sources.
          Those can be images, videos or anything 2D!
        </dd>

        <dt><i className="fa fa-cloud-download"></i> Easy to use</dt>
        <dd>
          The <Link href="https://github.com/glslio/glsl-transition">glsl-transition</Link> library make GLSL Transitions very easy to use on your webpages.
        </dd>

      </dl>

      <h3>
        <GLSLio /> is...
      </h3>

      <dl>
        <dt><i className="fa fa-users"></i> Community Driven</dt>
        <dd>
          GLSL Transitions are created by people, for people.
        </dd>
        <dt><i className="fa fa-code"></i> Free License Transitions</dt>
        <dd>
        All transitions are released under Free License.
        By creating content on <GLSLio />, you accept to release transitions under MIT License.
        </dd>
        <dt><i className="fa fa-code"></i> Entirely Open Source</dt>
        <dd>
        The source code of <GLSLio /> itself is fully available <Link href="https://github.com/">on Github</Link>.
        </dd>
        <dt><i className="fa fa-github-alt"></i> Gist Hosted</dt>
        <dd>
          No data are kept on our server.
          All transitions are stored in Gists and owned by the community.
        </dd>
      </dl>

    </div>;
  }

});

module.exports = HomeScreen;

