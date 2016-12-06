'use strict';

var jwt = require('jsonwebtoken');
var config = require('../config/config.json').token;
var moment = require('moment');

var tokens = {
  create: function(user) {
    // Create JWT including claims (i.e. role, user info)
    var claims = {
        username: user.username
      },
      options = {
        issuer: config.jwtIssuer
      },
      token;

    try {
      token = {
        userId: user.id,
        token: jwt.sign(claims, config.jwtSecret, options)
      };
    } catch(err) {
    throw(err);
    }

    return token;
  },
  verify: function(token) {
    var decoded;

    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (err) {
    throw err;
    }

    return decoded;
  }
};

module.exports = tokens;
