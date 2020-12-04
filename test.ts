let strip = neopixel.create(DigitalPin.P0, 256, NeoPixelMode.RGB)
strip.setBrightness(30);
EPXDisplay.play(strip, EPXAnimations.Weather);
strip.show();
