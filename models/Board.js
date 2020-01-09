const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const boardSchema = new Schema({
  name: {
    type: String,
    required: '{PATH} is required!',
    unique: true
  },
  threads: [{
    type: Schema.Types.ObjectId, 
    ref: 'Thread', 
    required: false
  }]
})

module.exports = mongoose.model('Board', boardSchema);