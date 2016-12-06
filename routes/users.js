'use strict';

var express = require('express');
var users = require('../controllers/').users;
var libError = require('../lib/error');
var libTokens = require('../lib/tokens');
var router = express.Router();

/* Creates a new User

   POST /users
   {
   		"username": "tc"
   }

*/
router.post('/', function(req, res) {
  users.create(req.body).then(function(user) {
    if (!user)
      throw ({
        error: 'Error creating user'
      });
    var token = libTokens.create(user);
    return res.send({
      token: token.token
    });
  }).catch(function(error) {
    libError.send(res, error);
  });
});

module.exports = router;
