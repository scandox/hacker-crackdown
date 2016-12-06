'use strict';

var gulp = require('gulp'),
  notify = require('gulp-notify'),
  rename = require('gulp-rename'),
  gutil = require('gulp-util'),
  chalk = require('chalk'),
  browserify = require('browserify'),
  uglify = require('gulp-uglify'),
  duration = require('gulp-duration'),
  source = require('vinyl-source-stream'),
  buffer = require('vinyl-buffer'),
  sourcemaps = require('gulp-sourcemaps'),
  fileinclude = require('gulp-file-include'),
  htmlmin = require('gulp-html-minifier'),
  gulpif = require('gulp-if'),
  del = require('del'),
  fs = require('fs'),
  argv = require('argv'),
  ncp = require('ncp').ncp;

var environment = argv.environment ? argv.environment : 'development',
  config = {
    content: {
      src: './public/content.html',
      template: './public/templates/page.html',
      static: './public/static/',
      output: './public/views/'
    },
    js: {
      src: './public/js/main.js',
      outputDir: './public/build/',
      outputFile: 'hc.min.js'
    },
    html: {
      src: './public/views/*.html',
      outputDir: './public/build/',
      watch: ['./public/views/*.html']
    },
    assets: {
      src: './public/assets/**/*',
      outputDir: './public/build/'
    },
    clean: {
      target: ['./public/build/**/*', './public/views/*.html']
    }
  };


// Get the source of a file
function getSource(file) {
  return new Promise(function(resolve, reject) {
    fs.readFile(file, 'utf-8', function(err, data) {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
}

// Error reporting function
function mapError(err) {
  if (err.fileName) {
    // Regular error
    gutil.log(chalk.red(err.name) + ': ' + chalk.yellow(err.fileName.replace(__dirname + '/src/js/', '')) + ': ' + 'Line ' + chalk.magenta(err.lineNumber) + ' & ' + 'Column ' + chalk.magenta(err.columnNumber || err.column) + ': ' + chalk.blue(err.description));
  } else {
    // Browserify error..
    gutil.log(chalk.red(err.name) + ': ' + chalk.yellow(err.message));
  }
}

// Gulp task for clearing build directory
// Also removes auto generated views
gulp.task('clean', function() {
  del(config.clean.target);
});

gulp.task('client-js', function() {
  var bundler = browserify(config.js.src, {
      debug: false
    }),
    bundleTimer = duration('Javascript bundle time');

  bundler
    .bundle()
    .on('error', mapError) // Map error reporting
    .pipe(source('main.js')) // Set source name
    .pipe(buffer())
    .pipe(sourcemaps.init({
      loadmaps: true,
      debug: true
    }))
    .pipe(uglify({
      compress: {
        unused: false
      }
    }))
    .pipe(rename(config.js.outputFile)) // Rename the output file
    .pipe(gulpif(environment === 'development', sourcemaps.write('./')))
    .pipe(gulp.dest(config.js.outputDir)) // Set the output folder
    .pipe(notify({
      message: 'Generated JS file: <%= file.relative %>'
    })) // Output the file being created
    .pipe(bundleTimer); // Output time timing of the file creation
});

// Gulp task for building HTML static site and minify HTML
gulp.task('client-html', function() {
  // copy in the latest static views
  copyStaticViews().then(function() {
    // Generate the dynamic views from main content file
    return generateViews();
  }).then(function() {

    var bundleTimer = duration('HTML Bundle time');

    // Replace includes with dynamic content
    gulp.src(config.html.src)
      .on('error', mapError)
      .pipe(fileinclude({
        prefix: '@@',
        basepath: '@file'
      }))
      .pipe(htmlmin({
        collapseWhitespace: true
      }))
      .pipe(gulp.dest(config.html.outputDir))
      .pipe(notify({
        message: 'Generated HTML files: <%= file.relative %>'
      }))
      .pipe(bundleTimer);

  }).catch(function(error) {
    console.log(error);
  });
});

// Gulp task for assets
gulp.task('client-assets', function() {
  var bundleTimer = duration('HTML Bundle time');
  gulp.src(config.assets.src)
    .on('error', mapError)
    .pipe(gulp.dest(config.assets.outputDir))
    .pipe(bundleTimer);
});

function getSectionHeaderValue(id, section) {
  var starting = '<!--' + id + ':',
    ending = '-->',
    start = section.indexOf(starting),
    end = section.indexOf(ending, start);

  if (start > -1 && end > start) {
    return section.substring(start + starting.length, end);
  } else {
    return undefined;
  }
}

// Gulp task to split content
// It's not really a Gulpish task per se, just running it here for convenience
function generateViews() {
  return new Promise(function(resolve, reject) {

    // Get file main content source and template source
    var getContentSource = getSource(config.content.src);
    var getTemplateSource = getSource(config.content.template);

    Promise.all([getContentSource, getTemplateSource]).then(function([ content, template ]) {
      // Split into array of section objects
      var currentDisplayTitle = '';
      var sections = content.split('<!--SECTION-->').map(function(section) {
        if (!section) return;

        var title = getSectionHeaderValue('TITLE', section),
          next = getSectionHeaderValue('NEXT', section),
          previous = getSectionHeaderValue('PREVIOUS', section),
          displayTitle = getSectionHeaderValue('DISPLAY-TITLE', section);

        if (displayTitle !== undefined)
          currentDisplayTitle = displayTitle;

        return {
          title: title,
          next: next,
          previous: previous,
          content: section,
          displayTitle: currentDisplayTitle
        };
      });

      // Generate view html with template and section content
      // Including previous and next links if available
      var processSections = sections.map(function(section) {
        if (!section) {
          return;
        }

        // Write to appropriately named file based on section title
        var fileContent = template.replace('<!--CONTENT-->', section.content),
          fileName = section.title.toLowerCase() + '.html';

        // Put in next and prev links
        if (section.next) {
          fileContent = fileContent.replace('<!--NEXT-->', '<a href=\'' + section.next.toLowerCase() + '.html\'>Next</a>');
        } else {
          fileContent = fileContent.replace('<!--NEXT-->', '<a href=\'https://en.wikipedia.org/wiki/Bruce_Sterling\'>Bruce Sterling</a>');
        }
        if (section.previous)
          fileContent = fileContent.replace('<!--PREVIOUS-->', '<a href=\'' + section.previous.toLowerCase() + '.html\'>Previous</a>');
        if (section.displayTitle)
          fileContent = fileContent.replace('<!--DISPLAY-TITLE-->', '<p style=\'text-align:right; border-bottom: 3px solid black\'>' + section.displayTitle + '</p><p></p>');

        fs.writeFile(config.content.output + fileName, fileContent, function(err) {
          if (err) {
            console.log('Error Writing File');
          }
        });
      });

      return Promise.all(processSections);
    }).then(function() {
      resolve('Done!');
    }).catch(function(error) {
      reject(error);
    });
  });
}

function copyStaticViews() {
  return new Promise(function(resolve, reject) {
    ncp.limit = 256;
    ncp(config.content.static, config.content.output, function(err) {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}

gulp.task('default', ['client-js', 'client-html', 'client-assets']);
