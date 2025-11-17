/**
 * Analogous Harmony Rule Implementation
 * Based on Adobe Color's harmony system
 */

class AnalogousHarmony {
    constructor() {
        this.baseColorIndex = 2; // Middle marker is the base (index 2 of 6 markers)
        this.numColors = 6; // 6 markers total for analogous

        // Theta coefficients determine how other markers respond to base changes
        // Based on Adobe's implementation
        this.thetaCoefficients = {
            0: 1.0,     // Marker at -18° (responds 1:1 with base hue)
            1: 0.5,     // Marker at -36° (responds 1:2 with base hue)
            2: 0,       // BASE marker (this is the active marker)
            3: -0.5,    // Marker at +18° (responds -1:2 with base hue)
            4: -1.0,    // Marker at +36° (responds -1:1 with base hue)
            5: 0        // Desaturated marker at base hue
        };

        // Angular offsets from base marker in degrees
        this.angleOffsets = {
            0: -18,
            1: -36,
            2: 0,      // BASE marker
            3: 18,
            4: 36,
            5: 0       // Same angle as base but different saturation
        };

        // Saturation offsets from base marker (linear, not multiplicative)
        this.saturationOffsets = {
            0: 0,
            1: 0,
            2: 0,      // BASE marker
            3: 0,
            4: 0,
            5: -33     // Desaturated marker (52% when base is at 85%)
        };
    }

    /**
     * Calculate color for a specific marker based on base color
     */
    calculateMarkerColor(markerIndex, baseHsv) {
        if (markerIndex === this.baseColorIndex) {
            return { ...baseHsv };
        }

        const angleOffset = this.angleOffsets[markerIndex];
        const satOffset = this.saturationOffsets[markerIndex];

        return {
            h: normalizeAngle(baseHsv.h + angleOffset),
            s: Math.abs(baseHsv.s + satOffset),
            v: baseHsv.v
        };
    }

    /**
     * Update base color when a NON-BASE marker is dragged
     * This only updates HUE, not saturation or value
     */
    updateBaseFromMarker(markerIndex, newHsv, currentBaseHsv) {
        if (markerIndex === this.baseColorIndex) {
            // This IS the base marker, return as-is
            return { ...newHsv };
        }

        const thetaCoeff = this.thetaCoefficients[markerIndex];
        const angleOffset = this.angleOffsets[markerIndex];

        if (thetaCoeff === 0) {
            // Desaturated marker - only update hue to match
            return {
                h: newHsv.h,
                s: currentBaseHsv.s,
                v: currentBaseHsv.v
            };
        }

        // Calculate what the base hue should be based on this marker's new position
        // The marker's hue = base hue + (delta * thetaCoeff)
        // So: base hue = marker hue - angleOffset
        const newBaseHue = normalizeAngle(newHsv.h - angleOffset);

        // IMPORTANT: Only update HUE, keep saturation and value from current base
        return {
            h: newBaseHue,
            s: currentBaseHsv.s,
            v: currentBaseHsv.v
        };
    }

    /**
     * Generate all colors in the harmony from base color
     */
    generateHarmony(baseHsv) {
        const colors = [];

        for (let i = 0; i < this.numColors; i++) {
            colors.push(this.calculateMarkerColor(i, baseHsv));
        }

        return colors;
    }

    /**
     * Check if a marker index is the base/active marker
     */
    isBaseMarker(index) {
        return index === this.baseColorIndex;
    }
}
