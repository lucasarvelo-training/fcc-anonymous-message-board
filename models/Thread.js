const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const threadSchema = new Schema({
  text: {
    type: String,
    required:'{PATH} is required!'
  },
  delete_password: {
    type: String,
    required: '{PATH} is required!'
  },
  created_on: {
    type: Date,
    default: Date.now
  },
  bumped_on: {
    type: Date,
    default: Date.now
  },
  reported: {
    type: Boolean,
    default: false
  },
  replies: [{
    type: Schema.Types.ObjectId, 
    ref: 'Reply', 
    required: false
  }]
  
})

module.exports = mongoose.model('Thread', threadSchema);