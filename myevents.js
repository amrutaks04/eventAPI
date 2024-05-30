const mongoose = require('mongoose');

const myEvent = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
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

const Cart = mongoose.model('Cart', myEvent);

module.exports = Cart;
