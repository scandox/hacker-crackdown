'use strict';

module.exports = function(sequelize, dataTypes) {

  var User = sequelize.define('user', {
    username: {
      type: 'citext',
      unique: true,
      allowNull: false
    }
  },
    {
      classMethods: {
        associate: function(models) {}
      },
      hooks: {
      },
      instanceMethods: {
      }
    });
  return User;
};
