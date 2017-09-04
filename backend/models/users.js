var mongoose = require("mongoose"),
    crypto   = require("crypto"),

    Schema   = mongoose.Schema;

module
  .exports = mongoose.model("User", new Schema({
    givenName: {
      type: String,
      required: true
    },
    familyName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      unique: true,
      required: true
    },
    phoneNumber: {
      type: Number,
      unique: true,
      required: true
    },
    streetAddress: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    postalCode: {
      type: String,
      required: true
    },
    password: {
      type: String,
      unique: true,
      required: true
    },
    salt: {
      type: String,
      unique: true,
      default: crypto.randomBytes(32).toString("hex"),
      required: true
    },
    stripeCustomerID: {
      type: String,
      unique: true,
      required: true
    }
  }, {
    collection: "users"
  }).pre("save", function(next) {
    if (!this.isModified("password")) {
      return next();
    }

    this
      .password = crypto.createHash("sha256").update(this.password + this.salt).digest("hex")
    ;

    next();
  }))
;
