#!/usr/bin/env node

var exec = require('child_process').exec;
var path = require('path');
var async = require('async');
var mkdirp = require('mkdirp');
var config = require('./config');

var VERSION = require('./package.json').version;

var ORIGINAL_ICON_FILE_NAME = 'appicon_1024.png';
var ORIGINAL_SIZE = 1024;
var IOS_FILE_NAME_PREFIX = 'Icon';
var IOS_OUTPUT_FOLDER = '.';
var ANDROID_OUTPUT_FOLDER = '.';
var ANDROID_OUTPUT_FILE_NAME = 'Icon.png';

var PLATFORMS_TO_BUILD = ['ios', 'android'];

var optimist = require('optimist')
    .wrap(100)
    .usage('$0 OPTIONS')
    .options('input', {
      describe: 'The prefix of the iOS image files.',
      alias: 'i',
      default: ORIGINAL_ICON_FILE_NAME
    })
    .options('inputsize', {
      describe: 'The size, in pixels, of the input file.',
      alias: 'is',
      default: ORIGINAL_SIZE
    })
    .options('iosprefix', {
      describe: 'The prefix of the iOS image files.',
      default: IOS_FILE_NAME_PREFIX
    })
    .options('iosof', {
      describe: 'The output folder for the iOS icons.',
      default: IOS_OUTPUT_FOLDER
    })
    .options('androidof', {
      describe: 'The output folder for the Android icons.',
      default: ANDROID_OUTPUT_FOLDER
    })
    .options('androidofn', {
      describe: 'The output file name for the Android icons.',
      default: ANDROID_OUTPUT_FILE_NAME
    })
    .options('platforms', {
      describe: 'For which platforms should the icons be resized. Comma-separated list.\nPossible values: ' + PLATFORMS_TO_BUILD.join(', '),
      default: PLATFORMS_TO_BUILD.join(',')
    })
    .describe('v', 'Print the script\'s version.')
    .alias('v', 'version')
    .describe('h', 'Display this help text.')
    .alias('h', 'help');

var argv = optimist.argv;

if (argv.help) {
  optimist.showHelp();
  process.exit(0);
}

if (argv.version) {
  console.log('Version v' + VERSION);
  process.exit(0);
}

if (argv.iosprefix) {
  IOS_FILE_NAME_PREFIX = argv.iosprefix;
}

if (argv.iosof) {
  // Remove eventually existing trailing slash
  IOS_OUTPUT_FOLDER = argv.iosof.replace(/\/$/, "");
}

if (argv.androidof) {
  // Remove eventually existing trailing slash
  ANDROID_OUTPUT_FOLDER = argv.androidof.replace(/\/$/, "");
}

if (argv.androidofn) {
  ANDROID_OUTPUT_FILE_NAME = argv.androidofn.replace(/\/$/, "");
}

if (argv.input) {
  ORIGINAL_ICON_FILE_NAME = argv.input;
}

if (argv.inputsize) {
  ORIGINAL_SIZE = argv.inputsize;
}

if (argv.platforms) {
  PLATFORMS_TO_BUILD = argv.platforms.split(',');
}

// Convert "29x29" to 29 or "2x" to 2
function getSize(str) {
  return str.split("x")[0].trim();
}

function getSizeFromRatio(fraction) {
  var ratio = eval(fraction); // Yeah, eval... Deal with it!
  return Math.floor(ORIGINAL_SIZE * ratio);
}

function resize(options, callback) {
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

function convertiOS(callback) {
  var images = config.iOS.images;

  function handleImage(image, done) {
    var size = getSize(image.size);
    var scale = getSize(image.scale);
    var finalSize = size * scale;
    var baseFolder = IOS_OUTPUT_FOLDER;
    mkdirp.sync(baseFolder);
    var fileName = path.join(baseFolder, IOS_FILE_NAME_PREFIX + image.filename);
    resize(
      {
        inputFile: ORIGINAL_ICON_FILE_NAME,
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

function convertAndroid(callback) {
  var images = config.android.images;

  function handleImage(image, done) {
    var size = getSizeFromRatio(image.ratio);
    var baseFolder = path.join(ANDROID_OUTPUT_FOLDER, image.folder);
    mkdirp.sync(baseFolder);
    var fileName = path.join(baseFolder, ANDROID_OUTPUT_FILE_NAME);
    resize(
      {
        inputFile: ORIGINAL_ICON_FILE_NAME,
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

async.each(
  PLATFORMS_TO_BUILD,
  function (item, callback) {
    if (typeof platformConverters[item] !== 'function') {
      console.error('Platform type "'+item+'" is not supported.');
      return;
    }
    platformConverters[item](callback);
  },
  function (err) {
    if (err) {
      console.log('Error performing resizing: ' + err);
    }
  }
);

