var Q = require("q");
var Qajax = require("qajax");

/**
 * options.event different level of load:
 *  - "loadedmetadata"
 *  - "loadeddata"
 *  - "canplay"
 *  - "canplaythrough" (default)
 */
function Qvideo (url, options) {
  return Qajax(url).then(function(){
    if (typeof options !== "object") options={};
    if (!options.event) options.event = "canplaythrough";
    var d = Q.defer();
    var video;
    try {
      video = new window.Video();
    } catch (e) {
      video = document.createElement('video');
    }

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
  });
}

module.exports = Qvideo;
