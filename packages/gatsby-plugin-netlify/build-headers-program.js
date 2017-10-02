"use strict";

exports.__esModule = true;
exports.default = buildHeadersProgram;

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _fsExtra = require("fs-extra");

var _constants = require("./constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function validHeaders(headers) {
  if (!headers || !_lodash2.default.isObject(headers)) {
    return false;
  }

  return _lodash2.default.every(headers, function (headersList, path) {
    return _lodash2.default.isArray(headersList) && _lodash2.default.every(headersList, function (header) {
      return _lodash2.default.isString(header);
    });
  });
}

function linkTemplate(assetPath) {
  var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : `script`;

  return `Link: <${assetPath}>; rel=preload; as=${type}`;
}

function pathChunkName(path) {
  var name = path === `/` ? `index` : _lodash2.default.kebabCase(path);
  return `path---${name}`;
}

function createScriptHeaderGenerator(manifest, pathPrefix) {
  return function (script) {
    var chunk = manifest[script];

    if (!chunk) {
      return null;
    }

    // Always add starting slash, as link entries start with slash as relative to deploy root
    return linkTemplate(`${pathPrefix}/${chunk}`);
  };
}

function linkHeaders(scripts, manifest, pathPrefix) {
  return _lodash2.default.compact(scripts.map(createScriptHeaderGenerator(manifest, pathPrefix)));
}

function headersPath(pathPrefix, path) {
  return `${pathPrefix}${path}`;
}

function preloadHeadersByPage(pages, manifest, pathPrefix) {
  var linksByPage = {};

  pages.forEach(function (page) {
    var scripts = [].concat(_constants.COMMON_BUNDLES, [pathChunkName(page.path), page.componentChunkName, page.layoutComponentChunkName]);

    var pathKey = headersPath(pathPrefix, page.path);

    linksByPage[pathKey] = linkHeaders(scripts, manifest, pathPrefix);
  });

  return linksByPage;
}

function defaultMerge() {
  function unionMerge(objValue, srcValue) {
    if (_lodash2.default.isArray(objValue)) {
      return _lodash2.default.union(objValue, srcValue);
    } else {
      return undefined; // opt into default merge behavior
    }
  }

  for (var _len = arguments.length, headers = Array(_len), _key = 0; _key < _len; _key++) {
    headers[_key] = arguments[_key];
  }

  return _lodash2.default.mergeWith.apply(_lodash2.default, [{}].concat(headers, [unionMerge]));
}

function transformLink(manifest, publicFolder, pathPrefix) {
  return function (header) {
    return header.replace(_constants.LINK_REGEX, function (__, prefix, file, suffix) {
      var hashed = manifest[file];
      if (hashed) {
        return `${prefix}${pathPrefix}${hashed}${suffix}`;
      } else if (fs.existsSync(publicFolder(file))) {
        return `${prefix}${pathPrefix}${file}${suffix}`;
      } else {
        throw new Error(`Could not find the file specified in the Link header \`${header}\`.` + `The gatsby-plugin-netlify is looking for a matching file (with or without a ` + `webpack hash). Check the public folder and your gatsby-config.js to ensure you are ` + `pointing to a public file.`);
      }
    });
  };
}

// Writes out headers file format, with two spaces for indentation
// https://www.netlify.com/docs/headers-and-basic-auth/
function stringifyHeaders(headers) {
  return _lodash2.default.reduce(headers, function (text, headerList, path) {
    var headersString = _lodash2.default.reduce(headerList, function (accum, header) {
      return `${accum}  ${header}\n`;
    }, ``);
    return `${text}${path}\n${headersString}`;
  }, ``);
}

// program methods

var validateUserOptions = function validateUserOptions(pluginOptions) {
  return function (headers) {
    if (!validHeaders(headers)) {
      throw new Error(`The "headers" option to gatsby-plugin-netlify is in the wrong shape. ` + `You should pass in a object with string keys (representing the paths) and an array ` + `of strings as the value (representing the headers). ` + `Check your gatsby-config.js.`);
    }

    ;[`mergeSecurityHeaders`, `mergeLinkHeaders`, `mergeCachingHeaders`].forEach(function (mergeOption) {
      if (!_lodash2.default.isBoolean(pluginOptions[mergeOption])) {
        throw new Error(`The "${mergeOption}" option to gatsby-plugin-netlify must be a boolean. ` + `Check your gatsby-config.js.`);
      }
    });

    if (!_lodash2.default.isFunction(pluginOptions.transformHeaders)) {
      throw new Error(`The "transformHeaders" option to gatsby-plugin-netlify must be a function ` + `that returns a array of header strings.` + `Check your gatsby-config.js.`);
    }

    return headers;
  };
};

var mapUserLinkHeaders = function mapUserLinkHeaders(_ref) {
  var manifest = _ref.manifest,
      pathPrefix = _ref.pathPrefix,
      publicFolder = _ref.publicFolder;
  return function (headers) {
    return _lodash2.default.mapValues(headers, function (headerList) {
      return _lodash2.default.map(headerList, transformLink(manifest, publicFolder, pathPrefix));
    });
  };
};

var mapUserLinkAllPageHeaders = function mapUserLinkAllPageHeaders(pluginData, _ref2) {
  var allPageHeaders = _ref2.allPageHeaders;
  return function (headers) {
    if (!allPageHeaders) {
      return headers;
    }

    var pages = pluginData.pages,
        manifest = pluginData.manifest,
        publicFolder = pluginData.publicFolder,
        pathPrefix = pluginData.pathPrefix;


    var headersList = _lodash2.default.map(allPageHeaders, transformLink(manifest, publicFolder, pathPrefix));

    var duplicateHeadersByPage = _lodash2.default.reduce(pages, function (combined, page) {
      var pathKey = headersPath(pathPrefix, page.path);
      return defaultMerge(combined, { [pathKey]: headersList });
    }, {});

    return defaultMerge(headers, duplicateHeadersByPage);
  };
};

var applyLinkHeaders = function applyLinkHeaders(pluginData, _ref3) {
  var mergeLinkHeaders = _ref3.mergeLinkHeaders;
  return function (headers) {
    if (!mergeLinkHeaders) {
      return headers;
    }

    var pages = pluginData.pages,
        manifest = pluginData.manifest,
        pathPrefix = pluginData.pathPrefix;

    var perPageHeaders = preloadHeadersByPage(pages, manifest, pathPrefix);

    return defaultMerge(headers, perPageHeaders);
  };
};

var applySecurityHeaders = function applySecurityHeaders(_ref4) {
  var mergeSecurityHeaders = _ref4.mergeSecurityHeaders;
  return function (headers) {
    if (!mergeSecurityHeaders) {
      return headers;
    }

    return defaultMerge(headers, _constants.SECURITY_HEADERS);
  };
};

var applyCachingHeaders = function applyCachingHeaders(_ref5) {
  var mergeCachingHeaders = _ref5.mergeCachingHeaders;
  return function (headers) {
    if (!mergeCachingHeaders) {
      return headers;
    }

    return defaultMerge(headers, _constants.CACHING_HEADERS);
  };
};

var applyTransfromHeaders = function applyTransfromHeaders(_ref6) {
  var transformHeaders = _ref6.transformHeaders;
  return function (headers) {
    return _lodash2.default.mapValues(headers, transformHeaders);
  };
};

var transformToString = function transformToString(headers) {
  return `${_constants.HEADER_COMMENT}\n\n${stringifyHeaders(headers)}`;
};

var writeHeadersFile = function writeHeadersFile(_ref7) {
  var publicFolder = _ref7.publicFolder;
  return function (contents) {
    return (0, _fsExtra.writeFile)(publicFolder(_constants.NETLIFY_HEADERS_FILENAME), contents);
  };
};

function buildHeadersProgram(pluginData, pluginOptions) {
  return _lodash2.default.flow(validateUserOptions(pluginOptions), mapUserLinkHeaders(pluginData, pluginOptions), applySecurityHeaders(pluginOptions), applyCachingHeaders(pluginOptions), mapUserLinkAllPageHeaders(pluginData, pluginOptions), applyLinkHeaders(pluginData, pluginOptions), applyTransfromHeaders(pluginOptions), transformToString, writeHeadersFile(pluginData))(pluginOptions.headers);
}