const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({
  shortId: {
    type: String,
    required: true,
    unique: true
  },
  redirectUrl: {
    type: String,
    required: true
  },
  clicked: {
    type: Number,
    default: 0
  },
  expirationDate: {
    type: Date,
    default: null
  }
});

const URL = mongoose.model("url", urlSchema);
module.exports = URL;
