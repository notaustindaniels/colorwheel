/**
 * Dynamic Harmony Base Class
 * Supports variable marker counts using MarkerDefinitions
 */
class DynamicHarmony {
    constructor(harmonyType, markerDefinitions) {
        this.harmonyType = harmonyType;
        this.markerDefinitions = markerDefinitions;
        this.currentMarkerCount = 6; // Default
        this.loadConfiguration(this.currentMarkerCount);
    }

    /**
     * Load configuration for a specific marker count
     */
    loadConfiguration(markerCount) {
        const config = this.markerDefinitions.getConfiguration(this.harmonyType, markerCount);
        if (!config) {
            console.error(`No configuration found for ${this.harmonyType} with ${markerCount} markers`);
            return;
        }

        this.numColors = config.numColors;
        this.baseColorIndex = config.baseColorIndex;
        this.angleOffsets = config.angleOffsets;
        this.saturationOffsets = config.saturationOffsets;
        this.currentMarkerCount = markerCount;
    }

    /**
     * Set the number of markers
     */
    setMarkerCount(count) {
        this.loadConfiguration(count);
    }

    /**
     * Get the valid range of marker counts for this harmony
     */
    getMarkerRange() {
        return this.markerDefinitions.getMarkerRange(this.harmonyType);
    }

    /**
     * Calculate color for a specific marker based on base color
     */
    calculateMarkerColor(markerIndex, baseHsv) {
        const angleOffset = this.angleOffsets[markerIndex] || 0;
        const satOffset = this.saturationOffsets[markerIndex] || 0;

        return {
            h: normalizeAngle(baseHsv.h + angleOffset),
            s: Math.max(0, Math.min(100, baseHsv.s + satOffset)),
            v: baseHsv.v
        };
    }

    /**
     * Update base color when a NON-BASE marker is dragged
     */
    updateBaseFromMarker(markerIndex, newHsv, currentBaseHsv) {
        if (markerIndex === this.baseColorIndex) {
            return { ...newHsv };
        }

        const angleOffset = this.angleOffsets[markerIndex] || 0;
        const newBaseHue = normalizeAngle(newHsv.h - angleOffset);

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
