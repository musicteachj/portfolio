// CloudFront viewer-request function. Runtime: cloudfront-js-2.0.
// Kept to conservative syntax: var, plain functions, basic String methods.
// Tests: tests/infra/viewer-request.test.ts (loaded through scripts/lib/cloudfront-function.mjs).
//
// CloudFront fronts the S3 website endpoint, which 302-redirects /x to /x/ when
// x/index.html exists. To avoid a redirect loop, this function sends trailing
// slashes away with a 301 and rewrites clean URLs to .../index.html.
//
// Order: normalize the trailing slash, then redirect (301), then rewrite.

var REDIRECTS = {
  '/about': '/',
  '/experience': '/',
  '/home': '/',
  '/portfolio': '/',
  '/work': '/',
  '/projects/6': '/projects/resumeiq',
  '/projects/7': '/projects/folio',
  '/projects/12': '/projects',
  '/James_Littlefield_Senior_Full_Stack_Developer.pdf': '/resume.pdf',
}

// Values are passed through as CloudFront supplies them (assumed to still be
// percent-encoded), never decoded or re-encoded. The post-launch check in
// infra/cloudfront/README.md verifies this.
function buildQuery(querystring) {
  var parts = []
  for (var name in querystring) {
    var entry = querystring[name]
    if (entry.multiValue) {
      for (var i = 0; i < entry.multiValue.length; i++) {
        parts.push(name + '=' + entry.multiValue[i].value)
      }
    } else {
      parts.push(name + '=' + entry.value)
    }
  }
  return parts.length ? '?' + parts.join('&') : ''
}

function redirect(location, querystring) {
  return {
    statusCode: 301,
    statusDescription: 'Moved Permanently',
    headers: { location: { value: location + buildQuery(querystring || {}) } },
  }
}

function handler(event) {
  var request = event.request
  // 1. Normalize: collapse leading slashes (and backslashes, which browsers read
  // as slashes) to one "/" so no Location can start with "//" or "/\\", which
  // would be an open redirect. Then strip trailing slashes.
  // Browsers drop raw tab, newline and carriage return from URLs, so remove them
  // first: "/\t/evil.com" would otherwise survive as a "//evil.com" Location.
  var uri = request.uri.replace(/[\t\n\r]/g, '').replace(/^[/\\]+/, '/')
  var hadSlash = false
  while (uri.length > 1 && uri.charAt(uri.length - 1) === '/') {
    uri = uri.slice(0, -1)
    hadSlash = true
  }

  // 2. Redirect.
  if (Object.prototype.hasOwnProperty.call(REDIRECTS, uri)) {
    return redirect(REDIRECTS[uri], request.querystring)
  }
  // Any other numeric project id (the old site's /projects/<n>) goes to the list.
  if (/^\/projects\/[0-9]+$/.test(uri)) {
    return redirect('/projects', request.querystring)
  }
  if (hadSlash) {
    return redirect(uri, request.querystring)
  }

  // 3. Rewrite clean URLs to their index.html.
  request.uri = uri
  if (uri === '/') {
    request.uri = '/index.html'
  } else if (uri.slice(uri.lastIndexOf('/') + 1).indexOf('.') === -1) {
    request.uri = uri + '/index.html'
  }
  return request
}

if (typeof module !== 'undefined') {
  module.exports = { handler: handler }
}
