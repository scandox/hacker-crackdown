'use strict';

var nodeUUID = require('node-uuid');

module.exports = function(sequelize, dataTypes) {
  var Annotation = sequelize.define('annotation', {
    uuid: {
      type: dataTypes.STRING,
      allowNull: false,
      unique: true
    },
    annotation: {
      type: dataTypes.JSONB,
      allowNull: false
    },
    isOK: {
      type: dataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
    {
      classMethods: {
        associate: function(models) {
          Annotation.belongsTo(models.user, {
            onDelete: 'CASCADE'
          });
        }
      },
      hooks: {
        beforeValidate: function(annotation, options) {
          // Only set uuid on Creation
          if (!annotation.uuid) {
            annotation.uuid = nodeUUID.v4();
          }
        }
      },
      instanceMethods: {
        toJSON: function() {
          var result = this.annotation;
          result.id = this.uuid;
          if (this.user)
            result.username = this.user.username;
          return result;
        }
      }
    });
  return Annotation;
};
