var _ = require("lodash");
var Q = require("q");
var React = require("react");
var ImageLinearPlayer = require("./ImageLinearPlayer");
var VideoLinearPlayer = require("./VideoLinearPlayer");
var Images = require("../images");
var Videos = require("../glslio/videos");
var textures = require("../images/textures");
var Url = require("url");
var url = Url.parse(window.location.href, true);

function getTransition () {
  var TRANSITION = window.transition;
  return textures.resolver.resolve(TRANSITION.uniforms).then(function (uniforms) {
    return _.defaults({ uniforms: uniforms }, TRANSITION);
  });
}

if (url.query.video) {

  var render = function (transition, videos) {
    return React.renderComponent(VideoLinearPlayer({
      width: window.innerWidth,
      height: window.innerHeight,
      transition: transition,
      videos: videos,
      duration: 2500
    }), document.body);
  };

  Q.all([ getTransition(), Videos.all() ])
    .spread(function (transition, videos) {
      videos.push(videos[0]);
      var draw = _.bind(render, this, transition, videos);
      // window.addEventListener("resize", draw, false);
      draw();
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
