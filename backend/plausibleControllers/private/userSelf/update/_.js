var Users           = require("../../../../models/users"),
    Sessions        = require("../../../../models/sessions");

module
  .exports = function(req, res) {
    (function(session, options) {
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
                        if (options.key == "givenName") {
                          Users
                            .findOneAndUpdate({
                              _id: res_tertiary._id
                            }, {
                              _id: res_tertiary._id,
                              givenName: options.value,
                              familyName: res_tertiary.familyName,
                              email: res_tertiary.email,
                              phoneNumber: res_tertiary.phoneNumber,
                              streetAddress: res_tertiary.streetAddress,
                              city: res_tertiary.city,
                              state: res_tertiary.state,
                              postalCode: res_tertiary.postalCode,
                              password: res_tertiary.password,
                              salt: res_tertiary.salt,
                              stripeCustomerID: res_tertiary.stripeCustomerID
                            })
                            .exec(function(err_quaternary, res_quaternary) {
                              if (!err_quaternary) {
                                if (res_quaternary) {
                                  res
                                    .status(200)
                                    .end()
                                  ;
                                }
                              } else {
                                res
                                  .status(500)
                                  .send({
                                    message: err_quaternary.code,
                                    purge: false
                                  })
                                  .end()
                                ;

                                console.log("API / private / updateUserSelf: ER" + err_quaternary.code);
                              }
                            })
                          ;
                        } else {
                          if (options.key == "familyName") {
                            Users
                              .findOneAndUpdate({
                                _id: res_tertiary._id
                              }, {
                                _id: res_tertiary._id,
                                givenName: res_tertiary.givenName,
                                familyName: options.value,
                                email: res_tertiary.email,
                                phoneNumber: res_tertiary.phoneNumber,
                                streetAddress: res_tertiary.streetAddress,
                                city: res_tertiary.city,
                                state: res_tertiary.state,
                                postalCode: res_tertiary.postalCode,
                                password: res_tertiary.password,
                                salt: res_tertiary.salt,
                                stripeCustomerID: res_tertiary.stripeCustomerID
                              })
                              .exec(function(err_quaternary, res_quaternary) {
                                if (!err_quaternary) {
                                  if (res_quaternary) {
                                    res
                                      .status(200)
                                      .end()
                                    ;
                                  }
                                } else {
                                  res
                                    .status(500)
                                    .send({
                                      message: err_quaternary.code,
                                      purge: false
                                    })
                                    .end()
                                  ;

                                  console.log("API / private / updateUserSelf: ER" + err_quaternary.code);
                                }
                              })
                            ;
                          } else {
                            if (options.key == "email" || options.key == "phoneNumber" || options.key == "password") {
                              res
                                .status(404)
                                .send({
                                  message: "This field cannot be edited as of the current version.",
                                  purge: false
                                })
                                .end()
                              ;
                            } else {
                              res
                                .status(404)
                                .send({
                                  message: "This field was not found.",
                                  purge: false
                                })
                                .end()
                              ;
                            }
                          }
                        }
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

                      console.log("API / private / updateUserSelf: ER" + err_tertiary.code);
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

            console.log("API / private / updateUserSelf: ER" + err_secondary.code);
          }
        })
      ;
    })(req.query.session, JSON.parse(req.query.options));
  }
;
