
var $ = function (id) {
  return document.getElementById(id);
};

module.exports = {
  toolbar: $("toolbar"),
  screen: $("screen"),
  footer: $("footer")
};
