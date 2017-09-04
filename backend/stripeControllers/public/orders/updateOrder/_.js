module
  .exports = function(req, res, stripe) {
    (function(orderID, options) {
      stripe
        .orders
        .update(orderID, options, function(err_secondary, res_secondary) {
          if (!err_secondary) {
            res
              .status(200)
              .send(res_secondary)
              .end()
            ;
          } else {
            res
              .status(500)
              .send(err_secondary.type)
              .end()
            ;
          }
        })
      ;
    })(req.query.orderID, JSON.parse(req.query.options));
  }
;
