var Users    = require("../../../../models/users"),
    Sessions = require("../../../../models/sessions");

module
  .exports = function(req, res, stripe) {
    (function(session, options) {
      Sessions
        .findOne({
          _id: session
        })
        .exec(function(err_secondary, res_secondary) {
          if (!err_secondary) {
            if (res_secondary) {
              Users
                .findOne({
                  _id: res_secondary.belongsTo
                })
                .exec(function(err_tertiary, res_tertiary) {
                  if (!err_tertiary) {
                    if (res_tertiary) {
                      options
                        .customer = res_tertiary.stripeCustomerID
                      ;

                      stripe
                        .orders
                        .create(options, function(err_quaternary, res_quaternary) {
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

                            console.log("stripeBackend / private / orders / createOrder: ER" + err_quaternary.type);
                          }
                        })
                      ;
                    }
                  }
                })
              ;
            }
          }
        })
      ;
    })(req.query.session, JSON.parse(req.query.options));
  }
;
