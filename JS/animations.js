angular
  .module("plAnimations")
  .animation(".toolbar-animation", [
    "$animateCss",
    function($animateCss) {
      return {
        enter: function(element) {
          return $animateCss(element, {
            from: {
              "height": "0"
            },
            to: {
              "height": "64px"
            },
            addClass: "md-whiteframe-5dp",
            duration: 0.75,
            easing: "cubic-bezier(0.175, 0.885, 0.32, 1.275)" // http://easings.net/#easeOutBack
          });
        },
        leave: function(element) {
          return $animateCss(element, {
            from: {
              "height": "64px"
            },
            to: {
              "height": "0"
            },
            removeClass: "md-whiteframe-5dp",
            duration: 0.375,
            easing: "cubic-bezier(0.6, -0.28, 0.735, 0.045)" // http://easings.net/#easeInBack
          });
        }
      }
    }
  ])
;
