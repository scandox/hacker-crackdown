'use strict';

var app = require('./app'),
  http = require('http'),
  models = require('./models/');

var port = process.env.HC_PORT || 3000;
var host = process.env.HC_HOST || undefined;
var server;

server = http.createServer(app);

// Synchronize Sequelize with DB prior
models.sequelize.sync().then(function() {

  // Start Server
  server.listen(port, host, function() {});

});
