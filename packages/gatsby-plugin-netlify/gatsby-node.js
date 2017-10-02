"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _webpackAssetsManifest = require("webpack-assets-manifest");

var _webpackAssetsManifest2 = _interopRequireDefault(_webpackAssetsManifest);

var _pluginData = require("./plugin-data");

var _pluginData2 = _interopRequireDefault(_pluginData);

var _buildHeadersProgram = require("./build-headers-program");

var _buildHeadersProgram2 = _interopRequireDefault(_buildHeadersProgram);

var _createRedirects = require("./create-redirects");

var _createRedirects2 = _interopRequireDefault(_createRedirects);

var _constants = require("./constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var assetsManifest = {};

// Inject a webpack plugin to get the file manifests so we can translate all link headers
// https://www.netlify.com/docs/headers-and-basic-auth/

exports.modifyWebpackConfig = function (_ref) {
  var config = _ref.config,
      stage = _ref.stage;

  if (stage !== _constants.BUILD_HTML_STAGE && stage !== _constants.BUILD_CSS_STAGE) {
    return config;
  }

  // Using merge, as webpack-configurator is broken with strict mode classes
  // which WebpackAssetsManifest uses.
  config.merge({
    plugins: [new _webpackAssetsManifest2.default({
      assets: assetsManifest, // mutates object with entries
      merge: true
    })]
  });

  return config;
};

exports.onPostBuild = function () {
  var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(_ref2, userPluginOptions) {
    var store = _ref2.store,
        pathPrefix = _ref2.pathPrefix;

    var pluginData, pluginOptions, _store$getState, redirects;

    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            pluginData = (0, _pluginData2.default)(store, assetsManifest, pathPrefix);
            pluginOptions = (0, _extends3.default)({}, _constants.DEFAULT_OPTIONS, userPluginOptions);
            _store$getState = store.getState(), redirects = _store$getState.redirects;
            _context.next = 5;
            return Promise.all([(0, _buildHeadersProgram2.default)(pluginData, pluginOptions), (0, _createRedirects2.default)(pluginData, redirects)]);

          case 5:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function (_x, _x2) {
    return _ref3.apply(this, arguments);
  };
}();