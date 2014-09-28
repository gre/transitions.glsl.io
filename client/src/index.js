if ("production" !== process.env.NODE_ENV) window.React = require("react"); /* Expose React for the react web console */

require("./app");
