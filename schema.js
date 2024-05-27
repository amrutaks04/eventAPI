const mongoose = require('mongoose');

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
  detailedEventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Eventdes', // Reference to the Eventdes model
  },
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
