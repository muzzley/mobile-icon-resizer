var exec = require('child_process').exec;
var path = require('path');
var async = require('async');
var mkdirp = require('mkdirp');
var sizeOf = require('image-size');

var defaults = {
  PLATFORMS_TO_BUILD: ['ios', 'android'],
  ORIGINAL_ICON_FILE_NAME: 'appicon_1024.png',
  IOS_FILE_NAME_PREFIX: 'Icon',
  IOS_OUTPUT_FOLDER: '.',
  ANDROID_OUTPUT_FOLDER: '.',
  ANDROID_BASE_SIZE: 48
};

// Convert "29x29" to 29 or "2x" to 2
function getSize(str) {
  return str.split("x")[0].trim();
}

/**
 * Calculate the target image size based on the size ratio
 * from the original input image size or base image size.
 * 
 * @param  {object} options An object with the following properties:
 *                          - originalSize
 *                          - ratio
 * @return {[type]}         [description]
 */
function getSizeFromRatio(options) {
  var ratio = eval(options.ratio); // Yeah, eval... Deal with it!
  return Math.floor(options.size * ratio);
}

function executeResize(options, callback) {
  var dimensions = options.size + 'x' + options.size;
  var command = 'convert "' + options.inputFile + '" -thumbnail ' + dimensions + ' "' + options.outputFile + '"';

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
  var images = options.config.iOS.images;

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
  var images = options.config.android.images;

  function handleImage(image, done) {
    var size = 100;
    if (image.baseRatio) {
      size = getSizeFromRatio({ size: options.androidBaseSize, ratio: image.baseRatio});
    } else if (image.ratio) {
      size = getSizeFromRatio({ size: options.originalSize, ratio: image.ratio});
    } else if (image.size) {
      size = getSize(image.size);
    } else {
      return done(new Error('No size nor ratio defined for Android icon'));
    }

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
 *                          - iosFilenamePrefix: The prefix of the iOS image files.
 *                          - iosOutputFolder: The output folder for the iOS icons.
 *                          - androidOutputFolder: The output folder for the Android icons.
 *                          - androidOutputFilename: The output file name for the Android icons.
 *                          - androidBaseSize: The base size to consider for the `baseRatio` calculation.
 * @return {[type]}         [description]
 */
var resize = function (options, callback) {
  options = options || {};

  options.platformsToBuild = options.platformsToBuild || defaults.PLATFORMS_TO_BUILD;
  options.originalIconFilename = options.originalIconFilename || defaults.ORIGINAL_ICON_FILE_NAME;
  options.iosFilenamePrefix = options.iosFilenamePrefix || defaults.IOS_FILE_NAME_PREFIX;
  options.iosOutputFolder = options.iosOutputFolder || defaults.IOS_OUTPUT_FOLDER;
  options.androidOutputFolder = options.androidOutputFolder || defaults.ANDROID_OUTPUT_FOLDER;
  options.androidOutputFilename = options.androidOutputFilename || path.basename(options.originalIconFilename);
  options.androidBaseSize = options.androidBaseSize || defaults.ANDROID_BASE_SIZE;

  var dimensions = sizeOf(options.originalIconFilename);
  options.originalSize = Math.max(dimensions.width, dimensions.height);

  // Load the actual config object from a custom file or our default config
  options.config = (options.config) ? require(path.resolve(options.config)) : require('../config');

  async.each(
    options.platformsToBuild,
    function (item, done) {
      if (typeof platformConverters[item] !== 'function') {
        return done(new Error('Platform type "'+item+'" is not supported.'));
      }
      platformConverters[item](options, done);
    },
    callback
  );
};

resize.defaults = defaults;
exports = module.exports = resize;
