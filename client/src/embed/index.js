var _ = require("lodash");
var Q = require("q");
var React = require("react");
var ErrorView = require("../ui/ErrorPlayer");
var Loading = require("../ui/LoadingPlayer");
var ImageLinearPlayer = require("../ui/ImageLinearPlayer");
var VideoLinearPlayer = require("../ui/VideoLinearPlayer");
var Videos = require("../glslio/videos");
var Images = require("../glslio/images");
var textures = require("../glslio/images/textures");
var Url = require("url");
var url = Url.parse(window.location.href, true);

function getTransition () {
  var TRANSITION = window.transition;
  return textures.resolver.resolve(TRANSITION.uniforms).then(function (uniforms) {
    return _.defaults({ uniforms: uniforms }, TRANSITION);
  });
}

if (url.query.video) {

  var render = function (transition, videos, error) {
    var params = {
      width: window.innerWidth,
      height: window.innerHeight,
      transition: transition,
      videos: videos,
      duration: 2500,
      loop: !!url.query.loop,
      autoplay: !!url.query.autoplay
    };
    var comp;

    if (error) {
      params.error = error.message || error;
      comp = ErrorView(params);
    }
    else if (!videos) {
      comp = Loading(params);
    }
    else {
      comp = VideoLinearPlayer(params);
    }
    return React.renderComponent(comp, document.body);
  };

  getTransition()
    .then(function (transition) {
      render(transition, null);
      return Videos.all().then(function (videos) {
        videos.push(videos[0]);
        var draw = _.bind(render, this, transition, videos);
        // window.addEventListener("resize", draw, false);
        draw();
      });
    })
    .fail(function (e) {
      render(null, null, e);
    })
    .done();
}
else {

  var render = function (transition, from, to) {
    return React.renderComponent(ImageLinearPlayer({
      width: window.innerWidth,
      height: window.innerHeight,
      transition: transition,
      from: from,
      to: to,
      duration: 2000
    }), document.body);
  };

  Q.all([
    getTransition(),
    Images.getImage(0, "embed"),
    Images.getImage(1, "embed")
  ])
  .spread(function (transition, from, to) {
    var draw = _.bind(render, this, transition, from, to);
    window.addEventListener("resize", draw, false);
    draw();
  })
  .done();
}
