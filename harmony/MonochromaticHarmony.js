/**
 * Monochromatic Harmony Rule Implementation
 * All markers at the same hue, varying saturations
 */
class MonochromaticHarmony {
    constructor() {
        this.baseColorIndex = 2;
        this.numColors = 6;

        this.thetaCoefficients = {
            0: 0,
            1: 0,
            2: 0,  // BASE marker
            3: 0,
            4: 0,
            5: 0
        };

        this.angleOffsets = {
            0: 0,
            1: 0,
            2: 0,  // BASE marker
            3: 0,
            4: 0,
            5: 0
        };

        // Saturation offsets from base marker (linear, not multiplicative)
        // When base is at 94%, Adobe uses: 77%, 60%, 94%, 44%, 26%, 10%
        this.saturationOffsets = {
            0: -17,    // 77% when base is 94%
            1: -34,    // 60% when base is 94%
            2: 0,      // BASE marker - 94%
            3: -50,    // 44% when base is 94%
            4: -68,    // 26% when base is 94%
            5: -84     // 10% when base is 94%
        };
    }

    calculateMarkerColor(markerIndex, baseHsv) {
        const satOffset = this.saturationOffsets[markerIndex];
        // Linear response with bounce-back: use absolute value when result would be negative
        const saturation = Math.abs(baseHsv.s + satOffset);
        return {
            h: baseHsv.h,
            s: saturation,
            v: baseHsv.v
        };
    }

    updateBaseFromMarker(newHsv, currentBaseHsv) {
        return {
            h: newHsv.h,
            s: currentBaseHsv.s,
            v: currentBaseHsv.v
        };
    }

    generateHarmony(baseHsv) {
        const colors = [];
        for (let i = 0; i < this.numColors; i++) {
            colors.push(this.calculateMarkerColor(i, baseHsv));
        }
        return colors;
    }

    isBaseMarker(index) {
        return index === this.baseColorIndex;
    }
}
