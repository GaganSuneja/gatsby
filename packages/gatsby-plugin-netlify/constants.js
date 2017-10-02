"use strict";

exports.__esModule = true;
exports.HEADER_COMMENT = exports.COMMON_BUNDLES = exports.ROOT_WILDCARD = exports.LINK_REGEX = exports.CACHING_HEADERS = exports.SECURITY_HEADERS = exports.DEFAULT_OPTIONS = exports.NETLIFY_HEADERS_FILENAME = exports.BUILD_CSS_STAGE = exports.BUILD_HTML_STAGE = undefined;

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Gatsby values
var BUILD_HTML_STAGE = exports.BUILD_HTML_STAGE = `build-html`;
var BUILD_CSS_STAGE = exports.BUILD_CSS_STAGE = `build-css`;

// Plugin values
var NETLIFY_HEADERS_FILENAME = exports.NETLIFY_HEADERS_FILENAME = `_headers`;

var DEFAULT_OPTIONS = exports.DEFAULT_OPTIONS = {
  headers: {},
  mergeSecurityHeaders: true,
  mergeLinkHeaders: false, // TODO: change this to true when gzip for server push is on netlify
  mergeCachingHeaders: true,
  transformHeaders: _lodash2.default.identity // optional transform for manipulating headers for sorting, etc
};

var SECURITY_HEADERS = exports.SECURITY_HEADERS = {
  "/*": [`X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, `X-Content-Type-Options: nosniff`]
};

var CACHING_HEADERS = exports.CACHING_HEADERS = {
  "/static/*": [`Cache-Control: max-age=31536000`]
};

var LINK_REGEX = exports.LINK_REGEX = /^(Link: <\/)(.+)(>;.+)/;
var ROOT_WILDCARD = exports.ROOT_WILDCARD = `/*`;

var COMMON_BUNDLES = exports.COMMON_BUNDLES = [`commons`, `app`];

var HEADER_COMMENT = exports.HEADER_COMMENT = `## Created with gatsby-plugin-netlify`;