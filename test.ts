let strip = neopixel.create(DigitalPin.P0, 256, NeoPixelMode.RGB)
pins.digitalWritePin(DigitalPin.P1, 1)
EPXDisplay.powerupclear(strip, 30)
// higher-level API (enum)
EPXDisplay.play(strip, EPXAnimations.Weather)
// lower-level API (buffer)
EPXDisplay.writeAnimation(strip, EPXDisplay.Weather)
strip.show();