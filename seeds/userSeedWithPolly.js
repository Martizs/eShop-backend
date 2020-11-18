// NOTE: call this js script from root, like so: node seeds\userSeedWithPolly.js test test
// first argument - username, second - password

// Transpile all code following this line with babel and use '@babel/preset-env' (aka ES6) preset.
require("@babel/register")({
  presets: ["@babel/preset-env"],
});

require("@babel/polyfill");

// Import the rest of our application.
module.exports = require("./userSeed.js");
