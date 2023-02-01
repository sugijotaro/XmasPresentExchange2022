
//UAで判別
var isMobile = (function () {
  var ua = window.navigator.userAgent.toLowerCase();
  if (ua.indexOf('ipad') != -1) return true;
  if (ua.indexOf('iphone') != -1) return true;
  if (ua.indexOf('android') != -1) return true;
})();

//レスポンシブ用
var isWideScreen = function () {
  var _breakPoint = "(max-width: 768px)";
  if (window["matchMedia"]) {
    if (window.matchMedia(_breakPoint).matches) { return false; }
  }
  return true;
};
