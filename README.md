<img src="https://github.com/microsoft/ExpressivePixelsMakeCode/blob/master/images/EPXGitHubLockup.png" style="float: left; margin-right: 10px;" />

# Expressive Pixel Extension for MakeCode

The Expressive Pixels extension allows animations created with the free [Expressive Pixels Windows App](https://www.microsoft.com/en-us/p/expressive-pixels/9mtc56w1rxqh) to be rendered on display arrays based on WS2812B (NeoPixels) RGB LEDs, such as the 16x16 [Sparklet for micro:bit](https://siliconsquared.com/sparkletmicrobit/):

<img src="https://github.com/microsoft/ExpressivePixelsMakeCode/blob/master/images/sparkletPhoto.jpg" style="float: left;" />

## Add the Extension

After creating a new MakeCode project, add the Expressive Pixels Extension by clicking on the Extensions button in the block picker, followed by searching for the word "expressive" (or entering the URL of this repo - https://github.com/microsoft/ExpressivePixelsMakeCode).

<img src="https://github.com/microsoft/ExpressivePixelsMakeCode/blob/master/images/Docs-MakeCode-Extension.png" style="float: left;" />
<img src="https://github.com/microsoft/ExpressivePixelsMakeCode/blob/master/images/Docs-MakeCode-ExtensionURL.png" style="float: left;"  width="300"/>

You should see that `EPXDisplay` and `Neopixel` are both added to the toolbox, as shown below:

<img src="https://github.com/microsoft/ExpressivePixelsMakeCode/blob/master/images/EPXDisplay-Neopixel.JPG" style="float: left;"/>


## Add Startup Blocks

Select the Neopixel section in the toolbox and create a strip (at pin P0 for the Sparklet for micro:bit) with the proper number of pixels (256 for the Sparklet for micro:bit).  From the Advanced Pin section, add a `digital write pin` on P1 of value 1 to turn on the Sparklet display. Finally, from the EPXDisplay section, add the powerupclear block with low brightness ensures that the display is cleared and set to a nominal brightness:

<img src="https://github.com/microsoft/ExpressivePixelsMakeCode/blob/master/images/Docs-MakeCode-Startup.png" style="float: left;" />

## Copy the animation from Expressive Pixels application 

In the [Expressive Pixels application](https://www.microsoft.com/en-us/p/expressive-pixels/9mtc56w1rxqh) select the 'Copy Programmable MakeCode Binary declaration to Clipboard' ellipsis menuitem for the animation you wish to display on your MakeCode device's display. Make sure to specify the dimensions of your display array (16 x 16 for the Sparklet for micro:bit). 

In the MakeCode editor, switch over to the JavaScript tab <img src="https://github.com/microsoft/ExpressivePixelsMakeCode/blob/master/images/Docs-MakeCode-Javascript.png" style="float: left;" /> and paste in the declaration that is in the Windows Clipboard in the appropriate location below. Then call `EPXisplay.writeAnimation` sending the strip and buffer as first and second parameters.  Finally, remember to call the show method on the strip!

<img src="https://github.com/microsoft/ExpressivePixelsMakeCode/blob/master/images/Docs-MakeCode-JScript.png" style="float: left;" />

## Download the MakeCode program to the device

Now download the MakeCode program to your device; the animation will play on your LED display array. 

## Using the NeoPixel strip as a matrix

For the 16x16 Sparklet for the micro:bit, it's nice to be able to address the NeoPixel strip using
(x,y) coordinates.  This can be done using the Neopixel extension by first calling `set matrix width` 
(16 in the case of the Sparklet for micro:bit) and then calling `set matrix color` to set the color 
at specified (x,y) coordinates, as shown below:

<img src="https://github.com/microsoft/ExpressivePixelsMakeCode/blob/master/images/setMatrixWidth.JPG" style="float: left;" />

The resulting image should look like this:

<img src="https://github.com/microsoft/ExpressivePixelsMakeCode/blob/master/images/redDiagonalLine.jpg" style="float: left;" />

## Supported targets

* for PXT/microbit

## License

MIT

## Code of Conduct

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

