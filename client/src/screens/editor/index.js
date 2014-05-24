var View = require("./view");
var Validator = require("../../validator");
var Q = require("q");
var _ = require("lodash");
var ClickButton = require("../../clickbutton");
var ace = window.ace;
var templateToolbar = require("./toolbar.hbs");
var template = require("./screen.hbs");
var model = require("../../model");
var routes = require("../../routes");
var env = require("../../env");

function logExceptions (f) {
  return function () {
    try {
      return f.apply(this, arguments);
    }
    catch (e) {
      console.log(e);
      throw e;
    }
  };
}

function makeStatusSystem (node) {
  var timeout;
  var initialClasses = node.className;
  return function setStatus (message, type) {
    type = type.toLowerCase();
    node.className = initialClasses+" "+type;
    node.textContent = message;
    if (timeout) clearTimeout(timeout);
    if (type === "success") {
      timeout = setTimeout(function () {
        node.className = initialClasses;
        timeout = null;
      }, 500);
    }
  };
}

function createEditor ($editor) {
  var editor = ace.edit($editor);
  editor.setFontSize("14px");
  editor.setShowPrintMargin(false);
  editor.setTheme("ace/theme/solarized_light");
  var session = editor.getSession();
  session.setTabSize(2);
  session.setMode("ace/mode/glsl");
  session.setUseWrapMode(true);
  editor.focus();
  return {
    session: session,
    editor: editor
  };
}

var afterShow;
var unbind;

function show (args) {
  if (!args || !args.transition) throw new Error("args.transition required.");
  var transition = args.transition;
  var elt = document.createElement("div");
  elt.id = "editor-wrapper";
  var toolbar = document.createElement("div");
  args.isPublished = args.gist.name !== "TEMPLATE";
  args.isMyGist = transition.owner === env.user;
  args.isRootGist = transition.id === env.rootGist;
  args.isRootOrMyGist = args.isRootGist || args.isMyGist;
  args.env = env;

  elt.innerHTML = template(args);
  toolbar.innerHTML = templateToolbar(args);
  var $editor = elt.querySelector("#editor");
  var $editorContainer = elt.querySelector("#editorContainer");
  var canvas = elt.querySelector("#render");
  var $status = elt.querySelector("#status");
  var $saveStatus = toolbar.querySelector(".save-state");

  var setGlslCompilationStatus = makeStatusSystem($status);
  var setSaveStatus = $saveStatus ? makeStatusSystem($saveStatus) : _.noop;

  var glslCompiled = true;

  var publishTransitionElt = toolbar.querySelector(".publish-transition");
  var saveTransitionElt = toolbar.querySelector(".save-transition");
  var publishTransitionButton;
  var saveTransitionButton;
  var lastSavedTransition = transition.clone();
  if (saveTransitionElt) {
    saveTransitionButton = ClickButton({
      el: saveTransitionElt,
      disable: function () {
        this.el.classList.add("disabled");
        window.onbeforeunload = null;
      },
      enable: function () {
        this.el.classList.remove("disabled");
        window.onbeforeunload = function () {
          return "Are you sure you want to leave this page?\n\nUNSAVED CHANGES WILL BE LOST.";
        };
      },
      isEnabled: function () {
        return !this.el.classList.contains("disabled");
      },
      isValidClickEvent: function (e) {
        if (!ClickButton.prototype.isValidClickEvent.call(this, e)) return false;
        if (this.isEnabled()) {
          return true;
        }
        e.preventDefault();
        return false;
      },
      f: function (e) {
        var self = this;
        var t = transition.clone();
        if (args.isRootGist) {
          setSaveStatus("Creating...", "INFO");
          return model.createNewTransition()
            .then(function (r) {
              t.id = r.id;
              return model.saveTransition(t);
            })
            .then(function () {
              setSaveStatus("Created.", "SUCCESS");
            })
            .then(function () {
              self.disable();
              return routes.route("/transition/"+t.id);
            })
            .fail(function (e) {
              setSaveStatus("Create failed.", "ERROR");
              throw e;
            });
        }
        else {
          setSaveStatus("Saving...", "INFO");
          return model.saveTransition(t)
            .then(function () {
              lastSavedTransition = t;
              setSaveStatus("Saved.", "SUCCESS");
              self.disable();
            })
            .fail(function (e) {
              setSaveStatus("Save failed.", "ERROR");
              throw e;
            });
        }
      }
    });
    saveTransitionButton.disable();

    if (publishTransitionElt) {
      publishTransitionButton = ClickButton({
        el: publishTransitionElt,
        f: function () {
          var name = prompt("Please choose a transition name (alphanumeric only):");
          if (name.match(/^[a-zA-Z0-9_]+$/)) {
            transition.name = name;
            saveTransitionButton.enable();
            return Q.fcall(_.bind(saveTransitionButton.f, saveTransitionButton))
              .then(function () {
                return routes.reload();
              });
          }
          else {
            alert("Title must be alphanumeric.");
          }
        }
      });
    }
  }

  var touchSaveState = _.debounce(function () {
    if (saveTransitionButton) {
      if (!glslCompiled) {
        setSaveStatus("GLSL errors must be fixed.", "WARN");
        saveTransitionButton.disable();
      }
      else if (lastSavedTransition.equals(transition)) {
        setSaveStatus(args.isRootGist ? "No changes." : "", "INFO");
        saveTransitionButton.disable();
      }
      else {
        setSaveStatus(args.isRootGist ? "" : "Unsaved changes.", "INFO");
        saveTransitionButton.enable();
      }
    }
  }, 50);

  var view = View.init(elt, canvas, transition);
  var ed = createEditor($editor);
  var session = ed.session;
  var editor = ed.editor;
  var validator = new Validator(canvas);

  var editorHeight = 0;
  var editorWidth = 0;
  function computeResize () {
    var height = Math.max(500, window.innerHeight - 142);
    var width = Math.max(500, window.innerWidth - 340);
    var resize = false;
    if (height !== editorHeight) {
      editorHeight = height;
      $editor.style.height = height+"px";
      elt.style.height = (height+10)+"px";
      resize = true;
    }
    if (width !== editorWidth) {
      editorWidth = width;
      $editorContainer.style.width = width+"px";
      resize = true;
    }
    if (resize) {
      editor.resize();
    }
  }
  window.addEventListener("resize", computeResize, false);
  afterShow = function () {
    if (saveTransitionButton) saveTransitionButton.bind();
    if (publishTransitionButton) publishTransitionButton.bind();
    computeResize();
    transition.onChange("glsl", touchSaveState);
    transition.onChange("name", touchSaveState);
    transition.onChange("uniforms", touchSaveState);
    touchSaveState();
  }

  unbind = function () {
    if (saveTransitionButton) {
      saveTransitionButton.disable();
      saveTransitionButton = null;
    }
    window.removeEventListener("resize", computeResize);
    view.destroy();
  };

  var marker;

  session.on("change", _.debounce(logExceptions(function () {
    if (marker) {
      session.removeMarker(marker.id);
      marker = null;
    }

    var glsl = session.getValue();
    if (!glsl) {
      glslCompiled = false;
      setGlslCompilationStatus('Shader cannot be empty', "WARNING");
      marker = session.highlightLines(0, 0);
      touchSaveState();
      return;
    }

    var _ref = validator.validate(glsl), ok = _ref[0], line = _ref[1], msg = _ref[2];
    glslCompiled = !!ok;
    if (ok) {
      transition.glsl = glsl;
      return setGlslCompilationStatus('Shader successfully compiled', "SUCCESS");
    } else {
      line = Math.max(0, line - 1);
      marker = session.highlightLines(line, line);
      touchSaveState();
      return setGlslCompilationStatus("Line " + line + " : " + msg, "ERROR");
    }
  }), 100));

  session.setValue(transition.glsl);
  return { elt: elt, toolbar: toolbar };
}

function init () {
  return {
    ready: Q(),
    show: show,
    afterShow: function () {
      if (afterShow) afterShow();
    },
    hide: function () {
      if (unbind) unbind();
    }
  };
}

module.exports = init;
