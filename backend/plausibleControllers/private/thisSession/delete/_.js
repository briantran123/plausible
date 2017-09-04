var Users           = require("../../../../models/users"),
    Sessions        = require("../../../../models/sessions");

module
  .exports = function(req, res) {
    if (typeof req.query.session !== "undefined" && req.query.session !== "" && req.query.session.match(/^[0-9a-fA-F]{24}$/)) {
      Sessions
        .findOne({
          _id: req.query.session
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
                        Sessions
                          .findOneAndRemove({
                            _id: res_secondary._id
                          })
                          .exec(function(err_quaternary) {
                            if (!err_quaternary) {
                              res
                                .status(200)
                                .end()
                              ;
                            } else {
                              res
                                .status(500)
                                .send({
                                  message: err_quaternary.code,
                                  purge: false
                                })
                                .end()
                              ;

                              console.log("API / private / deleteThisSession: ER" + err_tertiary.code);
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

                      console.log("API / private / deleteThisSession: ER" + err_tertiary.code);
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

            console.log("API / private / deleteThisSession: ER" + err_secondary.code);
          }
        })
      ;
    } else {
      res
        .status(400)
        .send({
          message: "Bad request.",
          purge: false
        })
        .end()
      ;
    }
  }
;
