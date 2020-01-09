/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

'use strict';

const expect = require('chai').expect;
const boards = require('../controllers/boards.js');
const threads = require('../controllers/threads.js');
const replies = require('../controllers/replies.js');
const bcrypt = require('bcrypt');

module.exports = function(app) {
  app
    .route('/api/threads/:board')
    .get((req, res) => {
      const boardName = req.params.board;
      boards
        .get(boardName, true)
        .then(threads => res.json(threads))
        .catch(error => res.json({ error: error.message }));
    })
    .post((req, res) => {
      const boardName = req.params.board;
      const text = req.body.text;
      const delete_password = bcrypt.hashSync(req.body.delete_password, 10);

      threads
        .add(text, delete_password, boardName)
        .then(thread => res.redirect('/b/' + boardName + '/'))
        .catch(error => res.json({ error: error.message }));
    })
    .delete((req, res) => {
      const boardName = req.params.board;
      const delete_password = req.body.delete_password;
      const thread_id = req.body.thread_id;

      boards
        .delete_Thread(thread_id, delete_password, boardName)
        .then(result => res.json(result))
        .catch(error => res.json({ error: error.message }));
    })
    .put((req, res) => {
      const thread_id = req.body.thread_id;
      threads
        .report(thread_id)
        .then(result => {
          res.json(result);
        })
        .catch(error => res.json({ error: error.message }));
    });

  app
    .route('/api/replies/:board')
    .get((req, res) => {
      const boardName = req.params.board;
      const thread_id = req.query.thread_id;

      threads
        .get(thread_id)
        .then(thread => res.json(thread))
        .catch(error => res.json({ error: error.message }));
    })
    .post((req, res) => {
      const boardName = req.params.board;
      const text = req.body.text;
      const delete_password = bcrypt.hashSync(req.body.delete_password, 10);
      const thread_id = req.body.thread_id;

      replies
        .add(text, delete_password, thread_id)
        .then(reply => res.redirect('/b/' + boardName + '/' + thread_id))
        .catch(error => res.json({ error: error.message }));
    })
    .delete((req, res) => {
      const reply_id = req.body.reply_id;
      const delete_password = req.body.delete_password;
      const thread_id = req.body.thread_id;

      threads
        .delete_Reply(reply_id, delete_password, thread_id)
        .then(result => res.json(result))
        .catch(error => res.json({ error: error.message }));
    })
    .put((req, res) => {
      const reply_id = req.body.reply_id;
      replies
        .report(reply_id)
        .then(result => {
          res.json(result);
        })
        .catch(error => res.json({ error: error.message }));
    });
};
