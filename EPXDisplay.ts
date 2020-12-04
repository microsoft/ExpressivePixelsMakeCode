namespace EPXDisplay {

        export class MicrobitSparkletDisplay {
            public strip: neopixel.Strip;

            constructor() {
                this.strip = neopixel.create(DigitalPin.P0, 256, NeoPixelMode.RGB);
                pins.digitalWritePin(DigitalPin.P1, 1);
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
                let originalBrightness = this.strip.brightness;
                let activeFadeStep = 0;
                let activeFadeWait = 0;

                let paletteOffset = 10;
                for(let idx = 0; idx < PaletteLength;idx++) {
                    const c = neopixel.rgb(anim[paletteOffset + idx * 3], anim[paletteOffset + idx * 3 + 1], anim[paletteOffset + idx * 3 + 2]);
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
                                    this.strip.setPixelColor(pixelPos, palette[paletteIdx]);
                                }
                            }
                            this.strip.show();
                            basic.pause(frameDelayMS);
                        }
                        else if(frameType== 80) { // 'P'
                            let logicalPixelPosition = 0;

                            // Read the number of pixels represented in this frame type
                            framePixelCount =  (anim[framesOffset + frameByteOffset] << 8) | anim[framesOffset + frameByteOffset + 1];
                            frameByteOffset += 2;

                            for(let pixelPos2 = 0; pixelPos2 < framePixelCount;pixelPos2++) {
                                // Process each represented pixel
                                if(this.strip._length > 256) {
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
                                    this.strip.setPixelColor(logicalPixelPosition, palette[paletteIdx]);
                                }
                            }
                            this.strip.show();
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
                                this.strip.setBrightness(stepBrightness);
                                this.strip.show();

                                basic.pause(activeFadeWait);
                                activeFadeStep--;
                            }
                            this.strip.setBrightness(originalBrightness);
                            this.strip.clear();
                            this.strip.show();
                        }
                    }
                    this.strip.clear();
                }
            }

            /**
             * Send all the changes to the display
             */
            //% blockId="EPXDisplay_show" block="%display|show" blockGap=8
            //% strip.defl=display
            //% weight=87
            //% parts="EPXDisplay"
            show() {
                this.strip.show();
            }
        }


        //% blockId="EPXDisplay_create" block="Sparklet Display"
        //% help=github:github.com/microsoft/ExpressivePixelsMakeCode/blob/master/HelpStartup.md
        //% weight=90 blockGap=8
        //% parts="EPXDisplay"
        //% blockSetVariable=display
        export function createMicrobitSparkletDisplay(): MicrobitSparkletDisplay {
            return new MicrobitSparkletDisplay();
        }
}