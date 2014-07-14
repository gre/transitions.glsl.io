var Qvideo = require("./qvideo");
var Q = require("q");
var _ = require("lodash");

var videos;

module.exports = {
  data: {
    sintel: [
      "/assets/videos/sintel/cut1",
      "/assets/videos/sintel/cut2",
      "/assets/videos/sintel/cut3"
    ]
  },
  all: function () {
    if (!videos) {
      var v = document.createElement('video');
      var canPlayWebm = v.canPlayType && v.canPlayType('video/webm').replace(/no/, '');
      var canPlayMp4 = v.canPlayType && v.canPlayType('video/mp4').replace(/no/, '');
      if (canPlayMp4 || canPlayWebm) {
        videos = Q.all(_.map(this.data.sintel, function (url) {
          return Qvideo(url+(!canPlayWebm ? ".mp4" : ".webm"), { event: "canplaythrough" });
        }));
      }
      else {
        return Q.reject(new Error("Can't play any video format (webm | mp4)."));
      }
    }
    return videos;
  }
};

