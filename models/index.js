'use strict';

var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var config = require('../config/config.json').database;
var sequelize = new Sequelize(config.database, config.username,
  config.password, config);
var db = {
  names: []
};

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js') && (file.indexOf('.js') !== -1);
  })
  .forEach(function(file) {
    var model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
    db.names.push(model.name);
  });

Object.keys(db).forEach(function(modelName) {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
