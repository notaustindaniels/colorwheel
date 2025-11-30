/**
 * Color Wheel Implementation
 * Simplified version inspired by Adobe Color Wheel
 */

class ColorWheel {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('Canvas element not found:', canvasId);
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.radius = Math.min(this.width, this.height) / 2 - 30;

        this.markers = [];
        this.draggingMarker = null;
        this.markerRadius = 18;

        this.onMarkerMove = null; // Callback for marker movement

        this.setupEventListeners();
        this.draw();
    }

    // Convert HSV to RGB
    hsvToRgb(h, s, v) {
        h = h / 360;
        let r, g, b;

        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);

        switch (i % 6) {
            case 0: r = v; g = t; b = p; break;
            case 1: r = q; g = v; b = p; break;
            case 2: r = p; g = v; b = t; break;
            case 3: r = p; g = q; b = v; break;
            case 4: r = t; g = p; b = v; break;
            case 5: r = v; g = p; b = q; break;
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    // Convert RGB to HSV
    rgbToHsv(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;

        let h = 0;
        let s = max === 0 ? 0 : delta / max;
        let v = max;

        if (delta !== 0) {
            if (max === r) {
                h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
            } else if (max === g) {
                h = ((b - r) / delta + 2) / 6;
            } else {
                h = ((r - g) / delta + 4) / 6;
            }
        }

        return {
            h: h * 360,
            s: s,
            v: v
        };
    }

    // Convert hex to RGB
    hexToRgb(hex) {
        hex = hex.replace('#', '');
        return {
            r: parseInt(hex.substr(0, 2), 16),
            g: parseInt(hex.substr(2, 2), 16),
            b: parseInt(hex.substr(4, 2), 16)
        };
    }

    // Convert RGB to hex
    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = Math.round(x).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    // Draw the color wheel
    drawWheel() {
        const imageData = this.ctx.createImageData(this.width, this.height);
        const data = imageData.data;

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const dx = x - this.centerX;
                const dy = y - this.centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance <= this.radius) {
                    // Calculate hue from angle
                    let angle = Math.atan2(dy, dx);
                    if (angle < 0) angle += 2 * Math.PI;
                    const hue = (angle / (2 * Math.PI)) * 360;

                    // Calculate saturation from distance
                    const saturation = distance / this.radius;

                    // Use full value/brightness
                    const value = 1;

                    const rgb = this.hsvToRgb(hue, saturation, value);
                    const index = (y * this.width + x) * 4;
                    data[index] = rgb.r;
                    data[index + 1] = rgb.g;
                    data[index + 2] = rgb.b;
                    data[index + 3] = 255;
                } else {
                    const index = (y * this.width + x) * 4;
                    data[index + 3] = 0; // Transparent
                }
            }
        }

        this.ctx.putImageData(imageData, 0, 0);
    }

    // Draw a marker at a position
    drawMarker(marker) {
        const { x, y, color, label } = marker;

        // Draw marker circle
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.markerRadius, 0, 2 * Math.PI);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Add shadow for depth
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 5;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;

        // Reset shadow
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
    }

    // Draw all markers
    drawMarkers() {
        this.markers.forEach(marker => this.drawMarker(marker));
    }

    // Main draw function
    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.drawWheel();
        this.drawMarkers();
    }

    // Add a marker
    addMarker(color, label) {
        const rgb = this.hexToRgb(color);
        const hsv = this.rgbToHsv(rgb.r, rgb.g, rgb.b);
        const position = this.hsvToPosition(hsv.h, hsv.s);

        const marker = {
            x: position.x,
            y: position.y,
            color: color,
            label: label,
            hsv: hsv
        };

        this.markers.push(marker);
        this.draw();
        return marker;
    }

    // Update marker color and position
    updateMarker(label, color) {
        const marker = this.markers.find(m => m.label === label);
        if (!marker) return;

        const rgb = this.hexToRgb(color);
        const hsv = this.rgbToHsv(rgb.r, rgb.g, rgb.b);
        const position = this.hsvToPosition(hsv.h, hsv.s);

        marker.x = position.x;
        marker.y = position.y;
        marker.color = color;
        marker.hsv = hsv;

        this.draw();
    }

    // Convert HSV to canvas position
    hsvToPosition(h, s) {
        const angle = (h / 360) * 2 * Math.PI;
        const distance = s * this.radius;

        return {
            x: this.centerX + distance * Math.cos(angle),
            y: this.centerY + distance * Math.sin(angle)
        };
    }

    // Convert canvas position to HSV
    positionToHsv(x, y) {
        const dx = x - this.centerX;
        const dy = y - this.centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Clamp to wheel radius
        const clampedDistance = Math.min(distance, this.radius);

        let angle = Math.atan2(dy, dx);
        if (angle < 0) angle += 2 * Math.PI;

        const h = (angle / (2 * Math.PI)) * 360;
        const s = clampedDistance / this.radius;
        const v = 1; // Full brightness

        return { h, s, v };
    }

    // Get marker at position
    getMarkerAt(x, y) {
        for (let i = this.markers.length - 1; i >= 0; i--) {
            const marker = this.markers[i];
            const dx = x - marker.x;
            const dy = y - marker.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= this.markerRadius + 5) {
                return marker;
            }
        }
        return null;
    }

    // Setup event listeners
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.onMouseUp.bind(this));

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.onTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.onTouchEnd.bind(this));
    }

    onMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        this.draggingMarker = this.getMarkerAt(x, y);
    }

    onMouseMove(e) {
        if (!this.draggingMarker) return;

        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        this.updateMarkerPosition(x, y);
    }

    onMouseUp() {
        this.draggingMarker = null;
    }

    onTouchStart(e) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const touch = e.touches[0];
        const x = (touch.clientX - rect.left) * scaleX;
        const y = (touch.clientY - rect.top) * scaleY;

        this.draggingMarker = this.getMarkerAt(x, y);
    }

    onTouchMove(e) {
        e.preventDefault();
        if (!this.draggingMarker) return;

        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const touch = e.touches[0];
        const x = (touch.clientX - rect.left) * scaleX;
        const y = (touch.clientY - rect.top) * scaleY;

        this.updateMarkerPosition(x, y);
    }

    onTouchEnd(e) {
        e.preventDefault();
        this.draggingMarker = null;
    }

    updateMarkerPosition(x, y) {
        if (!this.draggingMarker) return;

        const hsv = this.positionToHsv(x, y);
        const rgb = this.hsvToRgb(hsv.h, hsv.s, hsv.v);
        const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);

        this.draggingMarker.x = x;
        this.draggingMarker.y = y;
        this.draggingMarker.color = hex;
        this.draggingMarker.hsv = hsv;

        this.draw();

        // Call callback if set
        if (this.onMarkerMove) {
            this.onMarkerMove(this.draggingMarker.label, hex);
        }
    }
}

// Make it globally available
window.ColorWheel = ColorWheel;
