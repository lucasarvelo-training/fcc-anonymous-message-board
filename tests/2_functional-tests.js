/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const Board = require('../models/Board.js');
const Reply = require('../models/Reply.js');
const Thread = require('../models/Thread.js');
const threads = require('../controllers/threads.js');
const replies = require('../controllers/replies.js');
const testBoardName = 'test';
const bcrypt = require('bcrypt');
const threadsTest = [];
const replyTest = [];

chai.use(chaiHttp);

suite('Functional Tests', function() {
  before(function(done) {
    //Create a thread and a reply extra to be use after DELETE test.
    threads
      .add('test', bcrypt.hashSync('test', 10), testBoardName)
      .then(thread => {
        replies
          .add('test', bcrypt.hashSync('test', 10), thread._id)
          .then(reply => {
            threadsTest.push(thread);
            replyTest.push(reply);
            done();
          });
      });
  });

  after(function(done) {
    Board.deleteMany({ name: 'test' }, err => {
      Thread.deleteMany({ text: 'test' }, err => {
        //When a reply is delete, change the text property to [delete]. $or ensure that the reply delete in the test is remove from the database.
        Reply.deleteMany(
          { $or: [{ text: 'test' }, { _id: replyTest[0]._id }] },
          err => {
            done();
          }
        );
      });
    });
  });

  suite('API ROUTING FOR /api/threads/:board', function() {
    suite('POST', function() {
      test('Should redirect to /b/test after post thread', function(done) {
        chai
          .request(server)
          .post('/api/threads/' + testBoardName)
          .redirects(0)
          .send({ text: 'test', delete_password: 'test' })
          .end(function(error, res) {
            if (error) return console.log(error);
            assert.equal(res.status, 302);
            assert.equal(res.text, 'Found. Redirecting to /b/test/');
            done();
          });
      });
    });

    suite('GET', function() {
      test('Should return 10 bumped threads with 3 most recent replies', function(done) {
        chai
          .request(server)
          .get('/api/threads/' + testBoardName)
          .end(function(error, res) {
            if (error) return console.log(error);
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.isBelow(res.body.length, 11);
            assert.property(res.body[0], '_id');
            assert.property(res.body[0], 'text');
            assert.property(res.body[0], 'created_on');
            assert.property(res.body[0], 'bumped_on');
            assert.notProperty(res.body[0], 'reported');
            assert.notProperty(res.body[0], 'delete_password');
            assert.property(res.body[0], 'replies');
            assert.isArray(res.body[0].replies);
            assert.isBelow(res.body[0].replies.length, 4);
            threadsTest.push(res.body[0]);
            done();
          });
      });
    });

    suite('DELETE', function() {
      //Create thread before delete it throught the api

      test('Should return success', function(done) {
        chai
          .request(server)
          .delete('/api/threads/' + testBoardName)
          .send({ thread_id: threadsTest[1]._id, delete_password: 'test' })
          .end(function(error, res) {
            if (error) return console.log(error);
            assert.equal(res.status, 200);
            assert.equal(res.body, 'success');
            done();
          });
      });
    });

    suite('PUT', function() {
      test('Should return success', function(done) {
        chai
          .request(server)
          .put('/api/threads/' + testBoardName)
          .send({ thread_id: threadsTest[0]._id })
          .end(function(error, res) {
            if (error) return console.log(error);
            assert.equal(res.status, 200);
            assert.equal(res.body, 'success');
            done();
          });
      });
    });
  });

  suite('API ROUTING FOR /api/replies/:board', function() {
    suite('POST', function() {
      test('Should redirect to /b/test/:thread_id after post reply', function(done) {
        chai
          .request(server)
          .post('/api/replies/' + testBoardName)
          .redirects(0)
          .send({
            text: 'test',
            delete_password: 'test',
            thread_id: threadsTest[0]._id,
          })
          .end(function(error, res) {
            if (error) return console.log(error);
            assert.equal(res.status, 302);
            assert.equal(
              res.text,
              'Found. Redirecting to /b/test/' + threadsTest[0]._id
            );
            done();
          });
      });
    });

    suite('GET', function() {
      test('Should return thread with all replies', function(done) {
        chai
          .request(server)
          .get(
            '/api/replies/' + testBoardName + '?thread_id=' + threadsTest[0]._id
          )
          .end(function(error, res) {
            if (error) return console.log(error);
            assert.equal(res.status, 200);
            assert.property(res.body, '_id');
            assert.property(res.body, 'text');
            assert.property(res.body, 'created_on');
            assert.property(res.body, 'bumped_on');
            assert.notProperty(res.body, 'reported');
            assert.notProperty(res.body, 'delete_password');
            assert.property(res.body, 'replies');
            assert.isArray(res.body.replies);
            assert.isBelow(res.body.replies.length, 4);
            done();
          });
      });
    });

    suite('PUT', function() {
      test('Should return success', function(done) {
        chai
          .request(server)
          .put('/api/replies/' + testBoardName)
          .send({ thread_id: threadsTest[0]._id, reply_id: replyTest[0]._id })
          .end(function(error, res) {
            if (error) return console.log(error);
            assert.equal(res.status, 200);
            assert.equal(res.body, 'success');
            done();
          });
      });
    });

    suite('DELETE', function() {
      test('Should return success', function(done) {
        chai
          .request(server)
          .delete('/api/replies/' + testBoardName)
          .send({
            thread_id: threadsTest[0]._id,
            delete_password: 'test',
            reply_id: replyTest[0]._id,
          })
          .end(function(error, res) {
            if (error) return console.log(error);
            assert.equal(res.status, 200);
            assert.equal(res.body, 'success');
            done();
          });
      });
    });
  });
});
