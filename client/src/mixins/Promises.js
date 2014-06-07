var Q = require("q");

var PromisesMixin = {
  // Promified setState
  setStateQ: function (state) {
    var d = Q.defer();
    this.setState(state, d.resolve);
    return d.promise;
  },
  replaceStateQ: function (nextState) {
    var d = Q.defer();
    this.replaceState(nextState, d.resolve);
    return d.promise;
  },
  forceUpdateQ: function () {
    var d = Q.defer();
    this.forceUpdate(d.resolve);
    return d.promise;
  },
  // When a Promise ends, force a rendering update
  watchQ: function (promise) {
    var self = this;
    return promise.fin(function () {
      return self.forceUpdateQ();
    });
  }
};

module.exports = PromisesMixin;
