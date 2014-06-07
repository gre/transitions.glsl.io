var Q = require("q");
var _ = require("lodash");

var PromisesMixin = {
  // Promified setState
  setStateQ: function (state) {
    var d = Q.defer();
    this.setState(state, d.resolve);
    return d.promise;
  },
  // When a Promise ends, force a rendering update
  watchQ: function (promise) {
    var self = this;
    return promise.fin(function () {
      var d = Q.defer();
      self.forceUpdate(d.resolve);
      return d.promise;
    });
  }
};

module.exports = PromisesMixin;
