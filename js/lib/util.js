/**
 * Minified by jsDelivr using Terser v3.14.1.
 * Original file: /npm/promisefy-util@1.2.0/index.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
"use strict";
function sleep(e) {
  return new Promise(function (n, o) {
    setTimeout(function () {
      n();
    }, e);
  });
}
function promisefy(e, n = [], o = null) {
  return new Promise(function (t, i) {
    n.push(function (e, n) {
      e ? i(e) : t(n);
    }),
      e.apply(o, n);
  });
}
function promiseEvent(e, n = [], o = null, t) {
  return new Promise(function (i, r) {
    let s = e.apply(o, n);
    o.on(t, function (e) {
      e ? r(e) : i(s);
    });
  });
}
export {
  sleep,
  promisefy,
  promiseEvent
}
//# sourceMappingURL=/sm/38cade3fcb29da9cf6a5cb2421382358584ec0ddd51e0d17027d126e3856c8e6.map
