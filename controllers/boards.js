const Board = require('../models/Board.js');
const Thread = require('../models/Thread.js');
const Reply = require('../models/Reply.js');
const bcrypt = require('bcrypt');

const boards = {
  add(name) {
    const newBoard = new Board({
      name: name,
    });

    return newBoard
      .save()
      .then(function(board) {
        return board;
      })
      .catch(error => console.log(error));
  },

  exist(name) {
    return Board.findOne({ name: name })
      .then(function(board) {
        return board;
      })
      .catch(error => console.log(error));
  },

  add_Thread(name, _id) {
    return Board.findOne({ name: name }, (error, board) => {
      if (error) return console.log(error);
      
      //If the board doesn't exist will be created before add the new thread
      if (!board) {
        this.add(name).then(board => {
          board.threads.push(_id);
          return board
            .save()
            .then(function(board) {
              return board;
            })
            .catch(error => console.log(error));
        });
      } else {
        board.threads.push(_id);
        return board
          .save()
          .then(function(board) {
            return board;
          })
          .catch(error => console.log(error));
      }
    });
  },
  delete_Thread(thread_id, delete_password, boardName) {
    return Thread.findById(thread_id)
      .then(function(thread) {
        if (bcrypt.compareSync(delete_password, thread.delete_password)) {
          return thread.remove().then(function(thread) {
            return Reply.deleteMany({ _id: { $in: thread.replies } }).then(
              function(result) {
                return Board.findOne({ name: boardName }).then(function(board) {
                  board.threads.pull(thread_id);
                  return board.save().then(function(board) {
                    return 'success';
                  });
                });
              }
            );
          });
        } else {
          return 'incorrect password';
        }
      })
      .catch(error => console.log(error));
  },
  // This function is in charge of build the object for the response on route /api/threads/:board, may is a god idea refactor this into a new function.
  get_latest_10_threads(name) {
    return Board.findOne({ name: name })
      .populate('threads')
      .then(function(board) {
        return Promise.all(
          board.threads.map(thread => {
            return Thread.findById(thread._id)
              .populate('replies')
              .then(thread => {
                return {
                  _id: thread._id,
                  text: thread.text,
                  created_on: thread.created_on,
                  bumped_on: thread.bumped_on,
                  replies: thread.replies
                    .map(reply => {
                      return {
                        _id: reply._id,
                        text: reply.text,
                        created_on: reply.created_on,
                      };
                    })
                    .slice()
                    .sort((a, b) => b.created_on - a.created_on)
                    .splice(0, 3),
                  replycount: thread.replies.length,
                };
              });
          })
        ).then(threads =>
          threads
            .slice()
            .sort((a, b) => b.bumped_on - a.bumped_on)
            .splice(0, 10)
        );
      })
      .catch(error => console.log(error));
  },
  get(name) {
    return new Promise((resolve, reject) => {
      let response;
      return this.exist(name).then(board => {
        if (!board) return this.add(name).then(board => resolve([]));

        return this.get_latest_10_threads(name).then(threads => {
          resolve(threads);
        });
      });
    });
  },
};

module.exports = boards;
