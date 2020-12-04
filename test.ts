let strip = neopixel.create(DigitalPin.P0, 256, NeoPixelMode.RGB)
pins.digitalWritePin(DigitalPin.P1, 1)
strip.setBrightness(30)
// higher-level API (enum)
EPXDisplay.play(strip, EPXAnimations.ColorSpin)
// lower-level API (buffer)
EPXDisplay.writeAnimation(strip, EPXDisplay.weather)
strip.show();
