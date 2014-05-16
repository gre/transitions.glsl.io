var Q = require("q");

var ClickButton = function (options) {
  if (!(this instanceof ClickButton)) return new ClickButton(options);
  for (var o in options) {
    this[o] = options[o];
  }
  var self = this;
  this._onclick = function (e) {
    self.onClick(e);
  };
};

ClickButton.create = function (options) {
  return new ClickButton(options);
};

// Same interface of https://github.com/peutetre/mobile-button/blob/master/lib/button.js until we use it
// Validation will come when the button.js implementation is ready
ClickButton.prototype = {
  activeCls: "active",
  debounceRate: 200,
  bind: function () {
    this.el.addEventListener("click", this._onclick, false);
    this.binded = true;
    return this;
  },
  unbind: function () {
    this.el.removeEventListener("click", this._onclick, false);
    this.binded = false;
    return this;
  },
  setEl: function (el) {
    this.el = el;
  },
  setF: function (f) {
    this.f = f;
  },
  setActive: function (active) {
    if (active)
      this.el.classList.add(this.activeCls);
    else
      this.el.classList.remove(this.activeCls);
    this.active = active;
  },
  onClick: function (e) {
    var self = this;
    var valid = this.isValidClickEvent(e);
    if (valid) {
      e.preventDefault();
    }
    if (!this.active && valid) {
      Q.fcall(function () {
        self.setActive(true);
        return self.f(e);
      })
      .delay(this.debounceRate)
        .fin(function () {
          self.setActive(false);
        })
      .done();
    }
  },
  isValidClickEvent: function (e) {
    // left click only and no control key pressed
    return e.which === 1 && !e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey;
  }
};

module.exports = ClickButton;

