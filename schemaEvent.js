const mongoose = require("mongoose");

const eventdesSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  imageUrl: String,
  about: {
    type: String,
    required: true,
  },
  termsAndConditions: {
    type: String,
    required: true,
  },
  mode: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
});

const Eventdes = mongoose.model("Eventdes", eventdesSchema);

module.exports = Eventdes;
