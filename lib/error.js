'use strict';

/* Error handling Middleware for App

*/
var handler = function(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  send(res, err);
};

var send = function(res, err, friendly) {
  res.status(500);
  res.send(err.message);
};

module.exports.handler = handler;
module.exports.send = send;
