/**
 * Split Complementary Harmony Rule Implementation
 * Base color plus two colors adjacent to its complement
 */
class SplitComplementaryHarmony {
    constructor() {
        this.baseColorIndex = 2;
        this.numColors = 6;

        this.angleOffsets = {
            0: 162.4,  // Complement - 18°
            1: 198.08, // Complement + 18°
            2: 0,      // BASE marker
            3: 0,      // Base, lower saturation
            4: 162.4,  // Split 1, lower saturation
            5: 198.08  // Split 2, lower saturation
        };

        this.saturationOffsets = {
            0: 0,
            1: 0,
            2: 0,      // BASE marker
            3: -50,    // 35% when base is at 85%
            4: -50,
            5: -50
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
