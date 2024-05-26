const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
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
});

const Event = mongoose.model("Event", eventSchema);

const eventDescriptionSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  imageUrl: String,
  time: {
    type: String,
    required: true,
  },
  mode: {
    type: String,
    enum: ["offline", "online"],
    required: true,
  },
  about: {
    type: String,
    required: true,
  },
  termsAndConditions: {
    type: String,
    required: true,
  },
});

const EventDescription = mongoose.model("EventDescription", eventDescriptionSchema);

module.exports = {
  Event,
  EventDescription
};
