
const mongoose = require('mongoose');

const userEventSchema = new mongoose.Schema({
  username: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  mode: { type: String, required: true },
  time: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  imageUrl: { type: String, required: true }
});

const UserEvent = mongoose.model('UserEvent', userEventSchema);

module.exports = UserEvent;
