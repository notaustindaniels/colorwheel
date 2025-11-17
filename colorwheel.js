/**
 * Color Wheel with Markers and Spokes
 * Implements Adobe Color-style marker functionality
 */

class ColorWheel {
    constructor() {
        this.canvas = document.getElementById('colorWheel');
        this.ctx = this.canvas.getContext('2d');
        this.container = document.getElementById('canvasMarkers');
        this.swatchesContainer = document.getElementById('colorSwatches');
        this.harmonySelect = document.getElementById('harmonySelect');

        this.wheelRadius = 150; // Half of 300px canvas
        this.centerX = this.wheelRadius;
        this.centerY = this.wheelRadius;

        // Harmony system - start with analogous
        this.harmony = new AnalogousHarmony();
        this.harmonyType = 'analogous';

        // Base color (middle of wheel, fully saturated)
        this.baseColor = { h: 150, s: 94, v: 86 };

        // Store all markers and spokes
        this.markers = [];
        this.spokes = [];
        this.colors = [];

        // Individual saturation for each marker (allows independent control)
        this.individualSaturations = null;

        // Track custom saturation offsets for manually adjusted markers
        this.customSaturationOffsets = new Map();

        // Active marker index
        this.activeMarkerIndex = this.harmony.baseColorIndex;

        // Drag state
        this.isDragging = false;
        this.dragMarkerIndex = null;
        this.hitOffset = { x: 0, y: 0 };

        this.init();
        this.setupHarmonySelector();
    }

    init() {
        this.drawColorWheel();
        this.generateColors();
        this.createSpokes();
        this.createMarkers();
        this.updateSwatches();
        this.updateMarkerPositions();
        this.updateSpokePositions();
    }

    /**
     * Draw the HSV color wheel on canvas
     */
    drawColorWheel() {
        const imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
        const data = imageData.data;

        for (let y = 0; y < this.canvas.height; y++) {
            for (let x = 0; x < this.canvas.width; x++) {
                const dx = x - this.centerX;
                const dy = y - this.centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance <= this.wheelRadius) {
                    // Calculate angle (hue)
                    let angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
                    if (angle < 0) angle += 360;

                    // Calculate saturation (0 at center, 100 at edge)
                    const saturation = (distance / this.wheelRadius) * 100;

                    // Value is always 100 for the color wheel
                    const value = 86;

                    // Convert HSV to RGB
                    const rgb = hsvToRgb(angle, saturation, value);

                    const index = (y * this.canvas.width + x) * 4;
                    data[index] = rgb.r;
                    data[index + 1] = rgb.g;
                    data[index + 2] = rgb.b;
                    data[index + 3] = 255;
                } else {
                    // Outside the wheel - transparent
                    const index = (y * this.canvas.width + x) * 4;
                    data[index + 3] = 0;
                }
            }
        }

        this.ctx.putImageData(imageData, 0, 0);
    }

    /**
     * Generate all colors based on current base color
     */
    generateColors() {
        this.colors = this.harmony.generateHarmony(this.baseColor);

        // Initialize individual saturations on first generation
        if (this.individualSaturations === null) {
            this.individualSaturations = this.colors.map(color => color.s);
        }

        // Apply individual saturations to each color
        this.colors = this.colors.map((color, index) => ({
            ...color,
            s: this.individualSaturations[index]
        }));
    }

    /**
     * Create spoke elements
     */
    createSpokes() {
        for (let i = 0; i < this.harmony.numColors; i++) {
            const spoke = document.createElement('div');
            spoke.className = 'spoke';
            if (i === this.activeMarkerIndex) {
                spoke.classList.add('active-spoke');
            }
            this.container.appendChild(spoke);
            this.spokes.push(spoke);
        }
    }

    /**
     * Create marker elements
     */
    createMarkers() {
        for (let i = 0; i < this.harmony.numColors; i++) {
            const marker = document.createElement('div');
            marker.className = 'marker';
            marker.dataset.index = i;

            if (i === this.activeMarkerIndex) {
                marker.classList.add('active-marker');

                // Add indicator arrow to active marker
                const indicator = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                indicator.setAttribute('class', 'base-marker-indicator');
                indicator.setAttribute('width', '10');
                indicator.setAttribute('height', '10');
                indicator.setAttribute('viewBox', '0 0 10 10');

                const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                polygon.setAttribute('points', '0,5 10,0 10,10');
                polygon.setAttribute('fill', 'white');

                indicator.appendChild(polygon);
                marker.appendChild(indicator);
            }

            // Event listeners
            marker.addEventListener('mousedown', this.handleMarkerMouseDown.bind(this));
            marker.addEventListener('touchstart', this.handleMarkerTouchStart.bind(this));

            this.container.appendChild(marker);
            this.markers.push(marker);
        }
    }

    /**
     * Update marker positions based on their colors
     */
    updateMarkerPositions() {
        this.colors.forEach((color, index) => {
            const marker = this.markers[index];

            // Convert HSV to position
            const radius = (color.s / 100) * this.wheelRadius;
            const pos = polarToCartesian(this.centerX, this.centerY, radius, color.h);

            // Set background color
            const rgb = hsvToRgb(color.h, color.s, color.v);
            marker.style.backgroundColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

            // Position the marker (centered on the point)
            const markerSize = index === this.activeMarkerIndex ? 34 : 34;
            marker.style.left = `calc(${(pos.x / 300) * 100}% - ${markerSize / 2}px)`;
            marker.style.top = `calc(${(pos.y / 300) * 100}% - ${markerSize / 2}px)`;

            // Set z-index based on saturation - markers closer to center (lower saturation) appear on top
            // Active marker always has highest z-index
            if (index === this.activeMarkerIndex) {
                marker.style.zIndex = '100';
            } else {
                // Invert saturation so lower saturation = higher z-index
                // Map saturation (0-100) to z-index (10-90)
                const zIndex = Math.round(90 - (color.s / 100) * 80);
                marker.style.zIndex = zIndex.toString();
            }

            // Rotate active marker to align with spoke
            if (index === this.activeMarkerIndex) {
                const dx = pos.x - this.centerX;
                const dy = pos.y - this.centerY;
                const geometricAngle = Math.atan2(dy, dx) * 180 / Math.PI;
                // Rotate the marker to align with spoke
                marker.style.transform = `rotate(${geometricAngle}deg)`;
                // Rotate indicator 180° to point along spoke
                const indicator = marker.querySelector('.base-marker-indicator');
                if (indicator) {
                    indicator.style.transform = 'rotate(180deg)';
                }
            }
        });
    }

    /**
     * Update spoke positions based on their colors
     */
    updateSpokePositions() {
        this.colors.forEach((color, index) => {
            const spoke = this.spokes[index];

            // Spoke starts at center
            spoke.style.top = `${this.centerY}px`;
            spoke.style.left = `${this.centerX}px`;

            // Calculate marker position in Cartesian coordinates
            const radius = (color.s / 100) * this.wheelRadius;
            const markerPos = polarToCartesian(this.centerX, this.centerY, radius, color.h);

            // Calculate geometric angle from center to marker
            const dx = markerPos.x - this.centerX;
            const dy = markerPos.y - this.centerY;
            const geometricAngle = Math.atan2(dy, dx) * 180 / Math.PI;

            // Rotation based on geometric angle, not HSV hue
            spoke.style.transform = `rotate(${geometricAngle}deg)`;

            // Width based on saturation (radius)
            const spokeLength = (color.s / 100) * this.wheelRadius;
            spoke.style.width = `${spokeLength}px`;
        });
    }

    /**
     * Update color swatches display
     */
    updateSwatches() {
        this.swatchesContainer.innerHTML = '';

        this.colors.forEach((color, index) => {
            const rgb = hsvToRgb(color.h, color.s, color.v);
            const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

            const swatch = document.createElement('div');
            swatch.className = 'swatch';
            swatch.style.backgroundColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

            const label = document.createElement('div');
            label.className = 'swatch-label';
            label.textContent = hex;

            swatch.appendChild(label);
            this.swatchesContainer.appendChild(swatch);
        });
    }

    /**
     * Handle marker mouse down
     */
    handleMarkerMouseDown(e) {
        if (e.button !== 0) return; // Only left click

        e.preventDefault();
        const markerIndex = parseInt(e.currentTarget.dataset.index);

        this.startDrag(markerIndex, e.pageX, e.pageY);

        document.body.addEventListener('mousemove', this.handleMouseMove);
        document.body.addEventListener('mouseup', this.handleMouseUp);
    }

    /**
     * Handle marker touch start
     */
    handleMarkerTouchStart(e) {
        e.preventDefault();
        const markerIndex = parseInt(e.currentTarget.dataset.index);
        const touch = e.touches[0];

        this.startDrag(markerIndex, touch.pageX, touch.pageY);

        document.body.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        document.body.addEventListener('touchend', this.handleTouchEnd);
    }

    /**
     * Start dragging a marker
     */
    startDrag(markerIndex, pageX, pageY) {
        this.isDragging = true;
        this.dragMarkerIndex = markerIndex;

        // NOTE: Active marker is ALWAYS index 2 and never changes
        // Do NOT call setActiveMarker() here

        // Calculate hit offset
        const marker = this.markers[markerIndex];
        const rect = marker.getBoundingClientRect();
        this.hitOffset = {
            x: pageX - rect.left - rect.width / 2,
            y: pageY - rect.top - rect.height / 2
        };
    }

    /**
     * Set active marker
     */
    setActiveMarker(index) {
        if (this.activeMarkerIndex === index) return;

        // Remove active class from old marker
        if (this.markers[this.activeMarkerIndex]) {
            this.markers[this.activeMarkerIndex].classList.remove('active-marker');
            const oldIndicator = this.markers[this.activeMarkerIndex].querySelector('.base-marker-indicator');
            if (oldIndicator) oldIndicator.remove();

            this.spokes[this.activeMarkerIndex].classList.remove('active-spoke');
        }

        // Add active class to new marker
        this.activeMarkerIndex = index;
        this.markers[index].classList.add('active-marker');

        // Add indicator to new active marker
        const indicator = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        indicator.setAttribute('class', 'base-marker-indicator');
        indicator.setAttribute('width', '10');
        indicator.setAttribute('height', '10');
        indicator.setAttribute('viewBox', '0 0 10 10');

        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', '0,5 10,0 10,10');
        polygon.setAttribute('fill', 'white');

        indicator.appendChild(polygon);
        this.markers[index].appendChild(indicator);

        this.spokes[index].classList.add('active-spoke');

        // Update base color index in harmony
        this.harmony.baseColorIndex = index;
    }

    /**
     * Handle mouse move
     */
    handleMouseMove = (e) => {
        if (!this.isDragging) return;
        e.preventDefault();

        this.updateDragPosition(e.pageX, e.pageY);
    }

    /**
     * Handle touch move
     */
    handleTouchMove = (e) => {
        if (!this.isDragging) return;
        e.preventDefault();

        const touch = e.touches[0];
        this.updateDragPosition(touch.pageX, touch.pageY);
    }

    /**
     * Update marker position during drag
     */
    updateDragPosition(pageX, pageY) {
        const containerRect = this.container.getBoundingClientRect();

        // Calculate position relative to container
        const x = pageX - containerRect.left - this.hitOffset.x;
        const y = pageY - containerRect.top - this.hitOffset.y;

        // Convert to polar coordinates
        const polar = cartesianToPolar(this.centerX, this.centerY, x, y);

        // Clamp radius to wheel bounds
        const maxRadius = this.wheelRadius;
        const radius = clamp(polar.radius, 0, maxRadius);

        // Calculate saturation from radius
        const saturation = (radius / this.wheelRadius) * 100;

        // New HSV values
        const newHsv = {
            h: polar.angle,
            s: saturation,
            v: this.baseColor.v
        };

        // Update based on whether this is the base marker
        if (this.harmony.isBaseMarker(this.dragMarkerIndex)) {
            // Dragging BASE marker - update ALL markers' saturations proportionally
            this.baseColor = { ...newHsv };

            // Update ALL individual saturations based on the new base saturation
            // Use custom offsets for manually adjusted markers
            const baseSaturation = newHsv.s;
            this.individualSaturations = this.individualSaturations.map((currentSat, index) => {
                // Use custom offset if marker was manually adjusted, otherwise use harmony offset
                const offset = this.customSaturationOffsets.has(index)
                    ? this.customSaturationOffsets.get(index)
                    : this.harmony.saturationOffsets[index];
                // Linear response with bounce-back
                return Math.abs(baseSaturation + offset);
            });

            this.generateColors();
        } else {
            // Dragging NON-BASE marker - update ONLY this marker's saturation
            this.individualSaturations[this.dragMarkerIndex] = saturation;

            // Calculate and store custom offset from base saturation
            const customOffset = saturation - this.baseColor.s;
            this.customSaturationOffsets.set(this.dragMarkerIndex, customOffset);

            // Update base hue only
            this.baseColor = this.harmony.updateBaseFromMarker(
                this.dragMarkerIndex,
                newHsv,
                this.baseColor
            );

            this.generateColors();
        }

        this.updateMarkerPositions();
        this.updateSpokePositions();
        this.updateSwatches();
    }

    /**
     * Handle mouse up
     */
    handleMouseUp = () => {
        this.stopDrag();
        document.body.removeEventListener('mousemove', this.handleMouseMove);
        document.body.removeEventListener('mouseup', this.handleMouseUp);
    }

    /**
     * Handle touch end
     */
    handleTouchEnd = () => {
        this.stopDrag();
        document.body.removeEventListener('touchmove', this.handleTouchMove);
        document.body.removeEventListener('touchend', this.handleTouchEnd);
    }

    /**
     * Stop dragging
     */
    stopDrag() {
        this.isDragging = false;
        this.dragMarkerIndex = null;
    }

    /**
     * Setup harmony selector event listener
     */
    setupHarmonySelector() {
        this.harmonySelect.addEventListener('change', (e) => {
            this.changeHarmony(e.target.value);
        });
    }

    /**
     * Change the harmony type and reinitialize markers
     */
    changeHarmony(harmonyType) {
        this.harmonyType = harmonyType;

        // Create new harmony instance based on type
        switch (harmonyType) {
            case 'analogous':
                this.harmony = new AnalogousHarmony();
                break;
            case 'monochromatic':
                this.harmony = new MonochromaticHarmony();
                break;
            case 'triad':
                this.harmony = new TriadHarmony();
                break;
            case 'complementary':
                this.harmony = new ComplementaryHarmony();
                break;
            case 'split-complementary':
                this.harmony = new SplitComplementaryHarmony();
                break;
            case 'square':
                this.harmony = new SquareHarmony();
                break;
            case 'compound':
                this.harmony = new CompoundHarmony();
                break;
            default:
                this.harmony = new AnalogousHarmony();
        }

        // Clear existing markers and spokes
        this.markers.forEach(marker => marker.remove());
        this.spokes.forEach(spoke => spoke.remove());
        this.markers = [];
        this.spokes = [];

        // Reset individual saturations
        this.individualSaturations = null;

        // Reset custom saturation offsets
        this.customSaturationOffsets = new Map();

        // Update active marker index
        this.activeMarkerIndex = this.harmony.baseColorIndex;

        // Regenerate everything
        this.generateColors();
        this.createSpokes();
        this.createMarkers();
        this.updateSwatches();
        this.updateMarkerPositions();
        this.updateSpokePositions();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ColorWheel();
});
