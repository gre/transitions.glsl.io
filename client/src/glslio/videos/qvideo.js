var Q = require("q");

function Qvideo (url) {
  var d = Q.defer();
  var video = document.createElement('video');
  video.src = url;
  video.addEventListener('canplaythrough', function () {
    d.resolve(video);
  }, true);
  video.onerror = function (e) {
    console.error(e&&e.stack||e);
    d.reject(new Error("Video "+url+" failed to load: "+e));
  };
  video.load();
  return d.promise;
}

module.exports = Qvideo;
