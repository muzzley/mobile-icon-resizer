var exec = require('child_process').exec;
var path = require('path');
var async = require('async');
var mkdirp = require('mkdirp');
var config = require('../config');

var Defaults = {
  PLATFORMS_TO_BUILD: ['ios', 'android'],
  ORIGINAL_ICON_FILE_NAME: 'appicon_1024.png',
  ORIGINAL_SIZE: 1024,
  IOS_FILE_NAME_PREFIX: 'Icon',
  IOS_OUTPUT_FOLDER: '.',
  ANDROID_OUTPUT_FOLDER: '.',
  ANDROID_OUTPUT_FILE_NAME: 'Icon.png'
};

// Convert "29x29" to 29 or "2x" to 2
function getSize(str) {
  return str.split("x")[0].trim();
}

function getSizeFromRatio(options) {
  var ratio = eval(options.ratio); // Yeah, eval... Deal with it!
  return Math.floor(options.originalSize * ratio);
}

function executeResize(options, callback) {
  var dimensions = options.size + 'x' + options.size;
  var command = 'convert ' + options.inputFile + ' -thumbnail ' + dimensions + ' ' + options.outputFile;

  child = exec(command,
    function (err, stdout, stderr) {
      if (stderr) {
        console.log('stderr: ' + stderr);
      }
      if (err !== null) {
        console.log('exec error: ' + err);
      }
      callback(err);
  });
}

function convertiOS(options, callback) {
  var images = config.iOS.images;

  function handleImage(image, done) {
    var size = getSize(image.size);
    var scale = getSize(image.scale);
    var finalSize = size * scale;
    var baseFolder = options.iosOutputFolder;
    mkdirp.sync(baseFolder);
    var fileName = path.join(baseFolder, options.iosFilenamePrefix + image.filename);
    executeResize(
      {
        inputFile: options.originalIconFilename,
        size: finalSize,
        outputFile: fileName
      },
      function (err) {
        done(err);
      }
    );
  }

  async.each(
    images,
    handleImage,
    function (err) {
      callback(err);
    }
  );
}

/**
 * 
 * @param  {[type]}   options  Parameters:
 *                             - originalSize
 * @param  {Function} callback
 * @return {undefined}
 */
function convertAndroid(options, callback) {
  var images = config.android.images;

  function handleImage(image, done) {
    var size = getSizeFromRatio({ originalSize: options.originalSize, ratio: image.ratio});
    var baseFolder = path.join(options.androidOutputFolder, image.folder);
    mkdirp.sync(baseFolder);
    var fileName = path.join(baseFolder, options.androidOutputFilename);
    executeResize(
      {
        inputFile: options.originalIconFilename,
        size: size,
        outputFile: fileName
      },
      function (err) {
        done(err);
      }
    );
  }

  async.each(
    images,
    handleImage,
    function (err) {
      callback(err);
    }
  );
}

var platformConverters = {
  'android': convertAndroid,
  'ios': convertiOS
};

/**
 * The entry method to batch resize images for Android and/or iOS.
 * 
 * @param  {[type]} options The following params are supported:
 *                          - platformsToBuild: For which platforms should the icons be resized. Comma-separated list.
 *                          - originalIconFilename: The prefix of the iOS image files.
 *                          - originalSize: The size, in pixels, of the input file.
 *                          - iosFilenamePrefix: The prefix of the iOS image files.
 *                          - iosOutputFolder: The output folder for the iOS icons.
 *                          - androidOutputFolder: The output folder for the Android icons.
 *                          - androidOutputFilename: The output file name for the Android icons.
 * @return {[type]}         [description]
 */
var resize = function (options, callback) {
  options = options || {};

  options.platformsToBuild = options.platformsToBuild || Defaults.PLATFORMS_TO_BUILD;
  options.originalIconFilename = options.originalIconFilename || Defaults.ORIGINAL_ICON_FILE_NAME;
  options.originalSize = options.originalSize || Defaults.ORIGINAL_SIZE;
  options.iosFilenamePrefix = options.iosFilenamePrefix || Defaults.IOS_FILE_NAME_PREFIX;
  options.iosOutputFolder = options.iosOutputFolder || Defaults.IOS_OUTPUT_FOLDER;
  options.androidOutputFolder = options.androidOutputFolder || Defaults.ANDROID_OUTPUT_FOLDER;
  options.androidOutputFilename = options.androidOutputFilename || Defaults.ANDROID_OUTPUT_FILE_NAME;

  async.each(
    options.platformsToBuild,
    function (item, callback) {
      if (typeof platformConverters[item] !== 'function') {
        console.error('Platform type "'+item+'" is not supported.');
        return;
      }
      platformConverters[item](options, callback);
    },
    callback
  );

};

exports = module.exports = {
  resize: resize,
  Defaults: Defaults
};