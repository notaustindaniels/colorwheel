/**
 * Square Harmony Rule Implementation
 * Four colors equally spaced around the wheel (90° apart)
 */
class SquareHarmony {
    constructor() {
        this.baseColorIndex = 2;
        this.numColors = 6;

        this.angleOffsets = {
            0: 89.6,   // +90°
            1: 180.17, // +180°
            2: 0,      // BASE marker
            3: 270.56, // +270° (or -90°)
            4: 0,      // Base, lower saturation
            5: 89.6    // Square 1, lower saturation
        };

        this.saturationOffsets = {
            0: 0,
            1: 0,
            2: 0,      // BASE marker
            3: 0,
            4: -33,    // 52% when base is at 85%
            5: -50     // 35% when base is at 85%
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
