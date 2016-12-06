'use strict';

module.exports = function(sequelize, dataTypes) {

  var User = sequelize.define('user', {
    username: {
      type: dataTypes.STRING,
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
