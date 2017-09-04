var bodyParser        = require("body-parser"),
    compression       = require("compression"),
    crypto            = require("crypto"),
    express           = require("express")(),
    expressUseragent  = require("express-useragent"),
    stripe            = require("stripe")("sk_test_KKbMjLPLaQEZjifDZQxU7sSA"),
    mongoose          = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/plausible", {
    user: "plausibleAdmin",
    pass: "FH091N68hX5eZuqOdsxyP5bJ"
  })
;

express
  .listen(8080, function() {
    console.log("STATUS: Express listening on port 8080");
  })
;

express
  .use(bodyParser.json())
;

express
  .use(compression({
    level: 9
  }))
;

express
  .use(expressUseragent.express())
;

(function() {
  (function() {
    (function() {
      express
        .get("/plausibleBackend/private/deleteThisSession", require("./backend/plausibleControllers/private/thisSession/delete/_"))
      ;
    })();

    (function() {
      express
        .get("/plausibleBackend/private/deleteUserSelf", require("./backend/plausibleControllers/private/userSelf/delete/_"))
      ;
      express
        .get("/plausibleBackend/private/updateUserSelf", require("./backend/plausibleControllers/private/userSelf/update/_"))
      ;
      express
        .get("/plausibleBackend/private/getUserSelf", require("./backend/plausibleControllers/private/userSelf/get/_"))
      ;
    })();
  })();

  (function() {
    (function() {
      express
        .get("/plausibleBackend/public/createSession/", require("./backend/plausibleControllers/public/session/create/_"))
      ;
    })();

    (function() {
      express
        .get("/plausibleBackend/public/createUser/", require("./backend/plausibleControllers/public/user/create/_"))
      ;
      express
        .get("/plausibleBackend/public/getUserbyEmail/", require("./backend/plausibleControllers/public/user/get/byEmail/_"))
      ;
    })();
  })();
})();

(function() {
  (function() {
    (function() {
      express
        .get("/stripeBackend/private/customers/createSource/", function(req, res) {
          require("./backend/stripeControllers/private/customers/createSource/_")(req, res, stripe);
        })
      ;
      express
        .get("/stripeBackend/private/customers/deleteCard/", function(req, res) {
          require("./backend/stripeControllers/private/customers/deleteCard/_")(req, res, stripe);
        })
      ;
      express
        .get("/stripeBackend/private/customers/retrieveCustomer/", function(req, res) {
          require("./backend/stripeControllers/private/customers/retrieveCustomer/_")(req, res, stripe);
        })
      ;
    })();

    (function() {
      express
        .get("/stripeBackend/private/orders/createOrder/", function(req, res) {
          require("./backend/stripeControllers/private/orders/createOrder/_")(req, res, stripe);
        })
      ;
      express
        .get("/stripeBackend/private/orders/listOrders/", function(req, res) {
          require("./backend/stripeControllers/private/orders/listOrders/_")(req, res, stripe);
        })
      ;
      express
        .get("/stripeBackend/private/orders/payOrder/", function(req, res) {
          require("./backend/stripeControllers/private/orders/payOrder/_")(req, res, stripe);
        })
      ;
    })();
  })();

  (function() {
    (function() {
      express
        .get("/stripeBackend/public/customers/createCustomer/", function(req, res) {
          require("./backend/stripeControllers/public/customers/createCustomer/_")(req, res, stripe);
        })
      ;
    })();

    (function() {
      express
        .get("/stripeBackend/public/orders/updateOrder/", function(req, res) {
          require("./backend/stripeControllers/public/orders/updateOrder/_")(req, res, stripe);
        })
      ;
    })();

    (function() {
      express
        .get("/stripeBackend/public/products/listProducts/", function(req, res) {
          require("./backend/stripeControllers/public/products/listProducts/_")(req, res, stripe);
        })
      ;
      express
        .get("/stripeBackend/public/products/retrieveProduct/", function(req, res) {
          require("./backend/stripeControllers/public/products/retrieveProduct/_")(req, res, stripe);
        })
      ;
    })();

    (function() {
      express
        .get("/stripeBackend/public/skus/retrieveSKU/", function(req, res) {
          require("./backend/stripeControllers/public/skus/retrieveSKU/_")(req, res, stripe);
        })
      ;
    })();
  })();
})();

express
  .get("/APP/*", function(req, res) {
    res
      .header("Access-Control-Allow-Origin", "*")
    ;

    res
      .sendFile(__dirname + "/gulp/dist" + req.path)
    ;
  })
;

express
  .get("/*", function(req, res) {
    res
      .header("Access-Control-Allow-Origin", "*")
    ;

    res
      .sendFile(__dirname + "/gulp/dist/index.min.html")
    ;
  })
;
