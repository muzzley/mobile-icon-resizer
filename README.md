# Mobile Icon Converter

This tool can be used to resize iOS and Android application icons in batch. That is, given a 1024x1024 icon, this tool will generate all necessary icon sizes.

## Dependencies

The tool itself is a Node.js app/module so you'll need to have Node.js v0.8+ installed.

The image resizing is done with [ImageMagick](http://www.imagemagick.org/). Make sure you have ImageMagick's `convert` command available in the command line.

## Installation

To install the project's Node.js module dependencies run the following command:

    npm install

## Usage

This tool can either be used as a standalone application or as a module directly from within another Node.js module.

### ModuleResizer

    var Resizer = require('mobile-icon-resizer').Resizer;
    var options = {
      // Your options here
    };
    Resizer.resize(options, function (err) {
    });

The `resize()` function's `options` argument takes the following optional parameters:

* **platformsToBuild**: For which platforms should the icons be resized. Comma-separated list. Possible values ['ios', 'android']
* **originalIconFilename**: The original image's relative path and filename such as '../someIcon.png'. Default: 'appicon_1024.png'.
* **originalSize**: The size, in pixels, of the input file. Default: 1024.
* **iosFilenamePrefix**: The prefix of the iOS image files. Default: 'Icon'.
* **iosOutputFolder**: The output folder for the iOS icons. Default: '.'.
* **androidOutputFolder**: The output folder for the Android icons. Default: '.'.
* **androidOutputFilename**: The output file name for the Android icons. Default: 'Icon.png'.

### Standalone Application

You can run the tool as an application like this:

    node resize.js OPTIONS

The application can write its usage documentation to the command line. To view it, run:

    node resize.js -h

Example output:

    node ./resize.js OPTIONS

    Options:
      --input, -i        The prefix of the iOS image files.                [default: "appicon_1024.png"]
      --inputsize, --is  The size, in pixels, of the input file.                         [default: 1024]
      --iosprefix        The prefix of the iOS image files.                            [default: "Icon"]
      --iosof            The output folder for the iOS icons.                             [default: "."]
      --androidof        The output folder for the Android icons.                         [default: "."]
      --androidofn       The output file name for the Android icons.               [default: "Icon.png"]
      --platforms        For which platforms should the icons be resized. Comma-separated list.
                         Possible values: ios, android                          [default: "ios,android"]
      -v, --version      Print the script's version.                                                    
      -h, --help         Display this help text.

Example execution:

    node resize.js -i appicon_1024.png --iosprefix="Icon" --iosof=output/ios --androidof=output/android

## TODO

* Allow passing the target sizes for each platform (iOS and Android) as a parameter. Currently they're hard coded in the `config.js` file.