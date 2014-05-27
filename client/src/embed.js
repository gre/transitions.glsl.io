var Q = require("q");
var Qimage = require("qimage");
var TransitionViewer = require("./transitionViewer");
var transition = window.transition;
var width = 435;
var height = 290;
var dpr = window.devicePixelRatio || 1;

var renderContainer = document.getElementById("renderContainer");
var overlay = document.getElementById("renderOverlay");
var cursor = overlay.querySelector(".cursor");
var canvas = document.getElementById("render");
canvas.width = dpr * width;
canvas.height = dpr * height;
renderContainer.style.width = canvas.style.width = width+'px';
renderContainer.style.height = canvas.style.height = height+'px';

var transitionViewer = new TransitionViewer(canvas);

function start () {
  return transitionViewer.start(1500, 200);
}
function stop () {
  return transitionViewer.stop();
}

Q.all([
  Qimage("/assets/images/gallery/1.jpg"),
  Qimage("/assets/images/gallery/2.jpg"),
  Qimage("/assets/images/gallery/3.jpg")
])
  .then(function (images) {
    transitionViewer.setImages(images);
  })
  .then(function () {
    transitionViewer.setUniforms(transition.defaults);
    transitionViewer.setGlsl(transition.glsl);
    overlay.addEventListener("mousemove", function (e) {
      var p = (e.clientX - overlay.getBoundingClientRect().left) / overlay.clientWidth;
      transitionViewer.hover(p);
      cursor.style.left = (p * 100)+"%";
    });
    overlay.addEventListener("mouseenter", function () {
      stop();
    });
    overlay.addEventListener("mouseleave", function () {
      start();
    });
    return start();
  })
  .done();
