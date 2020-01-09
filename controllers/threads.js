const Thread = require('../models/Thread.js');
const boards = require('./boards.js');
const Reply = require('../models/Reply.js');
const bcrypt = require('bcrypt');

const threads = {
  add(text, delete_password, board_name) {
    const newThread = new Thread({
      text: text,
      delete_password: delete_password,
    });

    return newThread
      .save()
      .then(function(thread) {
        return boards
          .add_Thread(board_name, thread._id)
          .then(function(board) {
            return thread;
          })
          .catch(error => console.log(error));
      })
      .catch(error => console.log(error));
  },
  get_replies(_id) {
    return Thread.findById(_id)
      .populate('replies')
      .then(function(thread) {
        return thread.replies
          .sort((a, b) => b.created_on - a.created_on)
          .map(reply => {
            return {
              _id: reply._id,
              text: reply.text,
              created_on: reply.created_on,
            };
          });
      })
      .catch(error => console.log(error));
  },
  get_latest_3_replies(_id) {
    return Thread.findById(_id)
      .populate('replies')
      .then(function(thread) {
        return thread.replies
          .slice()
          .sort((a, b) => b.created_on - a.created_on)
          .splice(0, 2)
          .map(reply => {
            return {
              _id: reply._id,
              text: reply.text,
              created_on: reply.created_on,
            };
          });
      })
      .catch(error => console.log(error));
  },
  add_Reply(thread_id, reply_id) {
    return Thread.findById(thread_id)
      .then(function(thread) {
        thread.replies.push(reply_id);
        thread.bumped_on = new Date();
        return thread
          .save()
          .then(function(thread) {
            return thread;
          })
          .catch(error => console.log(error));
      })
      .catch(error => console.log(error));
  },
  delete_Reply(reply_id, delete_password, thread_id) {
    return Reply.findById(reply_id)
      .then(function(reply) {
        if (bcrypt.compareSync(delete_password, reply.delete_password)) {
          reply.text = '[deleted]';
          return reply.save().then(function(reply) {
            return 'success';
          });
        } else {
          return 'incorrect password';
        }
      })
      .catch(error => console.log(error));
  },
  report(_id){
    return Thread.findByIdAndUpdate(_id, {reported: true}).then(function(thread){
      if (!thread) return 'Thread Not Found';
      
      return 'success';
    }).catch(error => error.message);
  },
  get(_id) {
    return Thread.findById(_id)
      .populate('replies')
      .then(thread => {
        if (thread === null) return "Thread not found!";
        return this.get_replies(_id).then(replies => {
          return {
            _id: thread._id,
            text: thread.text,
            created_on: thread.created_on,
            bumped_on: thread.bumped_on,
            replies: replies,
          };
        });
      })
      .catch(error => console.log(error));
  },
};

module.exports = threads;
