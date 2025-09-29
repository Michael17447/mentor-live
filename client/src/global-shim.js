// client/src/global-shim.js
if (typeof window !== 'undefined') {
  window.global = window;
  window.process = window.process || { env: {}, version: '', nextTick: setTimeout };
}