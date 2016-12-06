'use strict';

var Promise = require('bluebird');
var $ = require('jquery');
var utilities = require('./utilities.js');

var user = {

  getCurrentUsername: function() {
    var user,
      username;

    if (utilities.hasStorage()) {
      user = localStorage.getItem('user');
      try {
        user = JSON.parse(user);
        username = user.username;
      } catch(e) {
      console.log(e);
      }
    }

    return username;
  },

  createUser: function(username) {
    return new Promise(function(resolve, reject) {
      $.ajax({
        type: 'POST',
        url: '/v1/users',
        processData: false,
        data: JSON.stringify({
          username: username
        }),
        success: function(data) {
          if (utilities.hasStorage()) {
            var userData = {
              username: username,
              jwt: data.token
            };
            localStorage.setItem('user', JSON.stringify(userData));
            resolve();
          }
        },
        error: function(e) {
          console.log(e);
          reject(e);
        },
        dataType: 'json',
        contentType: 'application/json'
      });
    });
  },

  /* Sets the Access Token Header that will go with 
     all requests to the Annotation Storage API

     Have to pass it the app instance TODO: Is there a better way?

  */
  setHeader: function(app) {
    // Check if localstorage has a user, if so add jwt header
    if (utilities.hasStorage()) {
      var userString = localStorage.getItem('user'),
        user;
      if (userString) {
        try {
          // If there is a user object add the associated jwt to header
          user = JSON.parse(userString);
          if (user.jwt) app.annotations.store.setHeader('X-Access-Token', user.jwt);
        } catch(e) {
        console.log(e);
        }
      }
    }
  }

};

module.exports = user;
