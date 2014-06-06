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
  cursor.style.display = "none";
  return transitionViewer.start(1500, 200);
}
function stop () {
  cursor.style.display = "block";
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
    var lastHover = 0;
    function hover (p) {
      transitionViewer.hover(p);
      cursor.style.left = (p * 100)+"%";
      lastHover = 0;
    }
    function hoverEvent (e) {
      hover((e.clientX - overlay.getBoundingClientRect().left) / overlay.clientWidth);
    }
    var down = false;
    overlay.addEventListener("mousedown", function (e) {
      e.preventDefault();
      down = true;
      hoverEvent(e);
      stop();
    });
    overlay.addEventListener("mouseup", function () {
      down = false;
      start();
    });
    overlay.addEventListener("mousemove", function (e) {
      if (down) {
        e.preventDefault();
        hoverEvent(e);
      }
    });
    overlay.addEventListener("mouseenter", function () {
    });
    overlay.addEventListener("mouseleave", function () {
      if (down) {
        down = false;
        start();
      }
    });
    return start();
  })
  .done();
