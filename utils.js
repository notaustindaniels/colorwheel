/**
 * Utility functions for color conversions and coordinate transformations
 */

// Convert HSV to RGB
function hsvToRgb(h, s, v) {
    // h: 0-360, s: 0-100, v: 0-100
    s = s / 100;
    v = v / 100;

    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;

    let r, g, b;

    if (h >= 0 && h < 60) {
        [r, g, b] = [c, x, 0];
    } else if (h >= 60 && h < 120) {
        [r, g, b] = [x, c, 0];
    } else if (h >= 120 && h < 180) {
        [r, g, b] = [0, c, x];
    } else if (h >= 180 && h < 240) {
        [r, g, b] = [0, x, c];
    } else if (h >= 240 && h < 300) {
        [r, g, b] = [x, 0, c];
    } else {
        [r, g, b] = [c, 0, x];
    }

    return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255)
    };
}

// Convert RGB to HSV
function rgbToHsv(r, g, b) {
    r = r / 255;
    g = g / 255;
    b = b / 255;

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
        s: s * 100,
        v: v * 100
    };
}

// Convert RGB to hex
function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
}

// Convert polar coordinates to cartesian (for positioning markers)
function polarToCartesian(centerX, centerY, radius, angleDegrees) {
    const angleRadians = (angleDegrees - 90) * Math.PI / 180;

    return {
        x: centerX + (radius * Math.cos(angleRadians)),
        y: centerY + (radius * Math.sin(angleRadians))
    };
}

// Convert cartesian coordinates to polar
function cartesianToPolar(centerX, centerY, x, y) {
    const dx = x - centerX;
    const dy = y - centerY;

    const radius = Math.sqrt(dx * dx + dy * dy);
    let angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;

    if (angle < 0) angle += 360;
    if (angle >= 360) angle -= 360;

    return { radius, angle };
}

// Normalize angle to 0-360 range
function normalizeAngle(angle) {
    while (angle < 0) angle += 360;
    while (angle >= 360) angle -= 360;
    return angle;
}

// Clamp value between min and max
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// Calculate angular distance between two angles
function angleDelta(angle1, angle2) {
    let delta = angle2 - angle1;
    while (delta > 180) delta -= 360;
    while (delta < -180) delta += 360;
    return delta;
}
