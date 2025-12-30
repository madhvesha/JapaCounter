const mongoose = require("mongoose");

const japaSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true
  },
  count: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Japa", japaSchema);
