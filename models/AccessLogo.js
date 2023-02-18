const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const AccessLogoSchema = new Schema({
  device: {
    type: String,
    required: true
  },
  ipaddress: {
    type: String,
    required: true
  },
  browsertype : {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Logos = mongoose.model("logos", AccessLogoSchema);
