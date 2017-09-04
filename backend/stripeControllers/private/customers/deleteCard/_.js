var Users    = require("../../../../models/users"),
    Sessions = require("../../../../models/sessions");

module
  .exports = function(req, res, stripe) {
    (function(session, cardID) {
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
                      stripe
                        .customers
                        .deleteCard(res_tertiary.stripeCustomerID, cardID, function(err_quaternary) {
                          if (!err_quaternary) {
                            res
                              .status(200)
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

                            console.log("stripeBackend / private / customers / deleteCard: ER" + err_quaternary.type);
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
    })(req.query.session, req.query.cardID);
  }
;
