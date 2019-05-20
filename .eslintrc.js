module.exports = {
  "plugins": [
    "template",         // Handle Tornado templates and JS in HTML files
  ],
  "env": {
    "browser": true,    // Include browser globals
    "jquery": true,     // Include jQuery and $
    "mocha": true,      // Include it(), assert(), etc
    "es6": true         // Enabling ES6
  },
  "globals": {
    "_": true,          // lodash.js
    "Vue": true,        // Vue.js
    "d3": true,         // d3.js
    "vg": true,         // vega.js
    "L": true,          // leaflet.js
    "ga": true,         // Google analytics
    "G": true,          // G.min.js
    "topojson": true,   // topojson.js
    "moment": true,     // moment.js
    "numeral": true,    // numeral.js
    "assert": true,     // chai.js
  },
  "parserOptions": {
    "sourceType": "module"
  },
  "ecmaFeatures": {
    "modules": true,
    "spread" : true,
    "restParams" : true
  },
  "extends": "eslint:recommended",
  "rules": {
    /* Override default rules */
    "indent": ["off", 2],                   // We eventually want 2 space indentation
    "linebreak-style": ["off", "unix"],     // We eventually want UNIX style line
    "quotes": ["off", "double"],            // We may go for a double-quotes style
    "semi": ["off", "never"],               // We may go for a no-semicolon style
    "no-unused-vars": [0, { "varsIgnorePattern": "^h$" }]
  }
};

