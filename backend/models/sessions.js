var mongoose = require("mongoose"),

    Schema   = mongoose.Schema,
    ObjectID = mongoose.Schema.Types.ObjectId;

module
  .exports = mongoose.model("Session", new Schema({
    belongsTo: {
      type: ObjectID,
      required: true
    },
    useragent: {
      type: String,
      required: true
    }
  }, {
    collection: "sessions"
  }))
;
