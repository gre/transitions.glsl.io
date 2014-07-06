var Qvideo = require("./qvideo");
var Q = require("q");

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
      videos = Q.all(this.data.sintel.map(Qvideo));
    }
    return videos;
  }
};

