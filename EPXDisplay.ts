/**
 * Well known colors for a NeoPixel strip
 */
enum EPXAnimations {
    //% block=Globe
    Globe,
    //% block=Weather
    Weather,
    //% block=ColorSpin
    ColorSpin
}

namespace EPXDisplay {

    /**
     * Play an animation.
     */
    //% blockId="expressivepixels_play" block="play animation $strip=variables_get(strip) %anim" blockGap=8
    //% weight=88
    export function play(strip: neopixel.Strip, anim: EPXAnimations) {
        switch(anim) {
            case EPXAnimations.Globe: writeAnimation(strip, SpinningGlobe); break;
            case EPXAnimations.Weather: writeAnimation(strip, Weather); break;
            case EPXAnimations.ColorSpin: writeAnimation(strip, ColorSpin); break;
        }
        strip.show();
    }

    /**	
     * Turn off all LEDs.	
     * You need to call ``show`` to make the changes visible.	
     */	
    //% blockId="EPXDisplay_powerupclear" block="$strip=variables_get(strip)|powerupclear with brightness %brightness "	
    //% help=github:github.com/microsoft/ExpressivePixelsMakeCode/blob/master/HelpStartup.md	
    //% weight=89	
     export function powerupclear(strip: neopixel.Strip, brightness: number): void {	
            strip.setBrightness(brightness);	
            strip.clear();	
            pause(1);	
            strip.show();	
        }	

    //%
    export function writeAnimation(strip: neopixel.Strip, anim: Buffer) {
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
            let originalBrightness = strip.brightness;
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
                                strip.setPixelColor(pixelPos, palette[paletteIdx]);
                            }
                        }
                        strip.show();
                        basic.pause(frameDelayMS);
                    }
                    else if(frameType== 80) { // 'P'
                        let logicalPixelPosition = 0;

                        // Read the number of pixels represented in this frame type
                        framePixelCount =  (anim[framesOffset + frameByteOffset] << 8) | anim[framesOffset + frameByteOffset + 1];
                        frameByteOffset += 2;

                        for(let pixelPos2 = 0; pixelPos2 < framePixelCount;pixelPos2++) {
                            // Process each represented pixel
                            if(strip._length > 256) {
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
                                strip.setPixelColor(logicalPixelPosition, palette[paletteIdx]);
                            }
                        }
                        strip.show();
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
                            strip.setBrightness(stepBrightness);
                            strip.show();

                            basic.pause(activeFadeWait);
                            activeFadeStep--;
                        }
                        strip.setBrightness(originalBrightness);
                        strip.clear();
                        strip.show();
                    }
                }
                strip.clear();
            }
        }
}