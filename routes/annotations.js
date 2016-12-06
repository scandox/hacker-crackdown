'use strict';

var express = require('express');
var data = require('../controllers/');
var libError = require('../lib/error');
var download = require('../lib/download');
var router = express.Router();

function authAnyone(req, res, next) {
  var username = req.claims.username;

  data.users.get(username).then(function(user) {
    // This should be rare
    if (username && !user)
      throw new Error('The user doesn\'t exist');

    // If there is no user then just load the anon user
    if (!user) {
      return data.users.get('anon');
    }

    return Promise.resolve(user);
  }).then(function(user) {
    req.user = user;
    next();
  }).catch(function(error) {
    libError.send(res, error);
  });
}

function authUser(req, res, next) {
  var username = req.claims.username;

  data.users.get(username).then(function(user) {
    // This should be rare
    if (username && !user)
      throw new Error('The user doesn\'t exist');

    // If there is no user then just load the anon user
    if (!user || user.username === 'anon') {
      throw new Error('This operation requires a non-anonymous user');
    }

    req.user = user;
    next();
  }).catch(function(error) {
    libError.send(res, error);
  });
}

/* Default route for annotation store implementation

*/
router.get('/', function(req, res) {
  res.send({
    'name': 'Annotator Store API',
    'version': '1.0.0'
  });
});

/* Downloads a dump of the moderated annotation data along
   with a copy of the current codebase

*/
router.get('/download', function(req, res) {
  download().then(function(streamFunc) {
    res.setHeader('content-type', 'application/gzip');
    res.setHeader('Content-disposition', 'attachment; filename=crackdown.tar.gz');
    streamFunc().pipe(res);
  }).catch(function(error) {
    libError.send(res, error);
  });
});

/* Gets all moderated annotations based on a query

   Supported search parameter is pathname

*/
router.get('/search', function(req, res) {
  data.annotations.search({
    annotation: {
      pathname: req.query.pathname
    }
  }, true).then(function(annotations) {
    res.send({
      rows: annotations,
      total: annotations.length
    });
  }).catch(function(error) {
    libError.send(res, error);
  });
});

/* Gets all moderated (OK) annotations

*/
router.get('/annotations', function(req, res) {
  data.annotations.getAll(true).then(function(annotations) {
    res.send(annotations);
  });
});

/* Creates a single annotation

*/
router.post('/annotations', authAnyone, function(req, res) {
  // create the new annotation object with the allowable fields
  var newAnnotation = {
    quote: req.body.quote,
    ranges: req.body.ranges,
    text: req.body.text,
    pathname: req.body.pathname
  };

  data.annotations.create({
    annotation: newAnnotation,
    userId: req.user.id
  }).then(function(annotation) {
    if (!annotation)
      throw new Error('Annotation was not created successfully.');
    // Have to refetch the annotation to have the user attached
    // Sure there's a better way but whatever
    return data.annotations.get(annotation.uuid);
  }).then(function(annotation) {
    res.send(annotation);
  }).catch(function(error) {
    libError.send(res, error);
  });

});

/* Gets a single annotation by Id

*/
router.get('/annotations/:uuid', function(req, res) {
  data.annotations.get(req.params.uuid).then(function(annotation) {
    if (!annotation)
      throw new Error('There is no such Annotation.');
    res.status(200);
    res.send(annotation);
  }).catch(function(error) {
    libError.send(res, error);
  });
});

/* Updates an annotation. The only thing that can be updated is the actual
   text attached to the highlight

*/
router.put('/annotations/:uuid', authUser, function(req, res) {
  var uuid = req.params.uuid;

  data.annotations.get(uuid).then(function(annotation) {
    if (!annotation)
      throw new Error('There is no such Annotation.');
    if (annotation.user.id !== req.user.id)
      throw new Error('This user didn\'t create this annotation.');

    var annotationData = {
      quote: annotation.annotation.quote,
      ranges: annotation.annotation.ranges,
      text: req.body.text,
      pathname: annotation.annotation.pathname
    };

    // TODO: No matter how I twist about I end up either
    // executing way too many queries, OR mixing ORM
    // specific code into other code...
    annotation.setDataValue('annotation', annotationData);

    return Promise.all([
      data.annotations.update(uuid, annotationData),
      Promise.resolve(annotation)
    ]);
  }).then(function([ result, annotation ]) {
    res.status(200);
    res.send(annotation);
  }).catch(function(error) {
    libError.send(res, error);
  });

});

/* Deletes a single annotation by Id

*/
router.delete('/annotations/:uuid', authUser, function(req, res) {

  data.annotations.get(req.params.uuid).then(function(annotation) {
    if (!annotation)
      throw new Error('There is no such Annotation.');
    if (annotation.user.id !== req.user.id)
      throw new Error('This user didn\'t create this annotation.');

    return annotation.destroy();
  }).then(function(result) {
    res.status(204);
    res.send();
  }).catch(function(error) {
    libError.send(res, error);
  });

});

module.exports = router;
