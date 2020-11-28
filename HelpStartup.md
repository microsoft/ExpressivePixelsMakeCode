## Startup Blocks
Add the following blocks to the On Start section:

<img src="https://github.com/microsoft/ExpressivePixels/blob/master/images/Docs-MakeCode-Startup.png" style="float: left;" />

* Set EPXDisplay - setting the Pin the WS2812 leds are connected to, the number of LEDs on that pin, and the RGB color format.
* If you have a display that support power control such as the SiliconSquared Sparklet for micro:bit, specify the Pin to turn the display on, such as P1.
* The properly clear the display and set initial brightness add 'powerupclear with brightness'
