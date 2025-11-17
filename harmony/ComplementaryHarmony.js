/**
 * Complementary Harmony Rule Implementation
 * Two colors opposite on the wheel (180° apart)
 */
class ComplementaryHarmony {
    constructor() {
        this.baseColorIndex = 2;
        this.numColors = 6;

        this.angleOffsets = {
            0: 180,    // Complement
            1: 0,      // Base, different saturation
            2: 0,      // BASE marker
            3: 180,    // Complement, lower saturation
            4: 0,      // Base, lower saturation
            5: 180     // Complement, lowest saturation
        };

        this.saturationOffsets = {
            0: 0,
            1: -25,    // 60% when base is at 85%
            2: 0,      // BASE marker
            3: -33,    // 52% when base is at 85%
            4: -50,    // 35% when base is at 85%
            5: -67     // 18% when base is at 85%
        };
    }

    calculateMarkerColor(markerIndex, baseHsv) {
        const angleOffset = this.angleOffsets[markerIndex];
        const satOffset = this.saturationOffsets[markerIndex];

        return {
            h: normalizeAngle(baseHsv.h + angleOffset),
            s: Math.abs(baseHsv.s + satOffset),
            v: baseHsv.v
        };
    }

    updateBaseFromMarker(markerIndex, newHsv, currentBaseHsv) {
        if (markerIndex === this.baseColorIndex) {
            return { ...newHsv };
        }

        const angleOffset = this.angleOffsets[markerIndex];
        const newBaseHue = normalizeAngle(newHsv.h - angleOffset);

        return {
            h: newBaseHue,
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
