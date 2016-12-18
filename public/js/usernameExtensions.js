'use strict';

var Promise = require('bluebird');
var $ = require('jquery');
var annotator = require('annotator');
var user = require('./user.js');
var util = annotator.util;
var _t = util.gettext;

/* I'm exporting it this way as I seem to need a reference to the App
   in order to set the header for the annotation storage instance
   which is part of the app. TODO: find a better way of handling this

*/
module.exports = function(app) {

  return {

    /* Annotator Extension that allows entry of username for annotation

      *  Displays an editable username field when editing
      *  Displays an input field for username when adding new annotation
    	 If the user is not created successfully displays an error message

    */
    editor: function(e) {
      // The input element added to the Annotator.Editor wrapped in jQuery.
      // Cached to save having to recreate it everytime the editor is displayed.
      var field = null;
      var input = null;

      function updateField(field, annotation) {
        var username = user.getCurrentUsername();
        input.val(username);

        if (annotation.id) {
          // If the annotation is being edited then disable username
          input.prop('disabled', true);
          input.css('color', 'gray');
        } else {
          // Otherwise make sure it is enabled
          input.prop('disabled', false);
          input.css('color', 'black');
        }
      }

      function setAnnotationUser(field, annotation) {
        return new Promise(function(resolve, reject) {

          // Get username as entered
          var newUsername = input.val();

          // Get username as loaded from localStorage
          var username = user.getCurrentUsername();

          // If they don't match then create the user and try to set the user in localStorage
          if (newUsername !== username && newUsername.length > 0) {
            user.createUser(newUsername).then(function() {
              user.setHeader(app);
              resolve();
            }).catch(function(error) {
              // Almost certainly username exists already, but output error for the interested types
              console.log(error);
              input.parent().children('p').remove();
              input.parent().append('<p style="color:red">That username is already taken.</p>');
              input.on('keydown', function() {
                input.parent().children('p').remove();
              });
            });
          } else {
            resolve();
          }
        });
      }

      field = e.addField({
        label: _t('username (optional)') + '\u2026',
        load: updateField,
        submit: setAnnotationUser
      });

      input = $(field).find(':input');
    },

    /* Annotator Viewer Extension that shows current username (if any)

    */
    viewer: function(v) {
      function updateViewer(field, annotation, controller) {
        field = $(field);
        field.html('<span>' + annotation.username + '</span>');

        // Hide edit/delete controls unless current username is originator
        var username = user.getCurrentUsername();
        if (username!==annotation.username) {
          controller.hideEdit();
          controller.hideDelete();
        }
      }

      v.addField({
        load: updateViewer
      });
    }
  };
};
