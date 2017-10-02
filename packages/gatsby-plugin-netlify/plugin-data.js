"use strict";

exports.__esModule = true;

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

exports.buildPrefixer = buildPrefixer;
exports.default = makePluginData;

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function buildPrefixer(prefix) {
  for (var _len = arguments.length, paths = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    paths[_key - 1] = arguments[_key];
  }

  return function () {
    for (var _len2 = arguments.length, subpaths = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      subpaths[_key2] = arguments[_key2];
    }

    return _path2.default.join.apply(_path2.default, [prefix].concat(paths, subpaths));
  };
}

// Webpack stats map to an array if source maps are enabled.
// We normalize to make direct map.
function normalizeStats(stats) {
  return _lodash2.default.mapValues(stats.assetsByChunkName, function (script) {
    return _lodash2.default.isArray(script) ? script[0] : script;
  });
}

// Layouts are separated by key, so we join in to the pages.
function applyLayouts(pages, layouts) {
  var layoutLookup = _lodash2.default.keyBy(layouts, `id`);
  return pages.map(function (page) {
    var pageLayout = layoutLookup[page.layout];
    return (0, _extends3.default)({}, page, {
      layoutComponentChunkName: pageLayout && pageLayout.componentChunkName
    });
  });
}

// This function assembles data across the manifests and store to match a similar
// shape of `static-entry.js`. With it, we can build headers that point to the correct
// hashed filenames and ensure we pull in the componentChunkName and layoutComponentChunkName.
function makePluginData(store, assetsManifest, pathPrefix) {
  var _store$getState = store.getState(),
      program = _store$getState.program,
      layouts = _store$getState.layouts,
      storePages = _store$getState.pages;

  var publicFolder = buildPrefixer(program.directory, `public`);
  var stats = require(publicFolder(`stats.json`));
  var chunkManifest = normalizeStats(stats);
  var pages = applyLayouts(storePages, layouts);

  // We combine the manifest of JS and the manifest of assets to make a simple lookup table.
  var manifest = (0, _extends3.default)({}, assetsManifest, chunkManifest);

  return {
    pages,
    manifest,
    pathPrefix,
    publicFolder
  };
}