#!/usr/bin/env node
var Resizer = require('./lib/Resizer');
var config = require('./config');

var VERSION = require('./package.json').version;

var optimist = require('optimist')
    .wrap(100)
    .usage('$0 OPTIONS')
    .options('input', {
      describe: 'The prefix of the iOS image files.',
      alias: 'i',
      default: Resizer.Defaults.ORIGINAL_ICON_FILE_NAME
    })
    .options('inputsize', {
      describe: 'The size, in pixels, of the input file.',
      alias: 'is',
      default: Resizer.Defaults.ORIGINAL_SIZE
    })
    .options('iosprefix', {
      describe: 'The prefix of the iOS image files.',
      default: Resizer.Defaults.IOS_FILE_NAME_PREFIX
    })
    .options('iosof', {
      describe: 'The output folder for the iOS icons.',
      default: Resizer.Defaults.IOS_OUTPUT_FOLDER
    })
    .options('androidof', {
      describe: 'The output folder for the Android icons.',
      default: Resizer.Defaults.ANDROID_OUTPUT_FOLDER
    })
    .options('androidofn', {
      describe: 'The output file name for the Android icons.',
      default: Resizer.Defaults.ANDROID_OUTPUT_FILE_NAME
    })
    .options('platforms', {
      describe: 'For which platforms should the icons be resized. Comma-separated list.\nPossible values: ' + Resizer.Defaults.PLATFORMS_TO_BUILD.join(', '),
      default: Resizer.Defaults.PLATFORMS_TO_BUILD.join(',')
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

if (argv.input) {
  options.originalIconFilename = argv.input;
}

if (argv.inputsize) {
  options.originalSize = argv.inputsize;
}

if (argv.platforms) {
  options.platformsToBuild = argv.platforms.split(',');
}

Resizer.resize(options, function (err) {
  if (err) {
    console.log('Error performing resizing: ' + err);
  }
});