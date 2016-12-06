'use strict';

var $ = require('jquery');
var annotator = require('annotator');
var user = require('./user.js');
var usernameExtensions = require('./usernameExtensions.js');
var annotationEvents = require('./annotationEvents.js');
var utilities = require('./utilities.js');

$(function() {

  var app = new annotator.App(),
    extensions = usernameExtensions(app),
    currentPathname = utilities.currentPathname();

  app.include(annotator.ui.main, {
    editorExtensions: [extensions.editor],
    viewerExtensions: [extensions.viewer]
  });

  app.include(annotator.storage.http, {
    prefix: '/v1/'
  });

  app.include(annotationEvents);

  // Kick it off
  app.start().then(function() {
    user.setHeader(app);
    app.annotations.load({
      pathname: currentPathname
    });
  });

});