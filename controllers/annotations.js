'use strict';

var models = require('../models/');

var annotations = {

  create: function(annotationData) {
    var newAnnotation = models.annotation.build(annotationData);
    return newAnnotation.save();
  },

  get: function(uuid, isOK) {
    var query = {
      where: {
        uuid: uuid
      },
      include: [{
        model: models.user
      }]
    };
    if (isOK !== undefined)
      query.where.isOK = isOK;
    return models.annotation.findOne(query);
  },

  getAll: function(isOK) {
    return models.annotation.findAll({
      where: {
        isOK: isOK
      }
    });
  },

  search: function(options, isOK) {
    var query = {
      where: options,
      include: [{
        model: models.user
      }]
    };
    if (isOK !== undefined)
      query.where.isOK = isOK;
    return models.annotation.findAll(query);
  },

  /* An edited annotation is always marked as unmoderated

  */
  update: function(uuid, updatedAnnotation) {
    return models.annotation.update({
      annotation: updatedAnnotation,
      isOK: false
    }, {
      where: {
        uuid: uuid
      }
    });
  },

  destroy: function(uuid) {
    return models.annotation.destroy({
      annotation: {
        uuid: uuid
      }
    });
  }

};

module.exports = annotations;
