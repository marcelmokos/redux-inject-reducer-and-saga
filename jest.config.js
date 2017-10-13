module.exports = {
  verbose: true,
  transformIgnorePatterns: ["!node_modules/redux-inject-reducer-and-saga/"],
  snapshotSerializers: ["enzyme-to-json/serializer"],
  setupFiles: ["raf/polyfill", "<rootDir>/jest.setup.js"],
};
