/**
 * Compound Harmony Rule Implementation (also known as Tetradic)
 * Base color + adjacent color + their complements
 */
class CompoundHarmony {
    constructor() {
        this.baseColorIndex = 2;
        this.numColors = 6;

        this.angleOffsets = {
            0: 30,     // +30° from base
            1: 150.04, // ~150° from base
            2: 0,      // BASE marker
            3: 180.17, // Complement of base
            4: 0,      // Base, lower saturation
            5: 30      // Adjacent, lower saturation
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
