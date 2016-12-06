'use strict';

var tokens = require('./tokens.js');

/* Middleware that checks for a valid JWT

   Attaches claims to request object

*/
var claims = function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    try {
      var decoded = tokens.verify(token);
      // Store the actual claims
      req.claims = decoded;
      next();
      return;
    } catch(err) {
    // Not rethrowing an error as we effectively want the user to be 
    // able to continue - just without any claims made. If they do attempt
    // an action they are not authorised for they will get the relevant
    // error then
    console.log(err);
    }

  }

  // Continue with anonymous rights
  req.claims = {
    username: 'anon'
  };
  next();
};

module.exports = claims;
