angular
  .module("plFilters")
  .filter("typeof", [
    function() {
      return function(input) {
        return typeof input;
      }
    }
  ])
  .filter("trustAsHTML", [
    "$sce",
    function($sce) {
      return function(input) {
        return $sce.trustAsHtml(input);
      }
    }
  ])
  .filter("trustAsResourceURL", [
    "$sce",
    function($sce) {
      return function(input) {
        return $sce.trustAsResourceUrl(input);
      }
    }
  ])
  .filter("creditCard", [
    function() {
      return function(input) {
        return input.slice(0, 5) + " " + input.slice(4, 9) + " " + input.slice(8, 13) + " " + input.slice(12, 17);
      }
    }
  ])
  .filter("obfuscatedCreditCard", [
    function() {
      return function(input) {
        return "&#x2022;&#x2022;&#x2022;&#x2022; &#x2022;&#x2022;&#x2022;&#x2022; &#x2022;&#x2022;&#x2022;&#x2022; " + input;
      }
    }
  ])
  .filter("reverseArray", [
    function() {
      return function(input) {
        if (typeof input !== "undefined") {
          return input.slice().reverse();
        }
      }
    }
  ])
;
