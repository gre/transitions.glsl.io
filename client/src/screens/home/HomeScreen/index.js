/** @jsx React.DOM */
var React = require("react");
var BezierEasing = require("bezier-easing");
var NumberInput = require("../../../ui/NumberInput");
var BezierEditor = require("../../../ui/BezierEditor");
var Slideshow = require("../../../ui/Slideshow");
var GLSLio = require("../../../ui/Logo");
var Link = require("../../../ui/Link");
var Button = require("../../../ui/Button");
var Pager = require("../../gallery/TransitionsBrowserPager");
var Fps = require("../../editor/Fps");

var HomeScreen = React.createClass({

  propTypes: {
    env: React.PropTypes.object.isRequired,
    transitions: React.PropTypes.array.isRequired,
    images: React.PropTypes.array.isRequired
  },

  getInitialState: function () {
    return {
      page: 0,
      fps: null,
      videoTransition: this.props.transitions[Math.floor(Math.random()*this.props.transitions.length)],
      easing: [0.25, 0.25, 0.75, 0.75],
      duration: 1500
    };
  },

  onSlideChange: function (stats) {
    var fps = stats.frames ? Math.round(1000*stats.frames/stats.elapsedTime) : null;
    if (this.state.fps !== fps) {
      this.setState({ fps: fps });
    }
  },

  onDurationChange: function (i) { // FIXME this should be the int value here...
    this.setState({ duration: parseInt(i.target.value, 10) });
  },

  setEasing: function (easing) {
    this.setState({ easing: easing });
  },

  prev: function () {
    this.setState({ page: this.state.page - 1 });
  },

  next: function () {
    this.setState({ page: this.state.page + 1 });
  },

  goToPageFunction: function (i) {
    return function () {
      return this.setState({ page: i });
    }.bind(this);
  },

  slideshows: {
    images: {
      render: function () {
        return <Slideshow width={512} height={384} images={this.props.images} transitions={this.props.transitions} onSlideChange={this.onSlideChange} transitionEasing={BezierEasing.apply(null, this.state.easing)} transitionDuration={this.state.duration} />;
      }
    },
    videos: {
      render: function () {
        // FIXME should not use an iframe here.. + slideshow loop forever
        return <iframe width={512} height={288} src={"/transition/"+this.state.videoTransition.id+"/embed?video=1"} frameBorder="0" seamless="seamless"></iframe>;
      }
    }
  },

  pages: [
    {
      slideshow: "images",
      icon: "tachometer",
      title: "Highly Performant",
      render: function () {
        return <div>
        <div>
          Incredible Transition Effects running at 60 FPS in your browser.
        </div>
        <div>
          The current slideshow transition is running at: <Fps fps={this.state.fps} />
        </div>
        </div>;
      }
    },
    {
      slideshow: "images",
      icon: "magic",
      title: "Incredible Effects",
      render: function () {
        return <div>
        <div>
        GLSL is really <strong>the</strong> ultimate language to implement Transitions in.
        There is really no limitation on effects you can perform with.
        </div>
        <div>
        <Link href="/gallery">
          <img src="/assets/examples.png" style={{width: "500px"}} alt="" />
        </Link>
        </div>
        </div>;
      }
    },
    {
      slideshow: "videos",
      icon: "film",
      title: "Video Ready!",
      render: function () {
        return <div>
        <div>
          GLSL Transitions focus on defining a transition between 2 sources.
        </div>
        <div>
          Those can be images, videos or anything 2D!
        </div>
        </div>;
      }
    },
    {
      slideshow: "images",
      icon: "puzzle-piece",
      title: "Multi-environnment",
      render: function () {
        return <div>
        <div>
          GLSL can be supported both on Browsers and on Native environnment.
          We are working to make GLSL Transitions working in Video Editors.
        </div>
        </div>;
      }
    },
    {
      slideshow: "images",
      icon: "cogs",
      title: "Entirely Customisable",
      render: function () {
        return <div>
        <div>
          A transition exposes "uniform" that is helpful to customize the effect parameters.
          Transition Duration and Transition Easing Function are also customisable.
        </div>
        <div className="duration">
          <strong>Duration:</strong>
          <span className="value">{this.state.duration}ms</span>
          <NumberInput onChange={this.onDurationChange} type="range" step={50} min={100} max={3000} value={this.state.duration} />
        </div>
        <div>
          <strong>Easing:</strong>
          <BezierEditor value={this.state.easing} onChange={this.setEasing} width={500} height={300} handleRadius={8} padding={[20, 100, 20, 100]} />
        </div>
        </div>;
      }
    },
    {
      slideshow: "images",
      icon: "cloud-download",
      title: "Easy to use",
      render: function () {
        return <div>
          The <Link href="https://github.com/glslio/glsl-transition">glsl-transition</Link> library make GLSL Transitions very easy to use on your webpages.
        </div>;
      }
    }
  ],
  /*

      <h3>
        <GLSLio /> is...
      </h3>

      <dl>
        <dt><i className="fa fa-users"></i> Community Driven</dt>
        <div>
          GLSL Transitions are created by people, for people.
        </div>
      </dl>

      <dl>
        <dt><i className="fa fa-code"></i> Free License Transitions</dt>
        <div>
        All transitions are released under Free License.
        By creating content on <GLSLio />, you accept to release transitions under MIT License.
        </div>
      </dl>

      <dl>
        <dt><i className="fa fa-code"></i> Entirely Open Source</dt>
        <div>
        The source code of <GLSLio /> itself is fully available <Link href="https://github.com/">on Github</Link>.
        </div>
      </dl>

      <dl>
        <dt><i className="fa fa-github-alt"></i> Gist Hosted</dt>
        <div>
          No data are kept on our server.
          All transitions are stored in Gists and owned by the community.
        </div>
      </dl>

      <br style={{"clear":"both"}} />
      */

  render: function () {
    var page = this.pages[this.state.page];
    var slideshow = this.slideshows[page.slideshow].render.call(this);
    var pageContent = page.render.call(this);
    var next = this.state.page+1 < this.pages.length ? this.next : null;
    var prev = this.state.page-1 >= 0 ? this.prev : null;

    var navIcons = this.pages.map(function (page, i) {
      return <Button className={i===this.state.page ? "current" : ""} title={page.title} f={this.goToPageFunction(i)}>
        <i className={"fa fa-"+page.icon}></i>
      </Button>;
    }, this);

    /*
     * TODO very WIP
     * - better display of pagination + display all icons to easily switch / preview all pages
     * - more responsive
     * - Better video integration: shouldn't change the ratio + auto run & loop
     * - More pages:
     *   - App tour (showing the main video)
     */

    return <div className="home-screen">

      <div className="visual">
        <h2>
          WebGL Transitions for your images slideshow
        </h2>
        <div>
          This slideshow shows all transitions created by <GLSLio /> contributors!
          {slideshow}
        </div>
      </div>

      <div className="page">
        <nav>
          {navIcons}
        </nav>
        <div className="content">
          <header><i className={"fa fa-"+page.icon}></i> {page.title}</header>
          {pageContent}
        </div>
        <Pager
          page={this.state.page}
          numberOfPages={this.pages.length}
          next={next}
          prev={prev}
          keyboardControls={true}
        />
      </div>

    </div>;
  }

});

module.exports = HomeScreen;

