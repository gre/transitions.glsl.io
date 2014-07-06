var Q = require("q");

/**
 * options.event different level of load:
 *  - "loadedmetadata"
 *  - "loadeddata"
 *  - "canplay"
 *  - "canplaythrough" (default)
 */
function Qvideo (url, options) {
  if (typeof options !== "object") options={};
  if (!options.event) options.event = "canplaythrough";
  var d = Q.defer();
  var video = document.createElement('video');
  video.src = url;
  video.addEventListener(options.event, function () {
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
