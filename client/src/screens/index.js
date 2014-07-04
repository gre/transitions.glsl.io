module.exports = {
  home: require("./home"),
  editor: require("./editor"),
  gallery: require("./gallery"),
  // FIXME : we may split into 2 screen for less if() checks : 'public user' and 'my gallery'
  user: require("./user"),
  me: require("./user"),
  error: require("./error"),
  blog: require("./blog")
};
