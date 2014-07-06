var Qvideo = require("./qvideo");
var Q = require("q");
var _ = require("lodash");

var videos;

module.exports = {
  data: {
    sintel: [
      "/assets/videos/sintel/cut1.webm",
      "/assets/videos/sintel/cut2.webm",
      "/assets/videos/sintel/cut3.webm"
    ]
  },
  all: function () {
    if (!videos) {
      videos = Q.all(_.map(this.data.sintel, function (url) {
        return Qvideo(url, { event: "canplaythrough" });
      }));
    }
    return videos;
  }
};

