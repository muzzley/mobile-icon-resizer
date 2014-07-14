#!/usr/bin/env node

var path = require('path');
var resize = require('./lib/resize');

var VERSION = require('./package.json').version;

var optimist = require('optimist')
    .wrap(100)
    .usage('$0 OPTIONS')
    .options('input', {
      describe: 'The prefix of the iOS image files.',
      alias: 'i',
      default: resize.defaults.ORIGINAL_ICON_FILE_NAME
    })
    .options('iosprefix', {
      describe: 'The prefix of the iOS image files.',
      default: resize.defaults.IOS_FILE_NAME_PREFIX
    })
    .options('iosof', {
      describe: 'The output folder for the iOS icons.',
      default: resize.defaults.IOS_OUTPUT_FOLDER
    })
    .options('androidof', {
      describe: 'The output folder for the Android icons.',
      default: resize.defaults.ANDROID_OUTPUT_FOLDER
    })
    .options('androidofn', {
      describe: 'The output file name for the Android icons.'
    })
    .options('androidbs', {
      describe: 'The base size, in pixels, for `baseRatio` sizing calculation.',
      default: resize.defaults.ANDROID_BASE_SIZE
    })
    .options('platforms', {
      describe: 'For which platforms should the icons be resized. Comma-separated list.\nPossible values: ' + resize.defaults.PLATFORMS_TO_BUILD.join(', '),
      default: resize.defaults.PLATFORMS_TO_BUILD.join(',')
    })
    .options('config', {
      describe: 'A file with custom thumbnail sizes configuration.'
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

var options = {};

if (argv.iosprefix) {
  options.iosFilenamePrefix = argv.iosprefix;
}

if (argv.iosof) {
  // Remove eventually existing trailing slash
  options.iosOutputFolder = argv.iosof.replace(/\/$/, "");
}

if (argv.androidof) {
  // Remove eventually existing trailing slash
  options.androidOutputFolder = argv.androidof.replace(/\/$/, "");
}

if (argv.androidofn) {
  options.androidOutputFilename = argv.androidofn.replace(/\/$/, "");
}

if (argv.androidbs) {
  options.androidBaseSize = argv.androidbs;
}

if (argv.input) {
  options.originalIconFilename = argv.input;
}

if (argv.platforms) {
  options.platformsToBuild = argv.platforms.split(',');
}

if (argv.config) {
  options.config = argv.config;
}

resize(options, function (err) {
  if (err) {
    console.log('Error performing resizing: ' + err);
  }
});
