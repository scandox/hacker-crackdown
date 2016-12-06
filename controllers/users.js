'use strict';

var models = require('../models/');

var users = {
  /* Creates a new user

     Returns a promise 

  */
  create: function(userData) {
    return new Promise(function(resolve, reject) {
      var newUser = models.user.build(userData);
      var userExists = models.user.find({
        where: {
          username: userData.username
        }
      });

      userExists.then(function(user) {
        if (user) {
          throw ('User already Exists!');
        }
        return newUser.save();
      }).then(function(user) {
        if (!user) {
          throw ('User creation failed');
        }
        resolve(user);
      }).catch(function(error) {
        reject(error);
      });

    });
  },

  get: function(username) {
    return models.user.findOne({
      where: {
        username: username
      }
    });
  }

};

module.exports = users;
