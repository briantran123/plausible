module
  .exports = function(req, res, stripe) {
    stripe
      .products
      .list(function(err_secondary, res_secondary) {
        if (!err_secondary) {
          res
            .status(200)
            .send(res_secondary)
            .end()
          ;
        } else {
          res
            .status(500)
            .send(err_secondary)
            .end()
          ;
        }
      })
    ;
  }
;
