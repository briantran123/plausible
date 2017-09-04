var Users           = require("../../../../../models/users"),
    Sessions        = require("../../../../../models/sessions");

module
  .exports = function(req, res) {
    (function(options) {
      if (typeof options.email !== "undefined" && options.email !== "") {
        Users
          .findOne({
            email: options.email
          })
          .exec(function(err_tertiary, res_tertiary) {
            if (!err_tertiary) {
              if (res_tertiary) {
                res
                  .status(200)
                  .send({
                    givenName: res_tertiary.givenName,
                    email: res_tertiary.email
                  })
                  .end()
                ;
              } else {
                res
                  .status(404)
                  .send("This user was not found.")
                  .end()
                ;
              }
            } else {
              res
                .status(500)
                .send(err_tertiary.code + "")
                .end()
              ;

              console.log("API / public / getUserByEmail: ER" + err_tertiary.code);
            }
          })
        ;
      } else {
        res
          .status(400)
          .send("Bad request.")
          .end()
        ;
      }
    })(JSON.parse(req.query.options));
  }
;
