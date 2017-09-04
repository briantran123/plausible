var Users           = require("../../../../models/users"),
    Sessions        = require("../../../../models/sessions");

module
  .exports = function(req, res) {
    if (typeof req.query.session !== "undefined" && req.query.session !== "" && req.query.session.match(/^[0-9a-fA-F]{24}$/)) {
      res
        .status(200)
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
