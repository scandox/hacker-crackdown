'use strict';

var fs = require('fs');
var archiver = require('archiver');
var data = require('../controllers/');
var tar = require('tar-stream');
var tarfs = require('tar-fs');
var gunzip = require('gunzip-maybe');

/* Downloads annotations and returns function that can create and 
   stream a tar file of all annotations and static site bundle

*/
function download() {
  return new Promise(function(resolve, reject) {
    data.annotations.getAll(true).then(function(annotations) {
      return getArchiveStreamFunction(JSON.stringify(annotations));
    }).then(function(tarStreamFunction) {
      resolve(tarStreamFunction);
    }).catch(function(error) {
      reject(error);
    });
  });
}

/*  Returns a Promise that should resolve to a Function that 
    will pipe a tar file with data and static site to a writeStream

    If you pass the response object to this function - it downloads
    a file
*/
function getArchiveStreamFunction(annotationData) {
  return new Promise(function(resolve, reject) {
    // Pack up the static site and pipe it to our writeStream
    var readStream = tarfs.pack(__dirname + '/../public/build/'),
      tarData;

    readStream.on('error', function(err) {
      reject(err);
    });

    readStream.on('data', function(chunk) {
      if (tarData) {
        tarData = Buffer.concat([tarData, chunk]);
      } else {
        tarData = new Buffer(chunk);
      }
    });

    readStream.on('end', function() {
      var pack = tar.pack();

      pack.entry({
        name: 'annotationDB.json'
      }, annotationData)

      pack.entry({
        name: 'site.tar'
      }, tarData, function(err) {
        if (err)
          throw err;
        pack.finalize();
      });

      var packStreamFunc = pack.pipe.bind(pack, gunzip());
      resolve(packStreamFunc);
    });
  });
}

module.exports = download;
