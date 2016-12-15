"use strict";
var annotator = require('annotator');
var util = annotator.util;
var _t = util.gettext;
// TODO: Replace with NPM package when it is updated
var mmd = require('./micromarkdown.js');

/* If the annotation has text renders markdown as HTML

*/
var render = exports.render = function render(annotation) {
    var convert = mmd.parse;

    if (annotation.text) {
        return convert(annotation.text);
    } else {
        return "<i>" + _t('No comment') + "</i>";
    }
};

/* Extension to render markdown into HTML

   My replacement for annotator built in extension using Showdown
   which I could not get to work and which seemed a tad OTT

   This uses Micromarkdown: http://simonwaldherr.github.io/micromarkdown.js/

*/
exports.viewer = function viewerExtension(v) {
    v.setRenderer(render);
};
