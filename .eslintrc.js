module.exports = {
  env: {
    es6: true, // Since we're using ES6+ features like Async/Await
    browser: true,
    node: true,
  },
  extends: "eslint:recommended",
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  rules: {},
};
