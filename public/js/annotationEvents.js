'use strict';

var annotator = require('annotator');
var utilities = require('./utilities.js');
var currentPathname = utilities.currentPathname();

/* Local Functions */

/*  Draws unmoderated annotations (i.e. those loaded locally)
 
*/
function highlightUnmoderated(annotations) {
  var highlighter = new annotator.ui.highlighter.Highlighter(document.body, {
    highlightClass: 'annotator-hl annotator-hl-temporary'
  });
  highlighter.drawAll(annotations);
}

/*  Redraws a single unmoderated annotation (i.e. after an edit 
    an annotation becomes unmoderated again)

*/
function redrawUnmoderated(annotation) {
  var highlighter = new annotator.ui.highlighter.Highlighter(document.body, {
    highlightClass: 'annotator-hl annotator-hl-temporary'
  });
  highlighter.redraw(annotation);
}

/*  Load all annotations stored locally 

    Assumes localStorage so only call it once that has been established
*/
function loadLocalAnnotations() {
  var localAnnotations = localStorage.getItem('annotations');

  if (localAnnotations) {
    try {
      localAnnotations = JSON.parse(localAnnotations);
    } catch(e) {
    console.log(e);
    localAnnotations = [];
    }
  } else {
    localAnnotations = [];
  }

  return localAnnotations;
}

/*  Replace local annotations with new array of annotations

    Assumes localStorage so only call it once that has been established
*/
function saveLocalAnnotations(annotations) {
  // Store the revised set locally
  localStorage.setItem('annotations', JSON.stringify(annotations));
}

/* Exported Object 

   Code for various events within annotator object

*/

var eventHandlers = {

  beforeAnnotationCreated: function(annotation) {
    // Add page path to the annotation object before it gets created
    annotation.pathname = currentPathname;
  },

  annotationCreated: function(annotation) {
    // Add annotation to localStorage so that originator can see it
    // even if it hasn't been approved yet by the moderator
    if (utilities.hasStorage()) {
      var localAnnotations = loadLocalAnnotations();
      localAnnotations.push(annotation);
      saveLocalAnnotations(localAnnotations);
    }

    redrawUnmoderated(annotation);
  },

  annotationsLoaded: function(annotations) {
    if (utilities.hasStorage()) {
      // Compare these annotations loaded from store with the ones
      // In the local storage (if any). Weed out any from local storage
      // that exist in the store (because they've been approved)
      var localAnnotations = loadLocalAnnotations();
      // Filter them based on id
      var filteredLocalAnnotations = localAnnotations.filter(function(annotation) {
        var isLive = annotations.find(function(element) {
          return element.id === annotation.id;
        });

        return !isLive;
      });

      // Resave the local annotations with only the non-live ones
      saveLocalAnnotations(filteredLocalAnnotations);

      // Now filter out those irrelevant to this page
      localAnnotations = filteredLocalAnnotations.filter(function(annotation) {
        return annotation.pathname === currentPathname;
      });

      // Finally manually display these locally-sourced annotations with different color
      highlightUnmoderated(localAnnotations);
    }
  },

  beforeAnnotationDeleted: function(annotation) {
    // Remove relevant annotation from localStorage if present
    // Worst case scenario: delete fails on server and annotation is lost from view
    // of original poster. Once moderated it will reappear.
    if (utilities.hasStorage()) {
      var localAnnotations = loadLocalAnnotations();
      // Filter them based on Code
      var filteredLocalAnnotations = localAnnotations.filter(function(localAnnotation) {
        return localAnnotation.id !== annotation.id;
      });
      saveLocalAnnotations(filteredLocalAnnotations);
    }
  },

  annotationUpdated: function(annotation) {
    // Update relevant annotation in localStorage if present
    if (utilities.hasStorage()) {
      var localAnnotations = loadLocalAnnotations();
      // Filter them based on Code
      var filteredLocalAnnotations = localAnnotations.filter(function(localAnnotation) {
        return localAnnotation.id !== annotation.id;
      });
      filteredLocalAnnotations.push(annotation);
      saveLocalAnnotations(filteredLocalAnnotations);
    }

    // Redraw the annotation with the correct colour
    redrawUnmoderated(annotation);
  }

};

module.exports = function() {
  return eventHandlers;
};
