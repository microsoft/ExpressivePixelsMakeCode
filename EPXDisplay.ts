/**
 * Well known colors for a NeoPixel strip
 */
enum EPXNeoPixelColors {
    //% block=red
    Red = 0xFF0000,
    //% block=orange
    Orange = 0xFFA500,
    //% block=yellow
    Yellow = 0xFFFF00,
    //% block=green
    Green = 0x00FF00,
    //% block=blue
    Blue = 0x0000FF,
    //% block=indigo
    Indigo = 0x4b0082,
    //% block=violet
    Violet = 0x8a2be2,
    //% block=purple
    Purple = 0xFF00FF,
    //% block=white
    White = 0xFFFFFF,
    //% block=black
    Black = 0x000000
}

/**
 * Different modes for RGB or RGB+W NeoPixel strips
 */
enum EPXNeoPixelMode {
    //% block="RGB (GRB format)"
    RGB = 1,
    //% block="RGB+W"
    RGBW = 2,
    //% block="RGB (RGB format)"
    RGB_RGB = 3
}

/**
 * Functions to operate NeoPixel strips.
 */
//% weight=5 color=#2699BF icon="\uf110"
namespace EPXDisplay {
    /**
     * A NeoPixel strip
     */
    export class Strip {
        buf: Buffer;
        pin: DigitalPin;
        // TODO: encode as bytes instead of 32bit
        brightness: number;
        start: number; // start offset in LED strip
        _length: number; // number of LEDs
        _mode: EPXNeoPixelMode;
        _matrixWidth: number; // number of leds in a matrix - if any

        /**
         * Shows all LEDs to a given color (range 0-255 for r, g, b).
         * @param rgb RGB color of the LED
         */
        //% blockId="EPXDisplay_set_strip_color" block="%display|show color %rgb=EPXDisplay_colors"
        //% strip.defl=display
        //% weight=85 blockGap=8
        //% parts="EPXDisplay"
        showColor(rgb: number) {
            rgb = rgb >> 0;
            this.setAllRGB(rgb);
            this.show();
        }


        /**
         * Play an animation.
         */
        //% blockId="expressivepixels_play" block="%display|play animation %animation" blockGap=8
        //% strip.defl=display
        //% weight=88
        //% parts="EPXDisplay"
        play(anim: Buffer) {
            const length = anim.length;
            let palette = [];

            // Extract FrameCount
            let FrameCount = (anim[1] << 8) | anim[0];
            let LoopCount = anim[2];
            let FrameRate = anim[3];
            let PaletteLengthBytes = (anim[5] << 8) | anim[4];
            let PaletteLength = PaletteLengthBytes / 3;
            let FramesLength = (anim[9] << 24) | (anim[8] << 16) | (anim[7] << 8) | anim[6];
            let frameDelayMS = 1000.0 / FrameRate;
            let originalBrightness = this.brightness;
            let activeFadeStep = 0;
            let activeFadeWait = 0;

            let paletteOffset = 10;
            for(let idx = 0; idx < PaletteLength;idx++) {
                const c = rgb(anim[paletteOffset + idx * 3], anim[paletteOffset + idx * 3 + 1], anim[paletteOffset + idx * 3 + 2]);
                palette.push(c);
            }

            if(LoopCount == 0)
                LoopCount = 1;
            while(LoopCount-- > 0)
            {
                let framesOffset = paletteOffset + PaletteLengthBytes;            
                let frameByteOffset = 0;
                let paletteIdx = 0;

                for(let frameIdx = 0; frameIdx < FrameCount;frameIdx++) {
                    let framePixelCount = 0;
                    let frameType = anim[framesOffset + frameByteOffset];
                    frameByteOffset++;

                    if(frameType == 73) {
                        // Read the number of pixels represented in this frame type
                        framePixelCount =  (anim[framesOffset + frameByteOffset + 0] << 8) | anim[framesOffset + frameByteOffset + 1];
                        frameByteOffset += 2;

                        // Process each represented pixel
                        for(let pixelPos = 0; pixelPos < framePixelCount;pixelPos++) {
                            paletteIdx = anim[framesOffset + frameByteOffset];
                            frameByteOffset++;
                            if(paletteIdx < PaletteLength) {
                                this.setPixelRGB(pixelPos, palette[paletteIdx]);
                            }
                        }
                        this.show();
                        basic.pause(frameDelayMS);
                    }
                    else if(frameType== 80) { // 'P'
                        let logicalPixelPosition = 0;

                        // Read the number of pixels represented in this frame type
                        framePixelCount =  (anim[framesOffset + frameByteOffset] << 8) | anim[framesOffset + frameByteOffset + 1];
                        frameByteOffset += 2;

                        for(let pixelPos2 = 0; pixelPos2 < framePixelCount;pixelPos2++) {
                            // Process each represented pixel
                            if(this._length > 256) {
                                logicalPixelPosition = (anim[framesOffset + frameByteOffset] << 8) | anim[framesOffset + frameByteOffset + 1];
                                frameByteOffset += 2;
                            }
                            else {
                                logicalPixelPosition = anim[framesOffset + frameByteOffset];
                                frameByteOffset ++;
                            }

                            paletteIdx = anim[framesOffset + frameByteOffset];
                            frameByteOffset++;
                            if(paletteIdx < PaletteLength) {
                                this.setPixelRGB(logicalPixelPosition, palette[paletteIdx]);
                            }
                        }
                        this.show();
                        basic.pause(frameDelayMS);
                    }
                    else if(frameType == 68 ) { // 'D'
                        // Read the frame delay
                        let waitMillis =  (anim[framesOffset + frameByteOffset] << 8) | anim[framesOffset + frameByteOffset + 1];
                        frameByteOffset += 2;
                        basic.pause(waitMillis);
                    }
                    else if(frameType == 70) { 'F'
                        // Read the frame delay
                        let activeFadeMillis =  (anim[framesOffset + frameByteOffset] << 8) | anim[framesOffset + frameByteOffset + 1];
                        frameByteOffset += 2;

                        activeFadeStep = 9;
                        activeFadeWait = (activeFadeMillis + 0.1) / 10;

                        while(activeFadeStep > 0)
                        {
                            let stepBrightness = ((originalBrightness + 0.1) / 10) * activeFadeStep;
                            this.setBrightness(stepBrightness);
                            this.show();

                            basic.pause(activeFadeWait);
                            activeFadeStep--;
                        }
                        this.setBrightness(originalBrightness);
                        this.clear();
                        this.show();
                    }
                }
                this.clear();
            }
        }


        /**
         * Shows a rainbow pattern on all LEDs.
         * @param startHue the start hue value for the rainbow, eg: 1
         * @param endHue the end hue value for the rainbow, eg: 360
         */
        //% blockId="EPXDisplay_set_strip_rainbow" block="%display|show rainbow from %startHue|to %endHue"
        //% strip.defl=display
        //% weight=85 blockGap=8
        //% parts="EPXDisplay"
        showRainbow(startHue: number = 1, endHue: number = 360) {
            if (this._length <= 0) return;

            startHue = startHue >> 0;
            endHue = endHue >> 0;
            const saturation = 100;
            const luminance = 50;
            const steps = this._length;
            const direction = HueInterpolationDirection.Clockwise;

            //hue
            const h1 = startHue;
            const h2 = endHue;
            const hDistCW = ((h2 + 360) - h1) % 360;
            const hStepCW = Math.idiv((hDistCW * 100), steps);
            const hDistCCW = ((h1 + 360) - h2) % 360;
            const hStepCCW = Math.idiv(-(hDistCCW * 100), steps);
            let hStep: number;
            if (direction === HueInterpolationDirection.Clockwise) {
                hStep = hStepCW;
            } else if (direction === HueInterpolationDirection.CounterClockwise) {
                hStep = hStepCCW;
            } else {
                hStep = hDistCW < hDistCCW ? hStepCW : hStepCCW;
            }
            const h1_100 = h1 * 100; //we multiply by 100 so we keep more accurate results while doing interpolation

            //sat
            const s1 = saturation;
            const s2 = saturation;
            const sDist = s2 - s1;
            const sStep = Math.idiv(sDist, steps);
            const s1_100 = s1 * 100;

            //lum
            const l1 = luminance;
            const l2 = luminance;
            const lDist = l2 - l1;
            const lStep = Math.idiv(lDist, steps);
            const l1_100 = l1 * 100

            //interpolate
            if (steps === 1) {
                this.setPixelColor(0, hsl(h1 + hStep, s1 + sStep, l1 + lStep))
            } else {
                this.setPixelColor(0, hsl(startHue, saturation, luminance));
                for (let i = 1; i < steps - 1; i++) {
                    const h = Math.idiv((h1_100 + i * hStep), 100) + 360;
                    const s = Math.idiv((s1_100 + i * sStep), 100);
                    const l = Math.idiv((l1_100 + i * lStep), 100);
                    this.setPixelColor(i, hsl(h, s, l));
                }
                this.setPixelColor(steps - 1, hsl(endHue, saturation, luminance));
            }
            this.show();
        }

        /**
         * Displays a vertical bar graph based on the `value` and `high` value.
         * If `high` is 0, the chart gets adjusted automatically.
         * @param value current value to plot
         * @param high maximum value, eg: 255
         */
        //% weight=84
        //% blockId=EPXDisplay_show_bar_graph block="%display|show bar graph of %value|up to %high"
        //% strip.defl=display
        //% icon="\uf080"
        //% parts="EPXDisplay"
        showBarGraph(value: number, high: number): void {
            if (high <= 0) {
                this.clear();
                this.setPixelColor(0, EPXNeoPixelColors.Yellow);
                this.show();
                return;
            }

            value = Math.abs(value);
            const n = this._length;
            const n1 = n - 1;
            let v = Math.idiv((value * n), high);
            if (v == 0) {
                this.setPixelColor(0, 0x666600);
                for (let i = 1; i < n; ++i)
                    this.setPixelColor(i, 0);
            } else {
                for (let i = 0; i < n; ++i) {
                    if (i <= v) {
                        const b = Math.idiv(i * 255, n1);
                        this.setPixelColor(i, EPXDisplay.rgb(b, 0, 255 - b));
                    }
                    else this.setPixelColor(i, 0);
                }
            }
            this.show();
        }

        /**
         * Set LED to a given color (range 0-255 for r, g, b).
         * You need to call ``show`` to make the changes visible.
         * @param pixeloffset position of the NeoPixel in the strip
         * @param rgb RGB color of the LED
         */
        //% blockId="EPXDisplay_set_pixel_color" block="%display|set pixel color at %pixeloffset|to %rgb=EPXDisplay_colors"
        //% strip.defl=display
        //% blockGap=8
        //% weight=80
        //% parts="EPXDisplay" advanced=true
        setPixelColor(pixeloffset: number, rgb: number): void {
            this.setPixelRGB(pixeloffset >> 0, rgb >> 0);
        }

        /**
         * Sets the number of pixels in a matrix shaped strip
         * @param width number of pixels in a row
         */
        //% blockId=EPXDisplay_set_matrix_width block="%display|set matrix width %width"
        //% strip.defl=display
        //% blockGap=8
        //% weight=5
        //% parts="EPXDisplay" advanced=true
        setMatrixWidth(width: number) {
            this._matrixWidth = Math.min(this._length, width >> 0);
        }

        /**
         * Set LED to a given color (range 0-255 for r, g, b) in a matrix shaped strip
         * You need to call ``show`` to make the changes visible.
         * @param x horizontal position
         * @param y horizontal position
         * @param rgb RGB color of the LED
         */
        //% blockId="EPXDisplay_set_matrix_color" block="%display|set matrix color at x %x|y %y|to %rgb=EPXDisplay_colors"
        //% strip.defl=display
        //% weight=4
        //% parts="EPXDisplay" advanced=true
        setMatrixColor(x: number, y: number, rgb: number) {
            if (this._matrixWidth <= 0) return; // not a matrix, ignore
            x = x >> 0;
            y = y >> 0;
            rgb = rgb >> 0;
            const cols = Math.idiv(this._length, this._matrixWidth);
            if (x < 0 || x >= this._matrixWidth || y < 0 || y >= cols) return;
            let i = x + y * this._matrixWidth;
            this.setPixelColor(i, rgb);
        }

        /**
         * For NeoPixels with RGB+W LEDs, set the white LED brightness. This only works for RGB+W NeoPixels.
         * @param pixeloffset position of the LED in the strip
         * @param white brightness of the white LED
         */
        //% blockId="EPXDisplay_set_pixel_white" block="%display|set pixel white LED at %pixeloffset|to %white"
        //% strip.defl=display
        //% blockGap=8
        //% weight=80
        //% parts="EPXDisplay" advanced=true
        setPixelWhiteLED(pixeloffset: number, white: number): void {
            if (this._mode === EPXNeoPixelMode.RGBW) {
                this.setPixelW(pixeloffset >> 0, white >> 0);
            }
        }

        /**
         * Send all the changes to the strip.
         */
        //% blockId="EPXDisplay_show" block="%display|show" blockGap=8
        //% strip.defl=display
        //% weight=87
        //% parts="EPXDisplay"
        show() {
            // only supported in beta
            // ws2812b.setBufferMode(this.pin, this._mode);
            ws2812b.sendBuffer(this.buf, this.pin);
        }

        /**
         * Turn off all LEDs.
         * You need to call ``show`` to make the changes visible.
         */
        //% blockId="EPXDisplay_clear" block="%display|clear"
        //% strip.defl=display
        //% weight=86
        //% parts="EPXDisplay"
        clear(): void {
            const stride = this._mode === EPXNeoPixelMode.RGBW ? 4 : 3;
            this.buf.fill(0, this.start * stride, this._length * stride);
        }


        /**
         * Turn off all LEDs.
         * You need to call ``show`` to make the changes visible.
         */
        //% blockId="EPXDisplay_powerupclear" block="%display|powerupclear with brightness %brightness "
        //% strip.defl=display
        //% weight=89
        //% parts="EPXDisplay"
        powerupclear(brightness: number): void {
            this.setBrightness(brightness);
            this.clear();
            pause(1);
            this.show();
        }



        /**
         * Gets the number of pixels declared on the strip
         */
        //% blockId="EPXDisplay_length" block="%display|length" blockGap=8
        //% strip.defl=display
        //% weight=60 advanced=true
        length() {
            return this._length;
        }

        /**
         * Set the brightness of the strip. This flag only applies to future operation.
         * @param brightness a measure of LED brightness in 0-255. eg: 255
         */
        //% blockId="EPXDisplay_set_brightness" block="%display|set brightness %brightness" blockGap=8
        //% strip.defl=display
        //% weight=59
        //% parts="EPXDisplay" advanced=true
        setBrightness(brightness: number): void {
            this.brightness = brightness & 0xff;
        }

        /**
         * Apply brightness to current colors using a quadratic easing function.
         **/
        //% blockId="EPXDisplay_each_brightness" block="%display|ease brightness" blockGap=8
        //% strip.defl=display
        //% weight=58
        //% parts="EPXDisplay" advanced=true
        easeBrightness(): void {
            const stride = this._mode === EPXNeoPixelMode.RGBW ? 4 : 3;
            const br = this.brightness;
            const buf = this.buf;
            const end = this.start + this._length;
            const mid = Math.idiv(this._length, 2);
            for (let i = this.start; i < end; ++i) {
                const k = i - this.start;
                const ledoffset = i * stride;
                const br = k > mid
                    ? Math.idiv(255 * (this._length - 1 - k) * (this._length - 1 - k), (mid * mid))
                    : Math.idiv(255 * k * k, (mid * mid));
                const r = (buf[ledoffset + 0] * br) >> 8; buf[ledoffset + 0] = r;
                const g = (buf[ledoffset + 1] * br) >> 8; buf[ledoffset + 1] = g;
                const b = (buf[ledoffset + 2] * br) >> 8; buf[ledoffset + 2] = b;
                if (stride == 4) {
                    const w = (buf[ledoffset + 3] * br) >> 8; buf[ledoffset + 3] = w;
                }
            }
        }


        /**
         * Shift LEDs forward and clear with zeros.
         * You need to call ``show`` to make the changes visible.
         * @param offset number of pixels to shift forward, eg: 1
         */
        //% blockId="EPXDisplay_shift" block="%display|shift pixels by %offset" blockGap=8
        //% strip.defl=display
        //% weight=40
        //% parts="EPXDisplay"
        shift(offset: number = 1): void {
            offset = offset >> 0;
            const stride = this._mode === EPXNeoPixelMode.RGBW ? 4 : 3;
            this.buf.shift(-offset * stride, this.start * stride, this._length * stride)
        }

        /**
         * Rotate LEDs forward.
         * You need to call ``show`` to make the changes visible.
         * @param offset number of pixels to rotate forward, eg: 1
         */
        //% blockId="EPXDisplay_rotate" block="%display|rotate pixels by %offset" blockGap=8
        //% strip.defl=display
        //% weight=39
        //% parts="EPXDisplay"
        rotate(offset: number = 1): void {
            offset = offset >> 0;
            const stride = this._mode === EPXNeoPixelMode.RGBW ? 4 : 3;
            this.buf.rotate(-offset * stride, this.start * stride, this._length * stride)
        }

        /**
         * Set the pin where the neopixel is connected, defaults to P0.
         */
        //% weight=10
        //% parts="EPXDisplay" advanced=true
        setPin(pin: DigitalPin): void {
            this.pin = pin;
            pins.digitalWritePin(this.pin, 0);
            // don't yield to avoid races on initialization
        }

  
        private setBufferRGB(offset: number, red: number, green: number, blue: number): void {
            if (this._mode === EPXNeoPixelMode.RGB_RGB) {
                this.buf[offset + 0] = red;
                this.buf[offset + 1] = green;
            } else {
                this.buf[offset + 0] = green;
                this.buf[offset + 1] = red;
            }
            this.buf[offset + 2] = blue;
        }

        private setAllRGB(rgb: number) {
            let red = unpackR(rgb);
            let green = unpackG(rgb);
            let blue = unpackB(rgb);

            const br = this.brightness;
            if (br < 255) {
                red = (red * br) >> 8;
                green = (green * br) >> 8;
                blue = (blue * br) >> 8;
            }
            const end = this.start + this._length;
            const stride = this._mode === EPXNeoPixelMode.RGBW ? 4 : 3;
            for (let i = this.start; i < end; ++i) {
                this.setBufferRGB(i * stride, red, green, blue)
            }
        }
        private setAllW(white: number) {
            if (this._mode !== EPXNeoPixelMode.RGBW)
                return;

            let br = this.brightness;
            if (br < 255) {
                white = (white * br) >> 8;
            }
            let buf = this.buf;
            let end = this.start + this._length;
            for (let i = this.start; i < end; ++i) {
                let ledoffset = i * 4;
                buf[ledoffset + 3] = white;
            }
        }
        private setPixelRGB(pixeloffset: number, rgb: number): void {
            if (pixeloffset < 0
                || pixeloffset >= this._length)
                return;

            let stride = this._mode === EPXNeoPixelMode.RGBW ? 4 : 3;
            pixeloffset = (pixeloffset + this.start) * stride;

            let red = unpackR(rgb);
            let green = unpackG(rgb);
            let blue = unpackB(rgb);

            let br = this.brightness;
            if (br < 255) {
                red = (red * br) >> 8;
                green = (green * br) >> 8;
                blue = (blue * br) >> 8;
            }
            this.setBufferRGB(pixeloffset, red, green, blue)
        }
        private setPixelW(pixeloffset: number, white: number): void {
            if (this._mode !== EPXNeoPixelMode.RGBW)
                return;

            if (pixeloffset < 0
                || pixeloffset >= this._length)
                return;

            pixeloffset = (pixeloffset + this.start) * 4;

            let br = this.brightness;
            if (br < 255) {
                white = (white * br) >> 8;
            }
            let buf = this.buf;
            buf[pixeloffset + 3] = white;
        }





    } // namespace

    /**
     * Create a new NeoPixel driver for `numleds` LEDs.
     * @param pin the pin where the neopixel is connected.
     * @param numleds number of leds in the strip, eg: 24,30,60,64
     */
    //% blockId="EPXDisplay_create" block="EPXDisplay at pin %pin|with %numleds|leds as %mode"
    //% weight=90 blockGap=8
    //% parts="EPXDisplay"
    //% trackArgs=0,2
    //% blockSetVariable=display
    export function create(pin: DigitalPin, numleds: number, mode: EPXNeoPixelMode): Strip {
        let strip = new Strip();
        let stride = mode === EPXNeoPixelMode.RGBW ? 4 : 3;
        strip.buf = pins.createBuffer(numleds * stride);
        strip.start = 0;
        strip._length = numleds;
        strip._mode = mode || EPXNeoPixelMode.RGB;
        strip._matrixWidth = 0;
        strip.setBrightness(128)
        strip.setPin(pin)
        return strip;
    }

    /**
     * Converts red, green, blue channels into a RGB color
     * @param red value of the red channel between 0 and 255. eg: 255
     * @param green value of the green channel between 0 and 255. eg: 255
     * @param blue value of the blue channel between 0 and 255. eg: 255
     */
    //% weight=1
    //% blockId="EPXDisplay_rgb" block="red %red|green %green|blue %blue"
    //% advanced=true
    export function rgb(red: number, green: number, blue: number): number {
        return packRGB(red, green, blue);
    }

    /**
     * Gets the RGB value of a known color
    */
    //% weight=2 blockGap=8
    //% blockId="EPXDisplay_colors" block="%color"
    //% advanced=true
    export function colors(color: EPXNeoPixelColors): number {
        return color;
    }

    function packRGB(a: number, b: number, c: number): number {
        return ((a & 0xFF) << 16) | ((b & 0xFF) << 8) | (c & 0xFF);
    }
    function unpackR(rgb: number): number {
        let r = (rgb >> 16) & 0xFF;
        return r;
    }
    function unpackG(rgb: number): number {
        let g = (rgb >> 8) & 0xFF;
        return g;
    }
    function unpackB(rgb: number): number {
        let b = (rgb) & 0xFF;
        return b;
    }

    /**
     * Converts a hue saturation luminosity value into a RGB color
     * @param h hue from 0 to 360
     * @param s saturation from 0 to 99
     * @param l luminosity from 0 to 99
     */
    //% blockId=EPXDisplayHSL block="hue %h|saturation %s|luminosity %l"
    export function hsl(h: number, s: number, l: number): number {
        h = Math.round(h);
        s = Math.round(s);
        l = Math.round(l);

        h = h % 360;
        s = Math.clamp(0, 99, s);
        l = Math.clamp(0, 99, l);
        let c = Math.idiv((((100 - Math.abs(2 * l - 100)) * s) << 8), 10000); //chroma, [0,255]
        let h1 = Math.idiv(h, 60);//[0,6]
        let h2 = Math.idiv((h - h1 * 60) * 256, 60);//[0,255]
        let temp = Math.abs((((h1 % 2) << 8) + h2) - 256);
        let x = (c * (256 - (temp))) >> 8;//[0,255], second largest component of this color
        let r$: number;
        let g$: number;
        let b$: number;
        if (h1 == 0) {
            r$ = c; g$ = x; b$ = 0;
        } else if (h1 == 1) {
            r$ = x; g$ = c; b$ = 0;
        } else if (h1 == 2) {
            r$ = 0; g$ = c; b$ = x;
        } else if (h1 == 3) {
            r$ = 0; g$ = x; b$ = c;
        } else if (h1 == 4) {
            r$ = x; g$ = 0; b$ = c;
        } else if (h1 == 5) {
            r$ = c; g$ = 0; b$ = x;
        }
        let m = Math.idiv((Math.idiv((l * 2 << 8), 100) - c), 2);
        let r = r$ + m;
        let g = g$ + m;
        let b = b$ + m;
        return packRGB(r, g, b);
    }

    export enum HueInterpolationDirection {
        Clockwise,
        CounterClockwise,
        Shortest
    }
}
