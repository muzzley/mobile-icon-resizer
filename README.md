# Mobile Icon Resizer

This tool can be used to resize iOS and Android application icons in batch. That is, given a 1024x1024 icon, this tool will generate all necessary icon sizes.

## Dependencies

The tool itself is a Node.js app/module so you'll need to have Node.js v0.8+ installed.

The image resizing is done with [ImageMagick](http://www.imagemagick.org/). Make sure you have ImageMagick's `convert` command available in the command line.  Windows users, see [Windows Support](#windows-support) section below.

## Installation

To install the tool as another Node.js module's dependency, run the following command:

    npm install mobile-icon-resizer

To install it globally as an executable binary, install it as follows:

    npm install mobile-icon-resizer -g

## Usage

This tool can either be used as a standalone application or as a module directly from within another Node.js module.

### Module

    var resize = require('mobile-icon-resizer');
    var options = {
      // Your options here
    };
    resize(options, function (err) {
    });

The `resize()` function's `options` argument takes the following optional parameters:

* **platformsToBuild**: For which platforms should the icons be resized. Comma-separated list. Possible values ['ios', 'android']
* **originalIconFilename**: The original image's relative path and filename such as '../someIcon.png'. Default: 'appicon_1024.png'.
* **iosFilenamePrefix**: The prefix of the iOS image files. Default: 'Icon'.
* **iosOutputFolder**: The output folder for the iOS icons. Default: '.'.
* **androidOutputFolder**: The output folder for the Android icons. Default: '.'.
* **androidOutputFilename**: The output file name for the Android icons.
* **androidBaseSize**: The base size, in pixels, to consider for the `baseRatio`calculation. Default: 48.
* **config**: Optional path to a `.js` or `.json` file that defines the thumbnail size configuration. Default: use the built-in `config.js` file.
* **convertBin**:  *Windows machines only*.  See [Windows Support](#windows-support) below.  Default `convert`.


### Standalone Application

You can run the tool as an application like this:

    mobile-icon-resizer OPTIONS

The application can write its usage documentation to the command line. To view it, run:

    mobile-icon-resizer -h

Example output:

    mobile-icon-resizer OPTIONS

    Options:
      --input, -i        The prefix of the iOS image files.                                   [required]
      --iosprefix        The prefix of the iOS image files.                            [default: "Icon"]
      --iosof            The output folder for the iOS icons.                             [default: "."]
      --androidof        The output folder for the Android icons.                         [default: "."]
      --androidofn       The output file name for the Android icons.
      --androidbs        The base size, in pixels, for `baseRatio` sizing calculation.     [default: 48]
      --platforms        For which platforms should the icons be resized. Comma-separated list.
                         Possible values: ios, android                          [default: "ios,android"]
    
      --config           A file with custom thumbnail sizes configuration.
      --convertbin       Windows only.  See 'Windows Support' in ReadMe File.  	   [default:  "convert"]
    
      -v, --version      Print the script's version.
      -h, --help         Display this help text.

Example execution:

    mobile-icon-resizer -i appicon_1024.png --iosprefix="Icon" --iosof=output/ios --androidof=output/android --config=custom-sizes.js

## Thumbnail sizes configuration

By default, the thumbnail sizes that are generated are the ones defined in the provided [config.js](//github.com/muzzley/mobile-icon-resizer/blob/master/config.js) file.

## Android Sizing Options

The Android icon sizes can be defined in three different ways. A single configuration can use mixed sizing types in the same configuraion.

**`size`**

This is the way to define absolute sizes.

Here's an example to generate the 512x512 app icon that should be submitted to the Play Store:

    {
      "size": "512x512",
      "folder" : "WEB"
    }

**`baseRatio`**

This is the preferred way to define the target size of the different icons. The base size set through the `--androidbs` parameter (`48` by default) is multiplied by the `baseRatio` value.

In the following example we're generating an icon with the size 72x72 (1.5 * 48).

    {
      "baseRatio" : "1.5",
      "folder" : "drawable-hdpi"
    }

**`ratio`**

Legacy way of defining the target size based on the original input file's dimensions.

Given an input image with size 1024x1024, the following example would generate an image with size 256x256.

    {
      "ratio" : "1/4",
      "folder" : "drawable-mdpi"
    }


## Custom sizing

You can optionally define a file with a custom set of thumbnail size settings and use that instead. The file is either a CommonJS JavaScript file or a plain JSON file.

### CommonJS JavaScript File

Example:

    var config = {
      iOS: {
        "images": [
          {
            "size" : "29x29",
            "idiom" : "iphone",
            "filename" : "-Small.png", // The filename will be prefixed with the provided iOS filename prefix
            "scale" : "1x"
          },
          {
            "size" : "29x29",
            "idiom" : "iphone",
            "filename" : "-Small@2x.png",
            "scale" : "2x"
          },
          // ...
          {
            "size" : "76x76",
            "idiom" : "ipad",
            "filename" : "-76@2x.png",
            "scale" : "2x"
          }
        ]
      },
      android: {
        "images" : [
          {
            "baseRatio" : "1",
            "folder" : "drawable-mdpi"
          },
          // ...
          {
            "baseRatio" : "4",
            "folder" : "drawable-xxxhdpi"
          },
          {
            "size": "512x512",
            "folder" : "WEB"
          }
        ]
      }
    };
    
    // Don't forget to export the config object!
    exports = module.exports = config;

### Plain JSON File

Example:

    {
      "iOS": {
        "images": [
          {
            "size" : "29x29",
            "idiom" : "iphone",
            "filename" : "-Small.png", // The filename will be prefixed with the provided iOS filename prefix
            "scale" : "1x"
          },
          // ...
        ]
      },
      "android": {
        "images" : [
          {
            "baseRatio" : "1",
            "folder" : "drawable-mdpi"
          },
          // ...
        ]
      }
    }



## Windows Support

Because Windows has a system file named `convert.exe`, many ImageMagick users on Windows rename the ImageMagick version of `convert.exe` to something like `iconvert.exe` ( see [this StackOverflow answer](http://stackoverflow.com/a/28876385/1167442) ).  

You will also need to ensure that the directory that holds the ImageMagick binaries is included in your `path` variable.

In addition, add the `convertBin` property to your configuration file or pass it as a command line parameter as specified above, and set the value to whatever you have renamed the `convert` binary to, e.g. `iconvert` ( the extension is not necessary ).
