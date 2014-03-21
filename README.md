# Mobile Icon Converter

The script `index.js` can be used to resize iOS and Android application icons in batch. That is, given a 1024x1024 icon, this script will generate all necessary icon sizes.

## Dependencies

The script itself is a Node.js app so you'll need to have Node.js v0.8+ installed.

The image resizing is done with [ImageMagick](http://www.imagemagick.org/). Make sure you have ImageMagick's `convert` command available in the command line.

## Installation

To install the project's Node.js module dependencies run the following command:

    npm install

## Usage

The application can write its usage documentation to the command line. To view it run:

    node index.js -h

Example output:

    node ./index.js OPTIONS

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

    node index.js -i appicon_1024.png --iosprefix="Icon" --iosof=output/ios --androidof=output/android
