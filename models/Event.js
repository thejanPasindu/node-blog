const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  organiser: {
    type: String,
    require: true
  },
  place: {
    type: String,
    require: true
  },
  picture: {
    type: Array,
    require: false
  },
  datetime: {
    type: Date,
    require: true
  },
  rank: {
    type: Number,
    default: 0
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Event = mongoose.model('Event', EventSchema);

module.exports = Event;