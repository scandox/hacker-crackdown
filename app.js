'use strict';

var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var libError = require('./lib/error');

// Require Route Modules
var annotations = require('./routes/annotations.js');
var users = require('./routes/users.js');

// Require custom Middleware
var claims = require('./lib/claims.js');

// Initialize Express Application and Add-ons
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

// Mount middleware that determines User claims
app.use('/v1', claims);

// Set Routes
app.use('/v1/', annotations);
app.use('/v1/users', users);
app.use('/', express.static(__dirname + '/public/build', {
  maxAge: 4 * 60 * 60 * 1000 /* 2hrs */
}));

// Set Error Handler
app.use(libError.handler);

module.exports = app;
