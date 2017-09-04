angular
  .module("plControllers")
  .controller("pageController_main", [
    "$mdMedia",
    "$mdSidenav",
    "$rootScope",
    "fxr",
    "PlausibleBackend",
    "StripeBackend",
    "$mdToast",
    "$scope",
    function($mdMedia, $mdSidenav, $rootScope, fxr, PlausibleBackend, StripeBackend, $mdToast, $scope) {
      this
        .moment = moment
      ;

      this
        .$mdMedia = $mdMedia
      ;
      this
        .$mdSidenav = $mdSidenav
      ;
      this
        .$rootScope = $rootScope
      ;

      $rootScope
        .settings = {
          currency: {}
        }
      ;

      if (typeof localStorage.selectedCurrencyID !== "undefined") {
        fxr
          .latest({
            base: "USD",
            symbols: localStorage.selectedCurrencyID
          })
          .then(function(res) {
            $rootScope
              .settings
              .currency
              .selected = {
                id: localStorage.selectedCurrencyID,
                value: res.data.rates[localStorage.selectedCurrencyID]
              }
            ;
          }, function(err) {
            $mdToast
              .show($mdToast.simple().textContent(err.data).position("bottom right"))
            ;
          })
        ;
      } else {
        $rootScope
          .settings
          .currency
          .selected = {
            id: "USD",
            value: 1
          }
        ;
      }

      fxr
        .latest({
          base: "USD",
          symbols: [
            "CAD",
            "GBP",
            "JPY",
            "EUR"
          ].join(",")
        })
        .then(function(res) {
          (function(optionsAssembly) {
            optionsAssembly
              .push({
                id: "USD",
                value: 1
              })
            ;

            for (index = 0; index < Object.entries(res.data.rates).length; index = index + 1) {
              (function(index) {
                optionsAssembly
                  .push({
                    id: Object.entries(res.data.rates)[index][0],
                    value: Object.entries(res.data.rates)[index][1]
                  })
                ;

                if ((index + 1) == Object.entries(res.data.rates).length) {
                  $rootScope
                    .settings
                    .currency
                    .options = optionsAssembly
                  ;
                }
              })(index);
            }
          })([]);
        }, function(err) {
          $mdToast
            .show($mdToast.simple().textContent(err.data).position("bottom right"))
          ;
        })
      ;

      if (typeof localStorage.session !== "undefined") {
        $rootScope
          .session = localStorage.session
        ;

        localStorage
          .session = $rootScope.session
        ;

        PlausibleBackend
          .private
          .getUserSelf($rootScope.session)
          .then(function(res) {
            $rootScope
              .account = res.data
            ;

            StripeBackend
              .private
              .customers
              .retrieveCustomer($rootScope.session)
              .then(function(res) {
                (function(customerObject) {
                  if (customerObject.sources.data.length > 0) {
                    for (index = 0; index < customerObject.sources.data.length; index = index + 1) {
                      (function(index) {
                        (function(sourceObject) {
                          customerObject
                            .sources
                            .data[index]
                            .delete = function() {
                              StripeBackend
                                .private
                                .customers
                                .deleteCard($rootScope.session, sourceObject.id)
                                .then(function(res) {
                                  $rootScope
                                    .account
                                    .stripeCustomerObject
                                    .sources
                                    .data
                                    .splice(index, 1)
                                  ;
                                }, function(err) {
                                  $mdToast
                                    .show($mdToast.simple().textContent(err.data.message + ((err.data.purge) ? (" You have been signed out.") : ("") )).position("bottom right"))
                                  ;

                                  if (err.data.purge) {
                                    delete $rootScope.session;

                                    delete localStorage.session;

                                    delete $rootScope.account;
                                  }
                                })
                              ;
                            }
                          ;

                          if ((index + 1) == customerObject.sources.data.length) {
                            $rootScope
                              .account
                              .stripeCustomerObject = customerObject
                            ;
                          }
                        })(customerObject.sources.data[index]);
                      })(index);
                    }
                  } else {
                    $rootScope
                      .account
                      .stripeCustomerObject = customerObject
                    ;
                  }
                })(res.data);
              }, function(err) {
                $mdToast
                  .show($mdToast.simple().textContent(err.data.message + ((err.data.purge) ? (" You have been signed out.") : ("") )).position("bottom right"))
                ;

                if (err.data.purge) {
                  delete $rootScope.session;

                  delete localStorage.session;

                  delete $rootScope.account;
                }
              })
            ;

            $mdToast
              .show($mdToast.simple().textContent("Welcome back, " + $rootScope.account.givenName + ". You're signed in.").position("bottom right"))
            ;
          }, function(err) {
            $mdToast
              .show($mdToast.simple().textContent(err.data.message + ((err.data.purge) ? (" You have been signed out.") : ("") )).position("bottom right"))
            ;

            if (err.data.purge) {
              delete $rootScope.session;

              delete localStorage.session;

              delete $rootScope.account;
            }
          })
        ;
      }

      if (typeof localStorage.shoppingCart !== "undefined") {
        (function(shoppingCartAssembly) {
          for (index = 0; index < JSON.parse(localStorage.shoppingCart).length; index = index + 1) {
            (function(index) {
              (function(skuObjectAndQuantity) {
                StripeBackend
                  .public
                  .skus
                  .retrieveSKU(skuObjectAndQuantity.skuID)
                  .then(function(res) {
                    (function(skuObject) {
                      StripeBackend
                        .public
                        .products
                        .retrieveProduct(skuObject.product)
                        .then(function(res) {
                          (function(productObject) {
                            productObject
                              .metadata = {
                                price: JSON.parse(productObject.metadata.price),
                                colors: JSON.parse(productObject.metadata.colors),
                                sizes: JSON.parse(productObject.metadata.sizes)
                              }
                            ;

                            skuObject
                              .productObject = productObject
                            ;

                            shoppingCartAssembly
                              .push({
                                skuObject: skuObject,
                                quantity: skuObjectAndQuantity.quantity,
                                addOne: function() {
                                  $rootScope
                                    .shoppingCart[index]
                                    .quantity = $rootScope.shoppingCart[index].quantity + 1
                                  ;

                                  (function(shoppingCartParsed) {
                                    shoppingCartParsed[index]
                                      .quantity = shoppingCartParsed[index].quantity + 1
                                    ;

                                    localStorage
                                      .shoppingCart = JSON.stringify(shoppingCartParsed)
                                    ;
                                  })(JSON.parse(localStorage.shoppingCart));
                                },
                                removeOne: function() {
                                  $rootScope
                                    .shoppingCart[index]
                                    .quantity = $rootScope.shoppingCart[index].quantity - 1
                                  ;

                                  (function(shoppingCartParsed) {
                                    shoppingCartParsed[index]
                                      .quantity = shoppingCartParsed[index].quantity - 1
                                    ;

                                    localStorage
                                      .shoppingCart = JSON.stringify(shoppingCartParsed)
                                    ;
                                  })(JSON.parse(localStorage.shoppingCart));
                                },
                                remove: function() {
                                  if ($rootScope.shoppingCart.length > 1) {
                                    $rootScope
                                      .shoppingCart
                                      .splice(index, 1)
                                    ;

                                    (function(shoppingCartParsed) {
                                      shoppingCartParsed
                                        .splice(index, 1)
                                      ;

                                      localStorage
                                        .shoppingCart = JSON.stringify(shoppingCartParsed)
                                      ;
                                    })(JSON.parse(localStorage.shoppingCart));
                                  } else {
                                    delete $rootScope.shoppingCart

                                    delete localStorage.shoppingCart
                                  }
                                }
                              })
                            ;

                            if ((index + 1) == JSON.parse(localStorage.shoppingCart).length) {
                              $rootScope
                                .shoppingCart = shoppingCartAssembly
                              ;
                            }
                          })(res.data);
                        }, function(err) {
                          $mdToast
                            .show($mdToast.simple().textContent(err.data.message).position("bottom right"))
                          ;
                        })
                      ;
                    })(res.data);
                  }, function(err) {
                    $mdToast
                      .show($mdToast.simple().textContent(err.data.message).position("bottom right"))
                    ;
                  })
                ;
              })(JSON.parse(localStorage.shoppingCart)[index]);
            })(index);
          }
        })([]);
      }
    }
  ])
  .controller("pageController_/root/", [
    function() {

    }
  ])
  .controller("pageController_/root/account/", [
    "$rootScope",
    "PlausibleBackend",
    "StripeBackend",
    "$mdToast",
    function($rootScope, PlausibleBackend, StripeBackend, $mdToast) {
      this
        .cards = [
          {
            loading: true,
            settings: {
              givenName: $rootScope.account.givenName,
              familyName: $rootScope.account.familyName,
              email: $rootScope.account.email,
              phoneNumber: $rootScope.account.phoneNumber,
              saveChanges: function() {
                if (this.cards[0].settings.givenName !== $rootScope.account.givenName) {
                  PlausibleBackend
                    .private
                    .updateUserSelf(localStorage.session, {
                      key: "givenName",
                      value: this.cards[0].settings.givenName
                    })
                    .then(function(res) {
                      PlausibleBackend
                        .private
                        .getUserSelf(localStorage.session)
                        .then(function(res) {
                          $rootScope
                            .account
                            .givenName = res.data.givenName
                          ;

                          if (this.cards[0].settings.familyName !== $rootScope.account.familyName) {
                            PlausibleBackend
                              .private
                              .updateUserSelf(localStorage.session, {
                                key: "familyName",
                                value: this.cards[0].settings.familyName
                              })
                              .then(function(res) {
                                PlausibleBackend
                                  .private
                                  .getUserSelf(localStorage.session)
                                  .then(function(res) {
                                    $rootScope
                                      .account
                                      .familyName = res.data.familyName
                                    ;
                                  }, function(err) {
                                    $mdToast
                                      .show($mdToast.simple().textContent(err.data.message + ((err.data.purge) ? (" You have been signed out.") : ("") )).position("bottom right"))
                                    ;

                                    if (err.data.purge) {
                                      delete $rootScope.session;

                                      delete localStorage.session;

                                      delete $rootScope.account;
                                    }
                                  })
                              }, function(err) {
                                $mdToast
                                  .show($mdToast.simple().textContent(err.data.message + ((err.data.purge) ? (" You have been signed out.") : ("") )).position("bottom right"))
                                ;

                                if (err.data.purge) {
                                  delete $rootScope.session;

                                  delete localStorage.session;

                                  delete $rootScope.account;
                                }
                              })
                            ;
                          }
                        }.bind(this), function(err) {
                          $mdToast
                            .show($mdToast.simple().textContent(err.data.message + ((err.data.purge) ? (" You have been signed out.") : ("") )).position("bottom right"))
                          ;

                          if (err.data.purge) {
                            delete $rootScope.session;

                            delete localStorage.session;

                            delete $rootScope.account;
                          }
                        })
                    }.bind(this), function(err) {
                      $mdToast
                        .show($mdToast.simple().textContent(err.data.message + ((err.data.purge) ? (" You have been signed out.") : ("") )).position("bottom right"))
                      ;

                      if (err.data.purge) {
                        delete $rootScope.session;

                        delete localStorage.session;

                        delete $rootScope.account;
                      }
                    })
                  ;
                } else {
                  if (this.cards[0].settings.familyName !== $rootScope.account.familyName) {
                    PlausibleBackend
                      .private
                      .updateUserSelf(localStorage.session, {
                        key: "familyName",
                        value: this.cards[0].settings.familyName
                      })
                      .then(function(res) {
                        PlausibleBackend
                          .private
                          .getUserSelf(localStorage.session)
                          .then(function(res) {
                            $rootScope
                              .account
                              .familyName = res.data.familyName
                            ;
                          }, function(err) {
                            $mdToast
                              .show($mdToast.simple().textContent(err.data.message + ((err.data.purge) ? (" You have been signed out.") : ("") )).position("bottom right"))
                            ;

                            if (err.data.purge) {
                              delete $rootScope.session;

                              delete localStorage.session;

                              delete $rootScope.account;
                            }
                          })
                      }, function(err) {
                        $mdToast
                          .show($mdToast.simple().textContent(err.data.message + ((err.data.purge) ? (" You have been signed out.") : ("") )).position("bottom right"))
                        ;

                        if (err.data.purge) {
                          delete $rootScope.session;

                          delete localStorage.session;

                          delete $rootScope.account;
                        }
                      })
                    ;
                  }
                }
              }.bind(this)
            }
          },
          {
            tabs: [
              {
                loading: true
              },
              {
                loading: true
              }
            ]
          },
          {
            loading: true
          }
        ]
      ;

      (function(stripeCustomerObjectAvailable) {
        if (typeof $rootScope.account.stripeCustomerObject !== "undefined") {
          stripeCustomerObjectAvailable();
        } else {
          $rootScope
            .$watch("account", function(account) {
              if (typeof account.stripeCustomerObject !== "undefined") {
                stripeCustomerObjectAvailable();
              }
            }, true)
          ;
        }
      })(function() {
        this
          .cards[0]
          .loading = false
        ;

        StripeBackend
          .private
          .orders
          .listOrders($rootScope.session, {
            customer: undefined,
            status: "paid"
          })
          .then(function(res) {
            (function(ordersList) {
              this
                .cards[1]
                .tabs[0]
                .ordersList = ordersList
              ;

              if (ordersList.length > 0) {
                for (index = 0; index < ordersList.length; index = index + 1) {
                  (function(index) {
                    (function(orderObject) {
                      for (index_secondary = 0; index_secondary < orderObject.items.length; index_secondary = index_secondary + 1) {
                        (function(index_secondary) {
                          (function(orderItemObject) {
                            if (orderItemObject.type == "sku") {
                              StripeBackend
                                .public
                                .skus
                                .retrieveSKU(orderItemObject.parent)
                                .then(function(res) {
                                  (function(skuObject) {
                                    this
                                      .cards[1]
                                      .tabs[0]
                                      .ordersList[index]
                                      .items[index_secondary]
                                      .parentSkuObject = skuObject
                                    ;

                                    StripeBackend
                                      .public
                                      .products
                                      .retrieveProduct(skuObject.product)
                                      .then(function(res) {
                                        (function(productObject) {
                                          this
                                            .cards[1]
                                            .tabs[0]
                                            .ordersList[index]
                                            .items[index_secondary]
                                            .parentSkuObject
                                            .productObject = productObject
                                          ;

                                          this
                                            .cards[1]
                                            .tabs[0]
                                            .loading = false
                                          ;
                                        }.bind(this))(res.data);
                                      }.bind(this), function(err) {
                                        this
                                          .cards[1]
                                          .tabs[0]
                                          .loading = false
                                        ;

                                        $mdToast
                                          .show($mdToast.simple().textContent(err.data.message).position("bottom right"))
                                        ;
                                      }.bind(this))
                                    ;
                                  }.bind(this))(res.data);
                                }.bind(this), function(err) {
                                  this
                                    .cards[1]
                                    .tabs[0]
                                    .loading = false
                                  ;

                                  $mdToast
                                    .show($mdToast.simple().textContent(err.data.message).position("bottom right"))
                                  ;
                                }.bind(this))
                              ;
                            }
                          }.bind(this))(orderObject.items[index_secondary]);
                        }.bind(this))(index_secondary);
                      }
                    }.bind(this))(ordersList[index]);
                  }.bind(this))(index);
                }
              } else {
                this
                  .cards[1]
                  .tabs[0]
                  .loading = false
                ;
              }
            }.bind(this))(res.data.data);
          }.bind(this), function(err) {
            this
              .cards[1]
              .tabs[0]
              .loading = false
            ;

            $mdToast
              .show($mdToast.simple().textContent(err.data.message + ((err.data.purge) ? (" You have been signed out.") : ("") )).position("bottom right"))
            ;

            if (err.data.purge) {
              delete $rootScope.session;

              delete localStorage.session;

              delete $rootScope.account;
            }
          }.bind(this))
        ;

        StripeBackend
          .private
          .orders
          .listOrders($rootScope.session, {
            customer: undefined,
            status: "fulfilled"
          })
          .then(function(res) {
            (function(ordersList) {
              this
                .cards[1]
                .tabs[1]
                .ordersList = ordersList
              ;

              if (ordersList.length > 0) {
                for (index = 0; index < ordersList.length; index = index + 1) {
                  (function(index) {
                    (function(orderObject) {
                      for (index_secondary = 0; index_secondary < orderObject.items.length; index_secondary = index_secondary + 1) {
                        (function(index_secondary) {
                          (function(orderItemObject) {
                            if (orderItemObject.type == "sku") {
                              StripeBackend
                                .public
                                .skus
                                .retrieveSKU(orderItemObject.parent)
                                .then(function(res) {
                                  (function(skuObject) {
                                    this
                                      .cards[1]
                                      .tabs[1]
                                      .ordersList[index]
                                      .items[index_secondary]
                                      .parentSkuObject = skuObject
                                    ;

                                    StripeBackend
                                      .public
                                      .products
                                      .retrieveProduct(skuObject.product)
                                      .then(function(res) {
                                        (function(productObject) {
                                          this
                                            .cards[1]
                                            .tabs[1]
                                            .ordersList[index]
                                            .items[index_secondary]
                                            .parentSkuObject
                                            .productObject = productObject
                                          ;

                                          this
                                            .cards[1]
                                            .tabs[1]
                                            .loading = false
                                          ;
                                        }.bind(this))(res.data);
                                      }.bind(this), function(err) {
                                        this
                                          .cards[1]
                                          .tabs[1]
                                          .loading = false
                                        ;

                                        $mdToast
                                          .show($mdToast.simple().textContent(err.data.message).position("bottom right"))
                                        ;
                                      }.bind(this))
                                    ;
                                  }.bind(this))(res.data);
                                }.bind(this), function(err) {
                                  this
                                    .cards[1]
                                    .tabs[1]
                                    .loading = false
                                  ;

                                  $mdToast
                                    .show($mdToast.simple().textContent(err.data.message).position("bottom right"))
                                  ;
                                }.bind(this))
                              ;
                            }
                          }.bind(this))(orderObject.items[index_secondary]);
                        }.bind(this))(index_secondary);
                      }
                    }.bind(this))(ordersList[index]);
                  }.bind(this))(index);
                }
              } else {
                this
                  .cards[1]
                  .tabs[1]
                  .loading = false
                ;
              }
            }.bind(this))(res.data.data);
          }.bind(this), function(err) {
            this
              .cards[1]
              .tabs[1]
              .loading = false
            ;

            $mdToast
              .show($mdToast.simple().textContent(err.data.message + ((err.data.purge) ? (" You have been signed out.") : ("") )).position("bottom right"))
            ;

            if (err.data.purge) {
              delete $rootScope.session;

              delete localStorage.session;

              delete $rootScope.account;
            }
          }.bind(this))
        ;

        this
          .cards[2]
          .loading = false
        ;
      }.bind(this));
    }
  ])
  .controller("pageController_/root/account/add-card/", [
    "$scope",
    "StripeBackend",
    "$rootScope",
    "PlausibleBackend",
    "$mdToast",
    "$location",
    function($scope, StripeBackend, $rootScope, PlausibleBackend, $mdToast, $location) {
      (function(stripe) {
        (function(elements) {
          (function(element) {
            element
              .mount("#addCard_one_pageElements_form_cardNumber")
            ;

            element
              .on("ready", function() {
                $scope
                  .$apply(function() {
                    this
                      .stages[0]
                      .form
                      .cardNumber
                      .loading = false
                    ;
                  }.bind(this))
                ;

                element
                  .on("focus", function() {
                    angular
                      .element(document.querySelector("#addCard_one_pageElements_form_cardNumber_label"))
                      .css("color", "rgb(17, 17, 17)")
                    ;

                    angular
                      .element(document.querySelector("#addCard_one_pageElements_form_cardNumber"))
                      .css({
                        "padding": "2px 2px 0",
                        "borderColor": "rgb(17, 17, 17)",
                        "borderWidth": "0 0 2px"
                      })
                    ;
                  })
                ;

                element
                  .on("blur", function() {
                    angular
                      .element(document.querySelector("#addCard_one_pageElements_form_cardNumber_label"))
                      .css("color", "rgba(0, 0, 0, 0.54)")
                    ;

                    angular
                      .element(document.querySelector("#addCard_one_pageElements_form_cardNumber"))
                      .css({
                        "padding": "2px 2px 1px",
                        "borderColor": "rgba(0, 0, 0, 0.12)",
                        "borderWidth": "0 0 1px"
                      })
                    ;
                  })
                ;
              }.bind(this))
            ;

            (function(scrollLeft) {
              angular
                .element(document.querySelector("#addCard_pageElements_scrollContainer"))
                .on("scroll", function(event) {
                  event
                    .preventDefault()
                  ;

                  angular
                    .element(document.querySelector("#addCard_pageElements_scrollContainer"))[0]
                    .scrollLeft = scrollLeft
                  ;
                })
              ;

              (function(ease) {
                (function(stage) {
                  this
                    .stages = [
                      {
                        form: {
                          cardNumber: {
                            loading: true,
                          },
                          cardExpiry: {
                            loading: true
                          },
                          cardCvc: {
                            loading: true
                          },
                          postalCode: {
                            loading: true
                          },
                          continue: function() {
                            this
                              .stages[1]
                              .loading = true
                            ;

                            stripe
                              .createToken(element)
                              .then(function(res) {
                                if (!res.error) {
                                  StripeBackend
                                    .private
                                    .customers
                                    .createSource($rootScope.session, {
                                      source: res.token.id
                                    })
                                    .then(function() {
                                      PlausibleBackend
                                        .private
                                        .getUserSelf($rootScope.session)
                                        .then(function(res) {
                                          $rootScope
                                            .account = res.data
                                          ;

                                          StripeBackend
                                            .private
                                            .customers
                                            .retrieveCustomer($rootScope.session)
                                            .then(function(res) {
                                              $rootScope
                                                .account
                                                .stripeCustomerObject = res.data
                                              ;

                                              this
                                                .stages[1]
                                                .loading = false
                                              ;

                                              stage = 1;

                                              ease(0, angular.element(document.querySelector("#addCard_pageElements_scrollContainer")).prop("offsetWidth"), function (x, t, b, c, d) { return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b; }, function(position) {
                                                scrollLeft = position;

                                                angular
                                                  .element(document.querySelector("#addCard_pageElements_scrollContainer"))[0]
                                                  .scrollLeft = scrollLeft
                                                ;
                                              }, 250);
                                            }.bind(this), function(err) {
                                              this
                                                .stages[1]
                                                .loading = false
                                              ;

                                              $mdToast
                                                .show($mdToast.simple().textContent(err.data.message + ((err.data.purge) ? (" You have been signed out.") : ("") )).position("bottom right"))
                                              ;

                                              if (err.data.purge) {
                                                delete $rootScope.session;

                                                delete localStorage.session;

                                                delete $rootScope.account;
                                              }
                                            }.bind(this))
                                          ;
                                        }.bind(this), function(err) {
                                          this
                                            .stages[1]
                                            .loading = false
                                          ;

                                          $mdToast
                                            .show($mdToast.simple().textContent(err.data.message + ((err.data.purge) ? (" You have been signed out.") : ("") )).position("bottom right"))
                                          ;

                                          if (err.data.purge) {
                                            delete $rootScope.session;

                                            delete localStorage.session;

                                            delete $rootScope.account;
                                          }
                                        }.bind(this))
                                      ;
                                    }.bind(this), function(err) {
                                      this
                                        .stages[1]
                                        .loading = false
                                      ;

                                      $mdToast
                                        .show($mdToast.simple().textContent(err.data.message + ((err.data.purge) ? (" You have been signed out.") : ("") )).position("bottom right"))
                                      ;

                                      if (err.data.purge) {
                                        delete $rootScope.session;

                                        delete localStorage.session;

                                        delete $rootScope.account;
                                      }
                                    }.bind(this))
                                  ;
                                } else {
                                  this
                                    .stages[1]
                                    .loading = false
                                  ;

                                  $mdToast
                                    .show($mdToast.simple().textContent(res.error.message).position("bottom right"))
                                  ;
                                }
                              }.bind(this))
                            ;
                          }.bind(this)
                        }
                      },
                      {
                        loading: false
                      }
                    ]
                  ;

                  ResizeSensor(angular.element(document.querySelector("#addCard_pageElements_scrollContainer")), function() {
                    scrollLeft = angular.element(document.querySelector("#addCard_pageElements_scrollContainer")).prop("offsetWidth") * stage;

                    angular
                      .element(document.querySelector("#addCard_pageElements_scrollContainer"))[0]
                      .scrollLeft = scrollLeft
                    ;
                  });
                }.bind(this))(0);
              }.bind(this))(function(start, finish, easing, callback, duration) {
                (function(millisecond, interval) {
                  interval = setInterval(function() {
                    if (millisecond < duration) {
                      callback(start + easing(0, millisecond, 0, finish - start, duration));

                      millisecond = millisecond + 1;
                    } else {
                      callback(finish);

                      clearInterval(interval);
                    }
                  }, 1);
                })(0);
              });
            }.bind(this))(0);
          }.bind(this))(elements.create("cardNumber", {
            style: {
              base: {
                fontFamily: '"Realtime"',
                fontSize: "16px",
                lineHeight: "26px",
                "::placeholder": {
                  color: "#FFFFFF"
                }
              }
            }
          }));

          (function(element) {
            element
              .mount("#addCard_one_pageElements_form_cardExpiry")
            ;

            element
              .on("ready", function() {
                $scope
                  .$apply(function() {
                    this
                      .stages[0]
                      .form
                      .cardExpiry
                      .loading = false
                    ;
                  }.bind(this))
                ;

                element
                  .on("focus", function() {
                    angular
                      .element(document.querySelector("#addCard_one_pageElements_form_cardExpiry_label"))
                      .css("color", "rgb(17, 17, 17)")
                    ;

                    angular
                      .element(document.querySelector("#addCard_one_pageElements_form_cardExpiry"))
                      .css({
                        "padding": "2px 2px 0",
                        "borderColor": "rgb(17, 17, 17)",
                        "borderWidth": "0 0 2px"
                      })
                    ;
                  })
                ;

                element
                  .on("blur", function() {
                    angular
                      .element(document.querySelector("#addCard_one_pageElements_form_cardExpiry_label"))
                      .css("color", "rgba(0, 0, 0, 0.54)")
                    ;

                    angular
                      .element(document.querySelector("#addCard_one_pageElements_form_cardExpiry"))
                      .css({
                        "padding": "2px 2px 1px",
                        "borderColor": "rgba(0, 0, 0, 0.12)",
                        "borderWidth": "0 0 1px"
                      })
                    ;
                  })
                ;
              }.bind(this))
            ;
          }.bind(this))(elements.create("cardExpiry", {
            style: {
              base: {
                fontFamily: '"Realtime"',
                fontSize: "16px",
                lineHeight: "26px",
                "::placeholder": {
                  color: "#FFFFFF"
                }
              }
            }
          }));

          (function(element) {
            element
              .mount("#addCard_one_pageElements_form_cardCvc")
            ;

            element
              .on("ready", function() {
                $scope
                  .$apply(function() {
                    this
                      .stages[0]
                      .form
                      .cardCvc
                      .loading = false
                    ;
                  }.bind(this))
                ;

                element
                  .on("focus", function() {
                    angular
                      .element(document.querySelector("#addCard_one_pageElements_form_cardCvc_label"))
                      .css("color", "rgb(17, 17, 17)")
                    ;

                    angular
                      .element(document.querySelector("#addCard_one_pageElements_form_cardCvc"))
                      .css({
                        "padding": "2px 2px 0",
                        "borderColor": "rgb(17, 17, 17)",
                        "borderWidth": "0 0 2px"
                      })
                    ;
                  })
                ;

                element
                  .on("blur", function() {
                    angular
                      .element(document.querySelector("#addCard_one_pageElements_form_cardCvc_label"))
                      .css("color", "rgba(0, 0, 0, 0.54)")
                    ;

                    angular
                      .element(document.querySelector("#addCard_one_pageElements_form_cardCvc"))
                      .css({
                        "padding": "2px 2px 1px",
                        "borderColor": "rgba(0, 0, 0, 0.12)",
                        "borderWidth": "0 0 1px"
                      })
                    ;
                  })
                ;
              }.bind(this))
            ;
          }.bind(this))(elements.create("cardCvc", {
            style: {
              base: {
                fontFamily: '"Realtime"',
                fontSize: "16px",
                lineHeight: "26px",
                "::placeholder": {
                  color: "#FFFFFF"
                }
              }
            }
          }));

          (function(element) {
            element
              .mount("#addCard_one_pageElements_form_postalCode")
            ;

            element
              .on("ready", function() {
                $scope
                  .$apply(function() {
                    this
                      .stages[0]
                      .form
                      .postalCode
                      .loading = false
                    ;
                  }.bind(this))
                ;

                element
                  .on("focus", function() {
                    angular
                      .element(document.querySelector("#addCard_one_pageElements_form_postalCode_label"))
                      .css("color", "rgb(17, 17, 17)")
                    ;

                    angular
                      .element(document.querySelector("#addCard_one_pageElements_form_postalCode"))
                      .css({
                        "padding": "2px 2px 0",
                        "borderColor": "rgb(17, 17, 17)",
                        "borderWidth": "0 0 2px"
                      })
                    ;
                  })
                ;

                element
                  .on("blur", function() {
                    angular
                      .element(document.querySelector("#addCard_one_pageElements_form_postalCode_label"))
                      .css("color", "rgba(0, 0, 0, 0.54)")
                    ;

                    angular
                      .element(document.querySelector("#addCard_one_pageElements_form_postalCode"))
                      .css({
                        "padding": "2px 2px 1px",
                        "borderColor": "rgba(0, 0, 0, 0.12)",
                        "borderWidth": "0 0 1px"
                      })
                    ;
                  })
                ;
              }.bind(this))
            ;
          }.bind(this))(elements.create("postalCode", {
            style: {
              base: {
                fontFamily: '"Realtime"',
                fontSize: "16px",
                lineHeight: "26px",
                "::placeholder": {
                  color: "#FFFFFF"
                }
              }
            }
          }));
        }.bind(this))(stripe.elements({
          fonts: [
            {
              family: '"Roboto"',
              src: 'url("https://fonts.gstatic.com/s/roboto/v16/Ks_cVxiCiwUWVsFWFA3Bjn-_kf6ByYO6CLYdB4HQE-Y.woff2")'
            },
            {
              family: '"Realtime"',
              src: "url(https://ke-hy.com:20443/APP/FONTS/REALTIME/400/_.eot?#iefix) format('embedded-opentype'), url(https://ke-hy.com:20443/APP/FONTS/REALTIME/400/_.woff) format('woff'), url(https://ke-hy.com:20443/APP/FONTS/REALTIME/400/_.woff2) format('woff2'), url(https://ke-hy.com:20443/APP/FONTS/REALTIME/400/_.ttf) format('truetype')"
            }
          ]
        }));
      }.bind(this))(Stripe("pk_test_RbAQnT04ryPARxMExch3JARG"));
    }
  ])
  .controller("pageController_/root/legal/", [
    function() {

    }
  ])
  .controller("pageController_/root/legal/terms-of-service/", [
    function() {

    }
  ])
  .controller("pageController_/root/legal/payment-system-information/", [
    function() {

    }
  ])
  .controller("pageController_/root/products/", [
    "StripeBackend",
    "$timeout",
    "$mdToast",
    function(StripeBackend, $timeout, $mdToast) {
      this
        .loading = true
      ;

      StripeBackend
        .public
        .products
        .listProducts()
        .then(function(res) {
          (function(productsList) {
            for (index = 0; index < productsList.data.length; index = index + 1) {
              (function(index) {
                (function(productObject) {
                  productsList
                    .data[index]
                    .metadata = {
                      price: JSON.parse(productObject.metadata.price),
                      colors: JSON.parse(productObject.metadata.colors),
                      sizes: JSON.parse(productObject.metadata.sizes)
                    }
                  ;

                  if ((index + 1) == productsList.data.length) {
                    this
                      .productsList = productsList.data
                    ;

                    this
                      .loading = false
                    ;

                    $timeout(function() {
                      (new Flickity(document.querySelector("#products_pageElements_carousel_" + productObject.id), {
                        cellSelector: ".carousel_cell",
                        setGallerySize: false,
                        freeScroll: true,
                        wrapAround: true,
                        autoPlay: true,
                        prevNextButtons: false,
                        pageDots: false
                      }));
                    });
                  }
                }.bind(this))(productsList.data[index]);
              }.bind(this))(index);
            }
          }.bind(this))(res.data);
        }.bind(this), function(err) {
          $mdToast
            .show($mdToast.simple().textContent(err.data.message).position("bottom right"))
          ;
        })
      ;
    }
  ])
  .controller("pageController_/root/products/product/", [
    "StripeBackend",
    "$routeParams",
    "$timeout",
    "$mdToast",
    "$rootScope",
    "$scope",
    function(StripeBackend, $routeParams, $timeout, $mdToast, $rootScope, $scope) {
      this
        .loading = true
      ;

      StripeBackend
        .public
        .products
        .retrieveProduct("prod_" + $routeParams.productID)
        .then(function(res) {
          (function(productObject) {
            productObject
              .metadata = {
                price: JSON.parse(productObject.metadata.price),
                colors: JSON.parse(productObject.metadata.colors),
                sizes: JSON.parse(productObject.metadata.sizes)
              }
            ;

            productObject
              .addToShoppingCart = function() {
                (function(process) {
                  (function(skuIDAssembly) {
                    skuIDAssembly = skuIDAssembly + this.productObject.id.replace("prod_", "") + "_" + this.selectedColor + "_";

                    if (this.selectedSize.indexOf(" ") >= 0) {
                      for (index = 0; index < this.selectedSize.split(" ").length; index = index + 1) {
                        (function(index) {
                          (function(substring) {
                            if (index == 0) {
                              skuIDAssembly = skuIDAssembly + substring;
                            } else {
                              skuIDAssembly = skuIDAssembly + substring.charAt(0).toUpperCase() + substring.slice(1);
                            }

                            if ((index + 1) == this.selectedSize.split(" ").length) {
                              process(skuIDAssembly);
                            }
                          }.bind(this))(this.selectedSize.split(" ")[index]);
                        }.bind(this))(index);
                      }
                    } else {
                      skuIDAssembly = skuIDAssembly + this.selectedSize;

                      process(skuIDAssembly);
                    }
                  }.bind(this))("sku_");
                }.bind(this))(function(skuID) {
                  for (index = 0; index < this.productObject.skus.data.length; index = index + 1) {
                    (function(index) {
                      (function(skuObject) {
                        if (skuID == skuObject.id) {
                          skuObject
                            .productObject = this.productObject
                          ;

                          if (typeof $rootScope.shoppingCart !== "undefined") {
                            if (typeof $rootScope.shoppingCart.find(function(skuObjectAndQuantity) { if (skuID == skuObjectAndQuantity.skuObject.id) { return true; } else { return false; } }) !== "undefined") {
                              for (index_secondary = 0; index_secondary < $rootScope.shoppingCart.length; index_secondary = index_secondary + 1) {
                                (function(index_secondary) {
                                  (function(skuObjectAndQuantity) {
                                    if (skuID == skuObjectAndQuantity.skuObject.id) {
                                      $rootScope
                                        .shoppingCart[index_secondary]
                                        .quantity = $rootScope.shoppingCart[index_secondary].quantity + 1
                                      ;

                                      (function(shoppingCartParsed) {
                                        shoppingCartParsed[index_secondary]
                                          .quantity = shoppingCartParsed[index_secondary].quantity + 1
                                        ;

                                        localStorage
                                          .shoppingCart = JSON.stringify(shoppingCartParsed)
                                        ;
                                      })(JSON.parse(localStorage.shoppingCart));
                                    }
                                  })($rootScope.shoppingCart[index_secondary]);
                                })(index_secondary);
                              }
                            } else {
                              (function(index) {
                                $rootScope
                                  .shoppingCart
                                  .push({
                                    skuObject: skuObject,
                                    quantity: 1,
                                    addOne: function() {
                                      $rootScope
                                        .shoppingCart[index]
                                        .quantity = $rootScope.shoppingCart[index].quantity + 1
                                      ;

                                      (function(shoppingCartParsed) {
                                        shoppingCartParsed[index]
                                          .quantity = shoppingCartParsed[index].quantity + 1
                                        ;

                                        localStorage
                                          .shoppingCart = JSON.stringify(shoppingCartParsed)
                                        ;
                                      })(JSON.parse(localStorage.shoppingCart));
                                    },
                                    removeOne: function() {
                                      $rootScope
                                        .shoppingCart[index]
                                        .quantity = $rootScope.shoppingCart[index].quantity - 1
                                      ;

                                      (function(shoppingCartParsed) {
                                        shoppingCartParsed[index]
                                          .quantity = shoppingCartParsed[index].quantity - 1
                                        ;

                                        localStorage
                                          .shoppingCart = JSON.stringify(shoppingCartParsed)
                                        ;
                                      })(JSON.parse(localStorage.shoppingCart));
                                    },
                                    remove: function() {
                                      if ($rootScope.shoppingCart.length > 1) {
                                        $rootScope
                                          .shoppingCart
                                          .splice(index, 1)
                                        ;

                                        (function(shoppingCartParsed) {
                                          shoppingCartParsed
                                            .splice(index, 1)
                                          ;

                                          localStorage
                                            .shoppingCart = JSON.stringify(shoppingCartParsed)
                                          ;
                                        })(JSON.parse(localStorage.shoppingCart));
                                      } else {
                                        delete $rootScope.shoppingCart

                                        delete localStorage.shoppingCart
                                      }
                                    }
                                  })
                                ;
                              }.bind(this))($rootScope.shoppingCart.length);

                              (function(shoppingCartParsed) {
                                shoppingCartParsed
                                  .push({
                                    skuID: skuObject.id,
                                    quantity: 1
                                  })
                                ;

                                localStorage
                                  .shoppingCart = JSON.stringify(shoppingCartParsed)
                                ;
                              }.bind(this))(JSON.parse(localStorage.shoppingCart));
                            }
                          } else {
                            $rootScope
                              .shoppingCart = [
                                {
                                  skuObject: skuObject,
                                  quantity: 1,
                                  addOne: function() {
                                    $rootScope
                                      .shoppingCart[0]
                                      .quantity = $rootScope.shoppingCart[0].quantity + 1
                                    ;

                                    (function(shoppingCartParsed) {
                                      shoppingCartParsed[0]
                                        .quantity = shoppingCartParsed[0].quantity + 1
                                      ;

                                      localStorage
                                        .shoppingCart = JSON.stringify(shoppingCartParsed)
                                      ;
                                    })(JSON.parse(localStorage.shoppingCart));
                                  },
                                  removeOne: function() {
                                    $rootScope
                                      .shoppingCart[0]
                                      .quantity = $rootScope.shoppingCart[0].quantity - 1
                                    ;

                                    (function(shoppingCartParsed) {
                                      shoppingCartParsed[0]
                                        .quantity = shoppingCartParsed[0].quantity - 1
                                      ;

                                      localStorage
                                        .shoppingCart = JSON.stringify(shoppingCartParsed)
                                      ;
                                    })(JSON.parse(localStorage.shoppingCart));
                                  },
                                  remove: function() {
                                    if ($rootScope.shoppingCart.length > 1) {
                                      $rootScope
                                        .shoppingCart
                                        .splice(0, 1)
                                      ;

                                      (function(shoppingCartParsed) {
                                        shoppingCartParsed
                                          .splice(0, 1)
                                        ;

                                        localStorage
                                          .shoppingCart = JSON.stringify(shoppingCartParsed)
                                        ;
                                      })(JSON.parse(localStorage.shoppingCart));
                                    } else {
                                      delete $rootScope.shoppingCart

                                      delete localStorage.shoppingCart
                                    }
                                  }
                                }
                              ]
                            ;

                            localStorage
                              .shoppingCart = JSON.stringify([
                                {
                                  skuID: skuObject.id,
                                  quantity: 1
                                }
                              ])
                            ;
                          }
                        }
                      }.bind(this))(this.productObject.skus.data[index]);
                    }.bind(this))(index);
                  }
                }.bind(this));
              }.bind(this)
            ;

            productObject
              .updateAvailability = function() {
                if (typeof this.selectedSize !== "undefined" && this.selectedSize !== "") {
                  (function(process) {
                    (function(skuIDAssembly) {
                      skuIDAssembly = skuIDAssembly + this.productObject.id.replace("prod_", "") + "_" + this.selectedColor + "_";

                      if (this.selectedSize.indexOf(" ") >= 0) {
                        for (index = 0; index < this.selectedSize.split(" ").length; index = index + 1) {
                          (function(index) {
                            (function(substring) {
                              if (index == 0) {
                                skuIDAssembly = skuIDAssembly + substring;
                              } else {
                                skuIDAssembly = skuIDAssembly + substring.charAt(0).toUpperCase() + substring.slice(1);
                              }

                              if ((index + 1) == this.selectedSize.split(" ").length) {
                                process(skuIDAssembly);
                              }
                            }.bind(this))(this.selectedSize.split(" ")[index]);
                          }.bind(this))(index);
                        }
                      } else {
                        skuIDAssembly = skuIDAssembly + this.selectedSize;

                        process(skuIDAssembly);
                      }
                    }.bind(this))("sku_");
                  }.bind(this))(function(skuID) {
                    for (index = 0; index < this.productObject.skus.data.length; index = index + 1) {
                      (function(index) {
                        (function(skuObject) {
                          if (skuID == skuObject.id) {
                            this
                              .availability = skuObject.inventory.quantity
                            ;
                          }
                        }.bind(this))(this.productObject.skus.data[index]);
                      }.bind(this))(index);
                    }
                  }.bind(this));
                }
              }.bind(this)
            ;

            this
              .productObject = productObject
            ;

            this
              .loading = false
            ;

            this
              .selectedColor = this.productObject.metadata.colors[0]
            ;

            $timeout(function() {
              (new Flickity(document.querySelector("#product_pageElements_carousel_" + this.productObject.id), {
                cellSelector: ".carousel_cell",
                setGallerySize: false,
                freeScroll: true,
                wrapAround: true,
                autoPlay: true,
                prevNextButtons: false,
                pageDots: false
              }));
            }.bind(this));
          }.bind(this))(res.data);
        }.bind(this), function(err) {
          $mdToast
            .show($mdToast.simple().textContent(err.data).position("bottom right"))
          ;
        })
      ;
    }
  ])
  .controller("pageController_/root/purchase/", [
    "$rootScope",
    "StripeBackend",
    "$mdToast",
    function($rootScope, StripeBackend, $mdToast) {
      (function(scrollLeft) {
        angular
          .element(document.querySelector("#purchase_pageElements_scrollContainer"))
          .on("scroll", function(event) {
            event
              .preventDefault()
            ;

            angular
              .element(document.querySelector("#purchase_pageElements_scrollContainer"))[0]
              .scrollLeft = scrollLeft
            ;
          })
        ;

        (function(ease) {
          (function(accountAvailable) {
            if (typeof $rootScope.account !== "undefined") {
              accountAvailable();
            } else {
              $rootScope
                .$watch("account", function(account) {
                  if (typeof account !== "undefined") {
                    accountAvailable();
                  }
                })
              ;
            }
          })(function() {
            (function(stage) {
              this
                .stages = [
                  {
                    form: {
                      name: $rootScope.account.givenName + " " + $rootScope.account.familyName,
                      streetAddress: $rootScope.account.streetAddress,
                      city: $rootScope.account.city,
                      state: $rootScope.account.state,
                      postalCode: $rootScope.account.postalCode,
                      continue: function() {
                        this
                          .stages[1]
                          .loading = true
                        ;

                        (function(itemsAssembly) {
                          for (index = 0; index < $rootScope.shoppingCart.length; index = index + 1) {
                            (function(index) {
                              (function(skuObjectAndQuantity) {
                                itemsAssembly
                                  .push({
                                    type: "sku",
                                    parent: skuObjectAndQuantity.skuObject.id,
                                    quantity: skuObjectAndQuantity.quantity
                                  })
                                ;

                                if ((index + 1) == $rootScope.shoppingCart.length) {
                                  StripeBackend
                                    .private
                                    .orders
                                    .createOrder($rootScope.session, {
                                      currency: 'usd',
                                      customer: undefined,
                                      items: itemsAssembly,
                                      shipping: {
                                        address: {
                                          line1: this.stages[0].form.streetAddress,
                                          city: this.stages[0].form.city,
                                          country: "US",
                                          postal_code: this.stages[0].form.postalCode,
                                          state: this.stages[0].form.state
                                        },
                                        name: this.stages[0].form.name
                                      }
                                    })
                                    .then(function(res) {
                                      this
                                        .stages[1]
                                        .orderObject = res.data
                                      ;

                                      this
                                        .stages[1]
                                        .form
                                        .shippingMethod = this.stages[1].orderObject.shipping_methods[this.stages[1].orderObject.shipping_methods.length - 1]
                                      ;

                                      this
                                        .stages[1]
                                        .loading = false
                                      ;

                                      stage = 1;

                                      ease(0, angular.element(document.querySelector("#purchase_pageElements_scrollContainer")).prop("offsetWidth"), function (x, t, b, c, d) { return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b; }, function(position) {
                                        scrollLeft = position;

                                        angular
                                          .element(document.querySelector("#purchase_pageElements_scrollContainer"))[0]
                                          .scrollLeft = scrollLeft
                                        ;
                                      }, 250);
                                    }.bind(this), function(err) {
                                      this
                                        .stages[1]
                                        .loading = false
                                      ;

                                      $mdToast
                                        .show($mdToast.simple().textContent(err.data.message + ((err.data.purge) ? (" You have been signed out.") : ("") )).position("bottom right"))
                                      ;

                                      if (err.data.purge) {
                                        delete $rootScope.session;

                                        delete localStorage.session;

                                        delete $rootScope.account;
                                      }
                                    }.bind(this))
                                  ;
                                }
                              }.bind(this))($rootScope.shoppingCart[index]);
                            }.bind(this))(index);
                          }
                        }.bind(this))([]);
                      }.bind(this)
                    }
                  },
                  {
                    loading: false,
                    form: {
                      selectedShippingMethod: undefined,
                      continue: function() {
                        this
                          .stages[2]
                          .loading = true
                        ;

                        StripeBackend
                          .public
                          .orders
                          .updateOrder(this.stages[1].orderObject.id, {
                            selected_shipping_method: this.stages[1].form.selectedShippingMethod.id
                          })
                          .then(function(res) {
                            this
                              .stages[2]
                              .orderObject = res.data
                            ;

                            this
                              .stages[2]
                              .loading = false
                            ;

                            stage = 2;

                            ease(angular.element(document.querySelector("#purchase_pageElements_scrollContainer")).prop("offsetWidth"), angular.element(document.querySelector("#purchase_pageElements_scrollContainer")).prop("offsetWidth") * 2, function (x, t, b, c, d) { return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b; }, function(position) {
                              scrollLeft = position;

                              angular
                                .element(document.querySelector("#purchase_pageElements_scrollContainer"))[0]
                                .scrollLeft = scrollLeft
                              ;
                            }, 250);
                          }.bind(this), function(err) {
                            this
                              .stages[2]
                              .loading = false
                            ;

                            $mdToast
                              .show($mdToast.simple().textContent(err.data.message).position("bottom right"))
                            ;
                          })
                        ;
                      }.bind(this),
                      back: function() {
                        this
                          .stages[2]
                          .loading = true
                        ;

                        StripeBackend
                          .public
                          .orders
                          .updateOrder(this.stages[1].orderObject.id, {
                            status: "canceled"
                          })
                          .then(function() {
                            this
                              .stages[2]
                              .loading = false
                            ;

                            stage = 0;

                            ease(angular.element(document.querySelector("#purchase_pageElements_scrollContainer")).prop("offsetWidth"), 0, function (x, t, b, c, d) { return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b; }, function(position) {
                              scrollLeft = position;

                              angular
                                .element(document.querySelector("#purchase_pageElements_scrollContainer"))[0]
                                .scrollLeft = scrollLeft
                              ;
                            }, 250);
                          }.bind(this), function(err) {
                            this
                              .stages[2]
                              .loading = false
                            ;

                            $mdToast
                              .show($mdToast.simple().textContent(err.data.message).position("bottom right"))
                            ;
                          }.bind(this))
                        ;
                      }.bind(this)
                    }
                  },
                  {
                    loading: false,
                    form: {
                      selectedCard: undefined,
                      termsOfService: false,
                      continue: function() {
                        if (this.stages[2].form.termsOfService) {
                          this
                            .stages[3]
                            .loading = true
                          ;

                          StripeBackend
                            .private
                            .orders
                            .payOrder($rootScope.session, this.stages[2].orderObject.id, {
                              customer: undefined,
                              source: this.stages[2].form.selectedCard.id,
                              email: $rootScope.account.email
                            })
                            .then(function(res) {
                              delete $rootScope.shoppingCart;

                              delete localStorage.shoppingCart;

                              this
                                .stages[3]
                                .loading = false
                              ;

                              stage = 3;

                              ease(angular.element(document.querySelector("#purchase_pageElements_scrollContainer")).prop("offsetWidth") * 2, angular.element(document.querySelector("#purchase_pageElements_scrollContainer")).prop("offsetWidth") * 3, function (x, t, b, c, d) { return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b; }, function(position) {
                                scrollLeft = position;

                                angular
                                  .element(document.querySelector("#purchase_pageElements_scrollContainer"))[0]
                                  .scrollLeft = scrollLeft
                                ;
                              }, 250);
                            }.bind(this), function(err) {
                              this
                                .stages[3]
                                .loading = false
                              ;

                              $mdToast
                                .show($mdToast.simple().textContent(err.data.message + ((err.data.purge) ? (" You have been signed out.") : ("") )).position("bottom right"))
                              ;

                              if (err.data.purge) {
                                delete $rootScope.session;

                                delete localStorage.session;

                                delete $rootScope.account;
                              }
                            }.bind(this))
                          ;
                        } else {
                          $mdToast
                            .show($mdToast.simple().textContent("You must accept the terms of service before your order can be paid.").position("bottom right"))
                          ;
                        }
                      }.bind(this),
                      back: function() {
                        stage = 1;

                        ease(angular.element(document.querySelector("#purchase_pageElements_scrollContainer")).prop("offsetWidth") * 2, angular.element(document.querySelector("#purchase_pageElements_scrollContainer")).prop("offsetWidth"), function (x, t, b, c, d) { return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b; }, function(position) {
                          scrollLeft = position;

                          angular
                            .element(document.querySelector("#purchase_pageElements_scrollContainer"))[0]
                            .scrollLeft = scrollLeft
                          ;
                        }, 250);
                      }.bind(this)
                    }
                  },
                  {
                    loading: false
                  }
                ]
              ;

              ResizeSensor(angular.element(document.querySelector("#purchase_pageElements_scrollContainer")), function() {
                scrollLeft = angular.element(document.querySelector("#purchase_pageElements_scrollContainer")).prop("offsetWidth") * stage;

                angular
                  .element(document.querySelector("#purchase_pageElements_scrollContainer"))[0]
                  .scrollLeft = scrollLeft
                ;
              });
            }.bind(this))(0);
          }.bind(this));
        }.bind(this))(function(start, finish, easing, callback, duration) {
          (function(millisecond, interval) {
            interval = setInterval(function() {
              if (millisecond < duration) {
                callback(start + easing(0, millisecond, 0, finish - start, duration));

                millisecond = millisecond + 1;
              } else {
                callback(finish);

                clearInterval(interval);
              }
            }, 1);
          })(0);
        });
      }.bind(this))(0);
    }
  ])
  .controller("pageController_/root/settings/", [
    "$rootScope",
    function($rootScope) {
      this
        .settings = {
          currency: {
            saveChanges: function() {
              if ($rootScope.settings.currency.selected.id !== "USD") {
                localStorage
                  .selectedCurrencyID = $rootScope.settings.currency.selected.id
                ;
              } else {
                if (typeof localStorage.selectedCurrencyID !== "undefined") {
                  delete localStorage.selectedCurrencyID;
                }
              }
            }
          }
        }
      ;
    }
  ])
  .controller("pageController_/root/shopping-cart/", [
    "$rootScope",
    function($rootScope) {
      $rootScope
        .$watch("shoppingCart", function(shoppingCart) {
          if (typeof shoppingCart !== "undefined") {
            this
              .merchandise = 0
            ;

            for (index = 0; index < shoppingCart.length; index = index + 1) {
              (function(skuProductAndQuantity) {
                this
                  .merchandise = this.merchandise + (skuProductAndQuantity.skuObject.price * skuProductAndQuantity.quantity)
                ;
              }.bind(this))(shoppingCart[index]);
            }
          }
        }.bind(this), true)
      ;
    }
  ])
  .controller("pageController_/root/sign-in/", [
    "PlausibleBackend",
    "$rootScope",
    "StripeBackend",
    "$mdToast",
    "$location",
    function(PlausibleBackend, $rootScope, StripeBackend, $mdToast, $location) {
      (function(scrollLeft) {
        angular
          .element(document.querySelector("#signIn_pageElements_scrollContainer"))
          .on("scroll", function(event) {
            event
              .preventDefault()
            ;

            angular
              .element(document.querySelector("#signIn_pageElements_scrollContainer"))[0]
              .scrollLeft = scrollLeft
            ;
          })
        ;

        (function(ease) {
          (function(stage) {
            this
              .stages = [
                {
                  form: {
                    email: undefined,
                    continue: function() {
                      PlausibleBackend
                        .public
                        .getUserByEmail({
                          email: this.stages[0].form.email
                        })
                        .then(function(res) {
                          this
                            .stages[1]
                            .userObject = res.data
                          ;

                          stage = 1;

                          ease(0, angular.element(document.querySelector("#signIn_pageElements_scrollContainer")).prop("offsetWidth"), function (x, t, b, c, d) { return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b; }, function(position) {
                            scrollLeft = position;

                            angular
                              .element(document.querySelector("#signIn_pageElements_scrollContainer"))[0]
                              .scrollLeft = scrollLeft
                            ;
                          }, 250);
                        }.bind(this), function(err) {
                          $mdToast
                            .show($mdToast.simple().textContent(err.data).position("bottom right"))
                          ;
                        })
                      ;
                    }.bind(this)
                  }
                },
                {
                  form: {
                    password: undefined,
                    continue: function() {
                      PlausibleBackend
                        .public
                        .createSession({
                          email: this.stages[1].userObject.email,
                          password: this.stages[1].form.password
                        })
                        .then(function(res) {
                          $rootScope
                            .session = res.data
                          ;

                          localStorage
                            .session = $rootScope.session
                          ;

                          PlausibleBackend
                            .private
                            .getUserSelf($rootScope.session)
                            .then(function(res) {
                              $rootScope
                                .account = res.data
                              ;

                              StripeBackend
                                .private
                                .customers
                                .retrieveCustomer($rootScope.session)
                                .then(function(res) {
                                  (function(customerObject) {
                                    if (customerObject.sources.data.length > 0) {
                                      for (index = 0; index < customerObject.sources.data.length; index = index + 1) {
                                        (function(index) {
                                          (function(sourceObject) {
                                            customerObject
                                              .sources
                                              .data[index]
                                              .delete = function() {
                                                StripeBackend
                                                  .private
                                                  .customers
                                                  .deleteCard($rootScope.session, sourceObject.id)
                                                  .then(function(res) {
                                                    $rootScope
                                                      .account
                                                      .stripeCustomerObject
                                                      .sources
                                                      .data
                                                      .splice(index, 1)
                                                    ;
                                                  }, function(err) {
                                                    $mdToast
                                                      .show($mdToast.simple().textContent(err.data.message + ((err.data.purge) ? (" You have been signed out.") : ("") )).position("bottom right"))
                                                    ;

                                                    if (err.data.purge) {
                                                      delete $rootScope.session;

                                                      delete localStorage.session;

                                                      delete $rootScope.account;
                                                    }
                                                  })
                                                ;
                                              }
                                            ;

                                            if ((index + 1) == customerObject.sources.data.length) {
                                              $rootScope
                                                .account
                                                .stripeCustomerObject = customerObject
                                              ;

                                              stage = 2;

                                              ease(angular.element(document.querySelector("#signIn_pageElements_scrollContainer")).prop("offsetWidth"), angular.element(document.querySelector("#signIn_pageElements_scrollContainer")).prop("offsetWidth") * 2, function (x, t, b, c, d) { return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b; }, function(position) {
                                                scrollLeft = position;

                                                angular
                                                  .element(document.querySelector("#signIn_pageElements_scrollContainer"))[0]
                                                  .scrollLeft = scrollLeft
                                                ;
                                              }, 250);
                                            }
                                          }.bind(this))(customerObject.sources.data[index]);
                                        }.bind(this))(index);
                                      }
                                    } else {
                                      $rootScope
                                        .account
                                        .stripeCustomerObject = customerObject
                                      ;

                                      stage = 2;

                                      ease(angular.element(document.querySelector("#signIn_pageElements_scrollContainer")).prop("offsetWidth"), angular.element(document.querySelector("#signIn_pageElements_scrollContainer")).prop("offsetWidth") * 2, function (x, t, b, c, d) { return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b; }, function(position) {
                                        scrollLeft = position;

                                        angular
                                          .element(document.querySelector("#signIn_pageElements_scrollContainer"))[0]
                                          .scrollLeft = scrollLeft
                                        ;
                                      }, 250);
                                    }
                                  }.bind(this))(res.data);
                                }.bind(this), function(err) {
                                  $mdToast
                                    .show($mdToast.simple().textContent(err.data).position("bottom right"))
                                  ;
                                })
                              ;
                            }.bind(this), function(err) {
                              $mdToast
                                .show($mdToast.simple().textContent(err.data.message + ((err.data.purge) ? (" You have been signed out.") : ("") )).position("bottom right"))
                              ;

                              if (err.data.purge) {
                                delete $rootScope.session;

                                delete localStorage.session;

                                delete $rootScope.account;
                              }
                            })
                          ;
                        }.bind(this), function(err) {
                          $mdToast
                            .show($mdToast.simple().textContent(err.data).position("bottom right"))
                          ;
                        })
                      ;
                    }.bind(this),
                    back: function() {
                      stage = 0;

                      ease(angular.element(document.querySelector("#signIn_pageElements_scrollContainer")).prop("offsetWidth"), 0, function (x, t, b, c, d) { return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b; }, function(position) {
                        scrollLeft = position;

                        angular
                          .element(document.querySelector("#signIn_pageElements_scrollContainer"))[0]
                          .scrollLeft = scrollLeft
                        ;
                      }, 250);
                    }.bind(this)
                  }
                }
              ]
            ;

            ResizeSensor(angular.element(document.querySelector("#signIn_pageElements_scrollContainer")), function() {
              scrollLeft = angular.element(document.querySelector("#signIn_pageElements_scrollContainer")).prop("offsetWidth") * stage;

              angular
                .element(document.querySelector("#signIn_pageElements_scrollContainer"))[0]
                .scrollLeft = scrollLeft
              ;
            });
          }.bind(this))(0);
        }.bind(this))(function(start, finish, easing, callback, duration) {
          (function(millisecond, interval) {
            interval = setInterval(function() {
              if (millisecond < duration) {
                callback(start + easing(0, millisecond, 0, finish - start, duration));

                millisecond = millisecond + 1;
              } else {
                callback(finish);

                clearInterval(interval);
              }
            }, 1);
          })(0);
        });
      }.bind(this))(0);
    }
  ])
  .controller("pageController_/root/sign-out/", [
    "$rootScope",
    "PlausibleBackend",
    "$mdToast",
    function($rootScope, PlausibleBackend, $mdToast) {
      (function(scrollLeft) {
        angular
          .element(document.querySelector("#signOut_pageElements_scrollContainer"))
          .on("scroll", function(event) {
            event
              .preventDefault()
            ;

            angular
              .element(document.querySelector("#signOut_pageElements_scrollContainer"))[0]
              .scrollLeft = scrollLeft
            ;
          })
        ;

        (function(ease) {
          (function(stage) {
            this
              .stages = [
                {
                  form: {
                    session: $rootScope.session,
                    continue: function() {
                      PlausibleBackend
                        .private
                        .deleteThisSession(this.stages[0].form.session)
                        .then(function() {
                          delete $rootScope.session;

                          delete localStorage.session;

                          delete $rootScope.account;

                          stage = 1;

                          ease(0, angular.element(document.querySelector("#signOut_pageElements_scrollContainer")).prop("offsetWidth"), function (x, t, b, c, d) { return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b; }, function(position) {
                            scrollLeft = position;

                            angular
                              .element(document.querySelector("#signOut_pageElements_scrollContainer"))[0]
                              .scrollLeft = scrollLeft
                            ;
                          }, 250);
                        }, function(err) {
                          $mdToast
                            .show($mdToast.simple().textContent(err.data.message + ((err.data.purge) ? (" You have been signed out.") : ("") )).position("bottom right"))
                          ;

                          if (err.data.purge) {
                            delete $rootScope.session;

                            delete localStorage.session;

                            delete $rootScope.account;
                          }
                        })
                      ;
                    }.bind(this)
                  }
                }
              ]
            ;

            ResizeSensor(angular.element(document.querySelector("#signOut_pageElements_scrollContainer")), function() {
              scrollLeft = angular.element(document.querySelector("#signOut_pageElements_scrollContainer")).prop("offsetWidth") * stage;

              angular
                .element(document.querySelector("#signOut_pageElements_scrollContainer"))[0]
                .scrollLeft = scrollLeft
              ;
            });
          }.bind(this))(0);
        }.bind(this))(function(start, finish, easing, callback, duration) {
          (function(millisecond, interval) {
            interval = setInterval(function() {
              if (millisecond < duration) {
                callback(start + easing(0, millisecond, 0, finish - start, duration));

                millisecond = millisecond + 1;
              } else {
                callback(finish);

                clearInterval(interval);
              }
            }, 1);
          })(0);
        });
      }.bind(this))(0);
    }
  ])
  .controller("pageController_/root/sign-up/", [
    "$mdToast",
    "StripeBackend",
    "PlausibleBackend",
    "$rootScope",
    function($mdToast, StripeBackend, PlausibleBackend, $rootScope) {
      (function(scrollLeft) {
        angular
          .element(document.querySelector("#signUp_pageElements_scrollContainer"))
          .on("scroll touchmove", function(event) {
            event
              .preventDefault()
            ;

            angular
              .element(document.querySelector("#signUp_pageElements_scrollContainer"))[0]
              .scrollLeft = scrollLeft
            ;
          })
        ;

        (function(ease) {
          (function(stage) {
            this
              .stages = [
                {
                  form: {
                    givenName: "",
                    familyName: "",
                    continue: function() {
                      if (this.stages[0].form.givenName !== "") {
                        this
                          .stages[1]
                          .form
                          .givenName = this.stages[0].form.givenName
                        ;

                        if (this.stages[0].form.familyName !== "") {
                          this
                            .stages[1]
                            .form
                            .familyName = this.stages[0].form.familyName
                          ;

                          stage = 1;

                          ease(0, angular.element(document.querySelector("#signUp_pageElements_scrollContainer")).prop("offsetWidth"), function (x, t, b, c, d) { return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b; }, function(position) {
                            scrollLeft = position;

                            angular
                              .element(document.querySelector("#signUp_pageElements_scrollContainer"))[0]
                              .scrollLeft = scrollLeft
                            ;
                          }, 250);
                        } else {
                          $mdToast
                            .show($mdToast.simple().textContent("Enter your last name.").position("bottom right"))
                          ;
                        }
                      } else {
                        $mdToast
                          .show($mdToast.simple().textContent("Enter your first name.").position("bottom right"))
                        ;
                      }
                    }.bind(this)
                  }
                },
                {
                  form: {
                    email: "",
                    phoneNumber: "",
                    continue: function() {
                      this
                        .stages[2]
                        .form
                        .givenName = this.stages[1].form.givenName
                      ;

                      this
                        .stages[2]
                        .form
                        .familyName = this.stages[1].form.familyName
                      ;

                      if (this.stages[1].form.email !== "") {
                        this
                          .stages[2]
                          .form
                          .email = this.stages[1].form.email
                        ;

                        if (this.stages[1].form.phone !== "") {
                          this
                            .stages[2]
                            .form
                            .phoneNumber = this.stages[1].form.phoneNumber
                          ;

                          stage = 2;

                          ease(angular.element(document.querySelector("#signUp_pageElements_scrollContainer")).prop("offsetWidth"), angular.element(document.querySelector("#signUp_pageElements_scrollContainer")).prop("offsetWidth") * 2, function (x, t, b, c, d) { return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b; }, function(position) {
                            scrollLeft = position;

                            angular
                              .element(document.querySelector("#signUp_pageElements_scrollContainer"))[0]
                              .scrollLeft = scrollLeft
                            ;
                          }, 250);
                        } else {
                          $mdToast
                            .show($mdToast.simple().textContent("Enter your phone number.").position("bottom right"))
                          ;
                        }
                      } else {
                        $mdToast
                          .show($mdToast.simple().textContent("Enter your email.").position("bottom right"))
                        ;
                      }
                    }.bind(this),
                    back: function() {
                      stage = 0;

                      ease(angular.element(document.querySelector("#signUp_pageElements_scrollContainer")).prop("offsetWidth"), 0, function (x, t, b, c, d) { return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b; }, function(position) {
                        scrollLeft = position;

                        angular
                          .element(document.querySelector("#signUp_pageElements_scrollContainer"))[0]
                          .scrollLeft = scrollLeft
                        ;
                      }, 250);
                    }.bind(this)
                  }
                },
                {
                  form: {
                    password: "",
                    passwordVerification: "",
                    continue: function() {
                      this
                        .stages[3]
                        .form
                        .givenName = this.stages[2].form.givenName
                      ;

                      this
                        .stages[3]
                        .form
                        .familyName = this.stages[2].form.familyName
                      ;

                      this
                        .stages[3]
                        .form
                        .email = this.stages[2].form.email
                      ;

                      this
                        .stages[3]
                        .form
                        .phoneNumber = this.stages[2].form.phoneNumber
                      ;

                      if (this.stages[2].form.password !== "") {
                        this
                          .stages[3]
                          .form
                          .password = this.stages[2].form.password
                        ;

                        if (this.stages[2].form.passwordVerification !== "") {
                          if (this.stages[2].form.passwordVerification == this.stages[2].form.password) {
                            stage = 3;

                            ease(angular.element(document.querySelector("#signUp_pageElements_scrollContainer")).prop("offsetWidth") * 2, angular.element(document.querySelector("#signUp_pageElements_scrollContainer")).prop("offsetWidth") * 3, function (x, t, b, c, d) { return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b; }, function(position) {
                              scrollLeft = position;

                              angular
                                .element(document.querySelector("#signUp_pageElements_scrollContainer"))[0]
                                .scrollLeft = scrollLeft
                              ;
                            }, 250);
                          } else {
                            $mdToast
                              .show($mdToast.simple().textContent("Passwords must match.").position("bottom right"))
                            ;
                          }
                        } else {
                          $mdToast
                            .show($mdToast.simple().textContent("Enter your password again.").position("bottom right"))
                          ;
                        }
                      } else {
                        $mdToast
                          .show($mdToast.simple().textContent("Enter your password.").position("bottom right"))
                        ;
                      }
                    }.bind(this),
                    back: function() {
                      stage = 1;

                      ease(angular.element(document.querySelector("#signUp_pageElements_scrollContainer")).prop("offsetWidth") * 2, angular.element(document.querySelector("#signUp_pageElements_scrollContainer")).prop("offsetWidth"), function (x, t, b, c, d) { return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b; }, function(position) {
                        scrollLeft = position;

                        angular
                          .element(document.querySelector("#signUp_pageElements_scrollContainer"))[0]
                          .scrollLeft = scrollLeft
                        ;
                      }, 250);
                    }.bind(this)
                  }
                },
                {
                  form: {
                    streetAddress: "",
                    city: "",
                    state: "",
                    postalCode: "",
                    continue: function() {
                      this
                        .stages[4]
                        .loading = true
                      ;

                      if (this.stages[3].form.streetAddress !== "") {
                        if (this.stages[3].form.city !== "") {
                          if (this.stages[3].form.state !== "") {
                            if (this.stages[3].form.postalCode !== "") {
                              StripeBackend
                                .public
                                .customers
                                .createCustomer({
                                  email: this.stages[3].form.email,
                                  shipping: {
                                    address: {
                                      line1: this.stages[3].form.streetAddress,
                                      city: this.stages[3].form.city,
                                      state: this.stages[3].form.state,
                                      postal_code: this.stages[3].form.postalCode
                                    },
                                    name: this.stages[3].form.givenName + " " + this.stages[3].form.familyName
                                  }
                                })
                                .then(function(res) {
                                  (function(customerObject) {
                                    PlausibleBackend
                                      .public
                                      .createUser({
                                        givenName: this.stages[3].form.givenName,
                                        familyName: this.stages[3].form.familyName,
                                        email: this.stages[3].form.email,
                                        phoneNumber: this.stages[3].form.phoneNumber,
                                        password: this.stages[3].form.password,
                                        streetAddress: this.stages[3].form.streetAddress,
                                        city: this.stages[3].form.city,
                                        state: this.stages[3].form.state,
                                        postalCode: this.stages[3].form.postalCode,
                                        stripeCustomerID: customerObject.id
                                      })
                                      .then(function() {
                                        PlausibleBackend
                                          .public
                                          .createSession({
                                            email: this.stages[3].form.email,
                                            password: this.stages[3].form.password
                                          })
                                          .then(function(res) {
                                            $rootScope
                                              .session = res.data
                                            ;

                                            localStorage
                                              .session = $rootScope.session
                                            ;

                                            PlausibleBackend
                                              .private
                                              .getUserSelf($rootScope.session)
                                              .then(function(res) {
                                                $rootScope
                                                  .account = res.data
                                                ;

                                                StripeBackend
                                                  .private
                                                  .customers
                                                  .retrieveCustomer($rootScope.session)
                                                  .then(function(res) {
                                                    (function(customerObject) {
                                                      if (customerObject.sources.data.length > 0) {
                                                        for (index = 0; index < customerObject.sources.data.length; index = index + 1) {
                                                          (function(index) {
                                                            (function(sourceObject) {
                                                              customerObject
                                                                .sources
                                                                .data[index]
                                                                .delete = function() {
                                                                  StripeBackend
                                                                    .private
                                                                    .customers
                                                                    .deleteCard($rootScope.session, sourceObject.id)
                                                                    .then(function(res) {
                                                                      $rootScope
                                                                        .account
                                                                        .stripeCustomerObject
                                                                        .sources
                                                                        .data
                                                                        .splice(index, 1)
                                                                      ;
                                                                    }, function(err) {
                                                                      $mdToast
                                                                        .show($mdToast.simple().textContent(err.data.message + ((err.data.purge) ? (" You have been signed out.") : ("") )).position("bottom right"))
                                                                      ;

                                                                      if (err.data.purge) {
                                                                        delete $rootScope.session;

                                                                        delete localStorage.session;

                                                                        delete $rootScope.account;
                                                                      }
                                                                    })
                                                                  ;
                                                                }
                                                              ;

                                                              if ((index + 1) == customerObject.sources.data.length) {
                                                                $rootScope
                                                                  .account
                                                                  .stripeCustomerObject = customerObject
                                                                ;

                                                                this
                                                                  .stages[4]
                                                                  .loading = false
                                                                ;

                                                                stage = 4;

                                                                ease(angular.element(document.querySelector("#signUp_pageElements_scrollContainer")).prop("offsetWidth") * 3, angular.element(document.querySelector("#signUp_pageElements_scrollContainer")).prop("offsetWidth") * 4, function (x, t, b, c, d) { return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b; }, function(position) {
                                                                  scrollLeft = position;

                                                                  angular
                                                                    .element(document.querySelector("#signUp_pageElements_scrollContainer"))[0]
                                                                    .scrollLeft = scrollLeft
                                                                  ;
                                                                }, 250);
                                                              }
                                                            }.bind(this))(customerObject.sources.data[index]);
                                                          }.bind(this))(index);
                                                        }
                                                      } else {
                                                        $rootScope
                                                          .account
                                                          .stripeCustomerObject = customerObject
                                                        ;

                                                        this
                                                          .stages[4]
                                                          .loading = false
                                                        ;

                                                        stage = 4;

                                                        ease(angular.element(document.querySelector("#signUp_pageElements_scrollContainer")).prop("offsetWidth") * 3, angular.element(document.querySelector("#signUp_pageElements_scrollContainer")).prop("offsetWidth") * 4, function (x, t, b, c, d) { return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b; }, function(position) {
                                                          scrollLeft = position;

                                                          angular
                                                            .element(document.querySelector("#signUp_pageElements_scrollContainer"))[0]
                                                            .scrollLeft = scrollLeft
                                                          ;
                                                        }, 250);
                                                      }
                                                    }.bind(this))(res.data);
                                                  }.bind(this), function(err) {
                                                    this
                                                      .stages[4]
                                                      .loading = false
                                                    ;

                                                    $mdToast
                                                      .show($mdToast.simple().textContent(err.data.message + ((err.data.purge) ? (" You have been signed out.") : ("") )).position("bottom right"))
                                                    ;

                                                    if (err.data.purge) {
                                                      delete $rootScope.session;

                                                      delete localStorage.session;

                                                      delete $rootScope.account;
                                                    }
                                                  }.bind(this))
                                                ;

                                                $mdToast
                                                  .show($mdToast.simple().textContent("Welcome to Plausible Worldwide, " + $rootScope.account.givenName + ". You're signed in.").position("bottom right"))
                                                ;
                                              }.bind(this), function(err) {
                                                this
                                                  .stages[4]
                                                  .loading = false
                                                ;

                                                $mdToast
                                                  .show($mdToast.simple().textContent(err.data.message + ((err.data.purge) ? (" You have been signed out.") : ("") )).position("bottom right"))
                                                ;

                                                if (err.data.purge) {
                                                  delete $rootScope.session;

                                                  delete localStorage.session;

                                                  delete $rootScope.account;
                                                }
                                              }.bind(this))
                                            ;
                                          }.bind(this), function(err) {
                                            this
                                              .stages[4]
                                              .loading = false
                                            ;

                                            $mdToast
                                              .show($mdToast.simple().textContent(err.data).position("bottom right"))
                                            ;
                                          }.bind(this))
                                        ;
                                      }.bind(this), function(err) {
                                        this
                                          .stages[4]
                                          .loading = false
                                        ;

                                        $mdToast
                                          .show($mdToast.simple().textContent(err.data).position("bottom right"))
                                        ;
                                      }.bind(this))
                                    ;
                                  }.bind(this))(res.data);
                                }.bind(this), function(err) {
                                  this
                                    .stages[4]
                                    .loading = false
                                  ;

                                  $mdToast
                                    .show($mdToast.simple().textContent(err.data.message).position("bottom right"))
                                  ;
                                }.bind(this))
                              ;
                            } else {
                              this
                                .stages[4]
                                .loading = false
                              ;

                              $mdToast
                                .show($mdToast.simple().textContent("Enter your postal code.").position("bottom right"))
                              ;
                            }
                          } else {
                            this
                              .stages[4]
                              .loading = false
                            ;

                            $mdToast
                              .show($mdToast.simple().textContent("Enter your state.").position("bottom right"))
                            ;
                          }
                        } else {
                          this
                            .stages[4]
                            .loading = false
                          ;

                          $mdToast
                            .show($mdToast.simple().textContent("Enter your city.").position("bottom right"))
                          ;
                        }
                      } else {
                        this
                          .stages[4]
                          .loading = false
                        ;

                        $mdToast
                          .show($mdToast.simple().textContent("Enter your street address.").position("bottom right"))
                        ;
                      }
                    }.bind(this),
                    back: function() {
                      stage = 3;

                      ease(angular.element(document.querySelector("#signUp_pageElements_scrollContainer")).prop("offsetWidth") * 3, angular.element(document.querySelector("#signUp_pageElements_scrollContainer")).prop("offsetWidth") * 2, function (x, t, b, c, d) { return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b; }, function(position) {
                        scrollLeft = position;

                        angular
                          .element(document.querySelector("#signUp_pageElements_scrollContainer"))[0]
                          .scrollLeft = scrollLeft
                        ;
                      }, 250);
                    }.bind(this)
                  }
                },
                {
                  loading: false
                }
              ]
            ;

            ResizeSensor(angular.element(document.querySelector("#signUp_pageElements_scrollContainer")), function() {
              scrollLeft = angular.element(document.querySelector("#signUp_pageElements_scrollContainer")).prop("offsetWidth") * stage;

              angular
                .element(document.querySelector("#signUp_pageElements_scrollContainer"))[0]
                .scrollLeft = scrollLeft
              ;
            });
          }.bind(this))(0);
        }.bind(this))(function(start, finish, easing, callback, duration) {
          (function(millisecond, interval) {
            interval = setInterval(function() {
              if (millisecond < duration) {
                callback(start + easing(0, millisecond, 0, finish - start, duration));

                millisecond = millisecond + 1;
              } else {
                callback(finish);

                clearInterval(interval);
              }
            }, 1);
          })(0);
        });
      }.bind(this))(0);
    }
  ])
  .controller("pageController_otherwise", [
    function() {

    }
  ])
;
