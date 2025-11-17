/**
 * Triad Harmony Rule Implementation
 * Three colors equally spaced around the wheel (120° apart)
 */
class TriadHarmony {
    constructor() {
        this.baseColorIndex = 2;
        this.numColors = 6;

        this.angleOffsets = {
            0: 120,    // +120°
            1: 240,    // +240° (or -120°)
            2: 0,      // BASE marker
            3: 0,      // Same as base, lower saturation
            4: 120,    // +120°, lower saturation
            5: 240     // +240°, lower saturation
        };

        this.saturationOffsets = {
            0: 0,
            1: 0,
            2: 0,      // BASE marker
            3: -33,    // 52% when base is at 85%
            4: -50,    // 35% when base is at 85%
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
