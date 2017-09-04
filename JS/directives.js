angular
  .module("plDirectives")
  .directive("plInjectPropertyValues", [
    "$timeout",
    "$q",
    function($timeout, $q) {
      return {
        scope: true,
        restrict: "A",
        link: function(scope, element, attrs) {
          $timeout(function() {
            (function(attr) {
              (function(process) {
                angular
                  .forEach(attr, function(elementAndPropertyCouple) {
                    ResizeSensor(angular.element(document.querySelector(elementAndPropertyCouple[0]))[0], process);
                  })
                ;

                process();
              })(function() {
                delete scope.propertyValues;

                angular
                  .forEach(attr, function(elementAndPropertyCouple) {
                    scope
                      .$apply(function(scope) {
                        if (typeof scope.propertyValues !== "undefined") {
                          scope
                            .propertyValues
                            .push(angular.element(document.querySelector(elementAndPropertyCouple[0])).prop(elementAndPropertyCouple[1]))
                          ;
                        } else {
                          scope
                            .propertyValues = [angular.element(document.querySelector(elementAndPropertyCouple[0])).prop(elementAndPropertyCouple[1])]
                          ;
                        }
                      })
                    ;
                  })
                ;
              });
            })(scope.$eval(attrs.plInjectPropertyValues));
          }, 0);
        }
      }
    }
  ])
;
