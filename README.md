<img src="https://github.com/microsoft/ExpressivePixels/blob/master/images/EPXGitHubLockup.png" style="float: left; margin-right: 10px;" />

# Expressive Pixels for MakeCode

Expressive Pixels provides support for MakeCode, enabling animations to be rendered on display arrays based on WS2812B (NeoPixels) RGB LEDs.

## Add the Extension

After creating you new MakeCode project, add the Expressive Pixels Extension by clicking on the Extensions button in the block picker, followed by entering the URL path to the Expressive Pixels GitHub location.

<img src="https://github.com/microsoft/ExpressivePixels/blob/master/images/Docs-MakeCode-Extension.png" style="float: left;" />
<img src="https://github.com/microsoft/ExpressivePixels/blob/master/images/Docs-MakeCode-ExtensionURL.png" style="float: left;"  width="300"/>

https://github.com/microsoft/ExpressivePixelsMakeCode 

## Add Startup Blocks

Select the Expressive Pixels section in the block picker

<img src="https://github.com/microsoft/ExpressivePixels/blob/master/images/Docs-MakeCode-EPXDisplay.png" style="float: left;" />

Add the following blocks to the On Start section: The main Set EPXDisplay; A digital write pin on P1 i your display supports power enablement; and the powerupclear with low brightness to ensure the display array is cleared and set to a nominal brightness.

<img src="https://github.com/microsoft/ExpressivePixels/blob/master/images/Docs-MakeCode-Startup.png" style="float: left;" />

## Copy the animation from Expressive Pixels application 

In the Expressive Pixels applicaiton select the 'Copy Programmable MakeCode Binary declaration to Clipboard' ellipsis menuitem for the animation you wish to display on your MakeCode device's display. Specify the dimensions of your display array such as 16 x 16.

In the MakeCode editor, switch over to the JavaScript tab <img src="https://github.com/microsoft/ExpressivePixels/blob/master/images/Docs-MakeCode-Javascript.png" style="float: left;" /> and paste in the declaration that is in the Windows Clipboard in the appropriate location below.

<img src="https://github.com/microsoft/ExpressivePixels/blob/master/images/Docs-MakeCode-JScript.png" style="float: left;" />

## Add a play trigger

Going back to the Block editor, pick a trigger you wish to launch the animation from the Inputs block category, and specify the EPXDisplay play and show blocks. 

## Download the MakeCode program to the device

Now download th MakeCode program to your device, when you press the button you specified as a play trigger, the animation will play on your LED display array. 

<img src="https://github.com/microsoft/ExpressivePixels/blob/master/images/Docs-MakeCode-Button.png" style="float: left;" />

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
