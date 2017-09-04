angular
  .module("plFactories")
  .factory("fxr", [
    "$http",
    function($http) {
      return {
        latest: function(options) {
          return $http.get("//api.fixer.io/latest", {
            params: options
          });
        }
      }
    }
  ])
  .factory("PlausibleBackend", [
    "$http",
    function($http) {
      return {
        private: {
          deleteThisSession: function(session) {
            return $http.get("/plausibleBackend/private/deleteThisSession/", {
              params: {
                session: session
              }
            });
          },
          deleteUserSelf: function(session) {
            return $http.get("/plausibleBackend/private/deleteUserSelf/", {
              params: {
                session: session
              }
            });
          },
          updateUserSelf: function(session, options) {
            return $http.get("/plausibleBackend/private/updateUserSelf/", {
              params: {
                session: session,
                options: options
              }
            });
          },
          getUserSelf: function(session) {
            return $http.get("/plausibleBackend/private/getUserSelf/", {
              params: {
                session: session
              }
            });
          }
        },
        public: {
          createSession: function(options) {
            return $http.get("/plausibleBackend/public/createSession/", {
              params: {
                options: options
              }
            });
          },
          createUser: function(options) {
            return $http.get("/plausibleBackend/public/createUser/", {
              params: {
                options: options
              }
            });
          },
          getUserByEmail: function(options) {
            return $http.get("/plausibleBackend/public/getUserByEmail/", {
              params: {
                options: options
              }
            });
          }
        }
      };
    }
  ])
  .factory("StripeBackend", [
    "$http",
    function($http) {
      return {
        private: {
          customers: {
            createSource: function(session, options) {
              return $http.get("/stripeBackend/private/customers/createSource/", {
                params: {
                  session: session,
                  options: options
                }
              })
            },
            deleteCard: function(session, cardID) {
              return $http.get("/stripeBackend/private/customers/deleteCard/", {
                params: {
                  session: session,
                  cardID: cardID
                }
              })
            },
            retrieveCustomer: function(session) {
              return $http.get("/stripeBackend/private/customers/retrieveCustomer/", {
                params: {
                  session: session
                }
              })
            }
          },
          orders: {
            createOrder: function(session, options) {
              return $http.get("/stripeBackend/private/orders/createOrder/", {
                params: {
                  session: session,
                  options: options
                }
              });
            },
            listOrders: function(session, options) {
              return $http.get("/stripeBackend/private/orders/listOrders/", {
                params: {
                  session: session,
                  options: options
                }
              });
            },
            payOrder: function(session, orderID, options) {
              return $http.get("/stripeBackend/private/orders/payOrder/", {
                params: {
                  session: session,
                  orderID: orderID,
                  options: options
                }
              });
            }
          }
        },
        public: {
          customers: {
            createCustomer: function(options) {
              return $http.get("/stripeBackend/public/customers/createCustomer/", {
                params: {
                  options: options
                }
              })
            }
          },
          orders: {
            updateOrder: function(orderID, options) {
              return $http.get("/stripeBackend/public/orders/updateOrder/", {
                params: {
                  orderID: orderID,
                  options: options
                }
              });
            }
          },
          products: {
            listProducts: function() {
              return $http.get("/stripeBackend/public/products/listProducts/");
            },
            retrieveProduct: function(productID) {
              return $http.get("/stripeBackend/public/products/retrieveProduct/", {
                params: {
                  productID: productID
                }
              });
            }
          },
          skus: {
            retrieveSKU: function(skuID) {
              return $http.get("/stripeBackend/public/skus/retrieveSKU/", {
                params: {
                  skuID: skuID
                }
              });
            }
          }
        }
      };
    }
  ])
;
