var Q = require("q");
var store = require("store");

var cache = {
  set: function(key, val, exp) {
    store.set(key, { val: val, exp: exp, time: new Date().getTime() });
  },
  get: function(key) {
    var info = store.get(key);
    if (!info) {
      return null;
    }
    if (new Date().getTime() - info.time > info.exp) {
      store.remove(key);
      return null;
    }
    return info.val;
  },
  remove: function (key) {
    store.remove(key);
  },
  clear: function () {
    store.clear();
  },
  getOrSetAsync: function (idOrFunc, time, fetcher) {
    var currentFetchingData = null;
    var idResultIsFunction = typeof idOrFunc === "function";
    return function () {
      var id = idResultIsFunction ? idOrFunc.apply(this, arguments) : idOrFunc;
      var maybeItem = cache.get(id);
      if (maybeItem) {
        console.log("From cache("+id+")", maybeItem);
        return Q(maybeItem);
      }
      else {
        if (!currentFetchingData) {
          currentFetchingData = Q.fapply(fetcher, arguments);
          currentFetchingData.then(function (data) {
            console.log("Store in cache("+id+")", data);
            cache.set(id, data, time);
            currentFetchingData = null;
          }, function () {
            currentFetchingData = null;
          });
        }
        return currentFetchingData;
      }
    };
  }
};

module.exports = cache;
