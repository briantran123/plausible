angular
  .module("plConfigs")
  .config([
    "$locationProvider",
    function($locationProvider) {
      $locationProvider
        .html5Mode(true)
      ;
    }
  ])
  .config([
    "$routeProvider",
    function($routeProvider) {
      (function($routeProvider, config) {
        (function(process) {
          process({
            name: "",
            path: ""
          }, config.root, process);
        })(function(parentRoute, route, process) {
          route
            .name = parentRoute.name + "/" + route.name
          ;
          route
            .path = parentRoute.path + route.path
          ;

          $routeProvider
            .when(route.path, {
              controller: config.controller(route.name),
              controllerAs: config.controllerAs(route.name),
              templateUrl: config.templateUrl(route.name)
            })
          ;

          if (typeof route.children !== "undefined") {
            angular
              .forEach(route.children, function(childRoute) {
                process(route, childRoute, process);
              })
            ;
          }
        });

        $routeProvider
          .otherwise(config.otherwise)
        ;
      })($routeProvider, {
        controller: function(name) {
          return "pageController_" + name + "/"
        },
        controllerAs: function() {
          return "pageController"
        },
        templateUrl: function(name) {
          return "/APP/HTML" + (name.replace(/-/g, "_") + "/").toUpperCase() + "_.min.html"
        },
        root: {
          name: "root",
          path: "/",
          children: [
            {
              name: "account",
              path: "account/",
              children: [
                {
                  name: "add-card",
                  path: "add-card/",
                  children: []
                }
              ]
            },
            {
              name: "legal",
              path: "legal/",
              children: [
                {
                  name: "terms-of-service",
                  path: "terms-of-service/",
                  children: []
                },
                {
                  name: "payment-system-information",
                  path: "payment-system-information/",
                  children: []
                }
              ]
            },
            {
              name: "products",
              path: "products/",
              children: [
                {
                  name: "product",
                  path: ":productID/",
                  children: []
                }
              ]
            },
            {
              name: "purchase",
              path: "purchase/",
              children: []
            },
            {
              name: "settings",
              path: "settings/",
              children: []
            },
            {
              name: "shopping-cart",
              path: "shopping-cart/",
              children: []
            },
            {
              name: "sign-in",
              path: "sign-in/",
              children: []
            },
            {
              name: "sign-out",
              path: "sign-out/",
              children: []
            },
            {
              name: "sign-up",
              path: "sign-up/",
              children: []
            }
          ]
        },
        otherwise: {
          controller: "pageController_otherwise",
          controllerAs: "pageController",
          templateUrl: "/APP/HTML/OTHERWISE/_.min.html"
        }
      })
    }
  ])
  .config([
    "$mdThemingProvider",
    function($mdThemingProvider) {
      $mdThemingProvider
        .definePalette("Licorice", {
          "50": "#111111",
          "100": "#111111",
          "200": "#111111",
          "300": "#111111",
          "400": "#111111",
          "500": "#111111",
          "600": "#111111",
          "700": "#111111",
          "800": "#111111",
          "900": "#111111",
          "A100": "#111111",
          "A200": "#111111",
          "A400": "#111111",
          "A700": "#111111",
          "contrastDefaultColor": "light",
          "contrastDarkColors": [],
          "contrastLightColors": [
            "50",
            "100",
            "200",
            "300",
            "400",
            "500",
            "550",
            "600",
            "700",
            "800",
            "900",
            "A100",
            "A200",
            "A300",
            "A400"
          ]
        })
        .theme("default")
        .primaryPalette("Licorice", {
          "default": "500",
          "hue-1": "500",
          "hue-2": "500",
          "hue-3": "500"
        })
        .accentPalette("grey", {
          "default": "900"
        })
      ;
    }
  ])
;
