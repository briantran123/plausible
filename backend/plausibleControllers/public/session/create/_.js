var Users     = require("../../../../models/users"),
    Sessions  = require("../../../../models/sessions"),

    crypto    = require("crypto");

module
  .exports = function(req, res) {
    (function(options) {
      Users
        .findOne({
          "email": options.email
        })
        .select("_id password salt")
        .exec(function(err_secondary, res_secondary) {
          if (res_secondary) {
            if (crypto.createHash("sha256").update(options.password + res_secondary.salt).digest("hex") == res_secondary.password) {
              Sessions
                .create({
                  belongsTo: res_secondary._id,
                  useragent: req.useragent.source
                }, function(err_tertiary, res_tertiary) {
                  if (!err_tertiary) {
                    res
                      .status(200)
                      .send(String(res_tertiary._id))
                      .end()
                    ;
                  } else {
                    res
                      .status(500)
                      .send(err_tertiary.code + "")
                      .end()
                    ;

                    console.log("API / private / createSession: ER" + err_tertiary.code);
                  }
                })
              ;
            } else {
              res
                .status(403)
                .send("Incorrect password.")
                .end()
              ;
            }
          } else {
            res
              .status(404)
              .send("This user was not found.")
              .end()
            ;
          }
        })
      ;
    })(JSON.parse(req.query.options));
  }
;
