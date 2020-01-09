const threads = require('./threads.js');
const Reply = require('../models/Reply.js');

const replies = {
  add(text, delete_password, thread_id) {
    const newReply = new Reply({
      text: text,
      delete_password: delete_password,
    });

    return newReply
      .save()
      .then(function(reply) {
        return threads
          .add_Reply(thread_id, reply._id)
          .then(function(thread) {
            return reply;
          })
          .catch(error => console.log(error));
      })
      .catch(error => console.log(error));
  },
  report(_id){
    return Reply.findByIdAndUpdate(_id, {reported: true}).then(function(reply){
      if (!reply) return 'Reply Not Found';
      
      return 'success';
    }).catch(error => error.message);
  }
};

module.exports = replies;