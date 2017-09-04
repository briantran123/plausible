var Users    = require("../../../../models/users"),
    Sessions = require("../../../../models/sessions");

module
  .exports = function(req, res, stripe) {
    (function(session) {
      Sessions
        .findOne({
          _id: session
        })
        .exec(function(err_secondary, res_secondary) {
          if (!err_secondary) {
            if (res_secondary) {
              if (req.useragent.source == res_secondary.useragent) {
                Users
                  .findOne({
                    _id: res_secondary.belongsTo
                  })
                  .exec(function(err_tertiary, res_tertiary) {
                    if (!err_tertiary) {
                      if (res_tertiary) {
                        stripe
                          .customers
                          .retrieve(res_tertiary.stripeCustomerID, function(err_quaternary, res_quaternary) {
                            if (!err_quaternary) {
                              res
                                .status(200)
                                .send(res_quaternary)
                                .end()
                              ;
                            } else {
                              res
                                .status(500)
                                .send({
                                  message: err_quaternary.type,
                                  purge: false
                                })
                                .end()
                              ;

                              console.log("stripeBackend / private / customers / retrieveCustomer: ER" + err_quaternary.type);
                            }
                          })
                        ;
                      } else {
                        res
                          .status(404)
                          .send({
                            message: "The user to which this session belongs was not found.",
                            purge: true
                          })
                          .end()
                        ;
                      }
                    } else {
                      res
                        .status(500)
                        .send({
                          message: err_tertiary.code,
                          purge: false
                        })
                        .end()
                      ;

                      console.log("stripeBackend / private / customers / retrieveCustomer: ER" + err_tertiary.code);
                    }
                  })
                ;
              } else {
                res
                  .status(403)
                  .send({
                    message: "Sessions are non-transferrable between device families for security.",
                    purge: false
                  })
                  .end()
                ;
              }
            } else {
              res
                .status(404)
                .send({
                  message: "This session was not found.",
                  purge: true
                })
                .end()
              ;
            }
          } else {
            res
              .status(500)
              .send({
                message: err_secondary.code,
                purge: false
              })
              .end()
            ;

            console.log("stripeBackend / private / customers / retrieveCustomer: ER" + err_secondary.type);
          }
        })
      ;
    })(req.query.session);
  }
;
