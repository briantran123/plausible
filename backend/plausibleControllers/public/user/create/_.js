var Users = require("../../../../models/users");

module
  .exports = function(req, res) {
    (function(options) {
      console.log(options);

      Users
        .create(options, function(err_secondary) {
          if (!err_secondary) {
            res
              .status(200)
              .end()
            ;
          } else {
            res
              .status(500)
              .send(err_secondary.code + "")
              .end()
            ;

            console.log(err_secondary);

            console.log("API / public / createUser: ER" + err_secondary.code);
          }
        })
      ;
    })(JSON.parse(req.query.options));
  }
;
