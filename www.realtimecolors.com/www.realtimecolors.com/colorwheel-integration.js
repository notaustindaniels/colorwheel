/**
 * Color Wheel Integration with Realtime Colors Toolbar
 * Provides bidirectional sync between the color wheel and toolbar
 */

(function() {
    'use strict';

    let colorWheel = null;
    let isUpdatingFromWheel = false;
    let isUpdatingFromToolbar = false;
    let aaaMode = false;

    // Harmony hue offsets for AAA mode
    // Offsets are for: [text, bg, primary, secondary, accent]
    // Text and bg use the primary hue but with very low saturation
    const HARMONY_OFFSETS = {
        'monochromatic': { secondary: 0, accent: 0 },      // Same hue, vary saturation
        'analogous': { secondary: 30, accent: -30 },       // Adjacent hues (±30°)
        'complementary': { secondary: 0, accent: 180 },    // Opposite hue for accent
        'split-complementary': { secondary: 150, accent: 210 }, // 150° and 210° from primary
        'triadic': { secondary: 120, accent: 240 },        // Three equally spaced (120° apart)
        'tetradic': { secondary: 90, accent: 180 }         // Four equally spaced (90° apart)
    };

    // Get the currently selected harmony from the dropdown
    function getSelectedHarmony() {
        const selectedScheme = document.querySelector('.selected-scheme');
        return selectedScheme ? selectedScheme.getAttribute('data-scheme') : 'all';
    }

    // Get colors that are currently locked
    function getLockedColors() {
        const colorNames = ['text', 'bg', 'primary', 'secondary', 'accent'];
        const locked = {};

        colorNames.forEach(name => {
            const lockBtn = document.getElementById(`${name}-lock`);
            if (lockBtn && lockBtn.classList.contains('locked')) {
                // Get current color value from input
                const input = document.getElementById(name);
                if (input && input.value) {
                    locked[name] = input.value.startsWith('#') ? input.value : '#' + input.value;
                }
            }
        });

        return locked;
    }

    // Normalize hue to 0-360 range
    function normalizeHue(hue) {
        return ((hue % 360) + 360) % 360;
    }

    // ============================================
    // WCAG AAA Contrast Helper Functions
    // ============================================

    // Convert hex to RGB
    function hexToRgb(hex) {
        hex = hex.replace('#', '');
        return {
            r: parseInt(hex.substr(0, 2), 16),
            g: parseInt(hex.substr(2, 2), 16),
            b: parseInt(hex.substr(4, 2), 16)
        };
    }

    // Convert RGB to hex
    function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    // Convert RGB to HSL
    function rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }
        return { h: h * 360, s: s * 100, l: l * 100 };
    }

    // Convert HSL to RGB
    function hslToRgb(h, s, l) {
        h /= 360; s /= 100; l /= 100;
        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    // Calculate relative luminance (WCAG formula)
    function getRelativeLuminance(rgb) {
        const [rs, gs, bs] = [rgb.r, rgb.g, rgb.b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }

    // Calculate contrast ratio between two colors
    function getContrastRatio(rgb1, rgb2) {
        const L1 = getRelativeLuminance(rgb1);
        const L2 = getRelativeLuminance(rgb2);
        const lighter = Math.max(L1, L2);
        const darker = Math.min(L1, L2);
        return (lighter + 0.05) / (darker + 0.05);
    }

    // ============================================
    // Contrast Indicator Update Functions
    // ============================================

    // SVG icons for contrast states (matching the native site's icons)
    const CONTRAST_ICONS = {
        // Green checkmark - AAA compliant (ratio >= 7.0)
        aaa: {
            path: 'M5 8L7.5 10.5L12 6M16 8.5C16 12.6421 12.6421 16 8.5 16C4.35786 16 1 12.6421 1 8.5C1 4.35786 4.35786 1 8.5 1C12.6421 1 16 4.35786 16 8.5Z',
            color: 'rgb(24, 172, 122)' // Green
        },
        // Yellow dash - AA only (4.5 <= ratio < 7.0)
        aa: {
            path: 'M1 8.5H16M16 8.5C16 12.6421 12.6421 16 8.5 16C4.35786 16 1 12.6421 1 8.5C1 4.35786 4.35786 1 8.5 1C12.6421 1 16 4.35786 16 8.5Z',
            color: 'rgb(230, 181, 74)' // Yellow/amber
        },
        // Red X - fails both (ratio < 4.5)
        fail: {
            path: 'M4 4L13 13M13 4L4 13M16 8.5C16 12.6421 12.6421 16 8.5 16C4.35786 16 1 12.6421 1 8.5C1 4.35786 4.35786 1 8.5 1C12.6421 1 16 4.35786 16 8.5Z',
            color: 'rgb(215, 85, 85)' // Red
        }
    };

    // Update a single contrast indicator based on actual measured contrast
    function updateContrastIndicator(colorName, fgHex, bgHex) {
        const indicator = document.querySelector(`.${colorName}-contrast`);
        if (!indicator) return;

        const fgRgb = hexToRgb(fgHex);
        const bgRgb = hexToRgb(bgHex);
        const ratio = getContrastRatio(fgRgb, bgRgb);

        // Determine which icon to show based on actual contrast ratio
        let icon;
        let label;
        if (ratio >= 7.0) {
            icon = CONTRAST_ICONS.aaa;
            label = 'AAA';
        } else if (ratio >= 4.5) {
            icon = CONTRAST_ICONS.aa;
            label = 'AA';
        } else {
            icon = CONTRAST_ICONS.fail;
            label = 'Fail';
        }

        // Update SVG path
        const svgCont = indicator.querySelector('.svg-cont');
        if (svgCont) {
            svgCont.innerHTML = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="${icon.path}" stroke="currentColor"></path></svg>`;
        }

        // Update color via CSS
        indicator.style.color = icon.color;

        // Update tooltip with actual ratio
        const tooltip = indicator.querySelector('.contrast-tooltip');
        if (tooltip) {
            tooltip.innerHTML = `${label} - ${ratio.toFixed(2)}:1<br><span style="font-size: var(--small); opacity: 60%; margin: 0;"><a href="/docs/contrast-checker" target="_blank">Learn more</a></span>`;
        }
    }

    // Update all contrast indicators based on actual color values
    function updateAllContrastIndicators(colors) {
        const bgHex = colors.bg;

        // Text contrasts with background
        updateContrastIndicator('text', colors.text, bgHex);

        // Background shows contrast with text (same ratio, different perspective)
        updateContrastIndicator('bg', colors.text, bgHex);

        // Primary, Secondary, Accent all contrast with background
        updateContrastIndicator('primary', colors.primary, bgHex);
        updateContrastIndicator('secondary', colors.secondary, bgHex);
        updateContrastIndicator('accent', colors.accent, bgHex);
    }

    // Generate a random color
    function generateRandomColor() {
        const h = Math.random() * 360;
        const s = 50 + Math.random() * 50; // 50-100% saturation
        const l = 30 + Math.random() * 40; // 30-70% lightness
        const rgb = hslToRgb(h, s, l);
        return rgbToHex(rgb.r, rgb.g, rgb.b);
    }

    // Adjust lightness to achieve target contrast ratio
    function adjustForContrast(baseHex, referenceHex, targetRatio, needsDarker) {
        const refRgb = hexToRgb(referenceHex);
        const refLuminance = getRelativeLuminance(refRgb);
        const baseRgb = hexToRgb(baseHex);
        const baseHsl = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);

        // Add a small buffer to ensure we exceed the target (avoids 6.97 vs 7.0 issues)
        const effectiveTarget = targetRatio + 0.1;

        // Determine if we need to go lighter or darker based on reference luminance
        // If reference is light (high luminance), we need darker color for contrast
        // If reference is dark (low luminance), we need lighter color for contrast
        const refIsLight = refLuminance > 0.5;
        const goLight = refIsLight ? false : true; // Go opposite of reference

        // Binary search for optimal lightness
        let minL, maxL;
        if (goLight) {
            minL = 50;
            maxL = 100;
        } else {
            minL = 0;
            maxL = 50;
        }

        let bestL = goLight ? 100 : 0;
        let bestContrast = 0;

        for (let i = 0; i < 25; i++) {
            const midL = (minL + maxL) / 2;
            const testRgb = hslToRgb(baseHsl.h, baseHsl.s, midL);
            const contrast = getContrastRatio(testRgb, refRgb);

            if (contrast > bestContrast) {
                bestContrast = contrast;
                bestL = midL;
            }

            if (contrast >= effectiveTarget) {
                // Found good contrast, try to get closer to middle (more natural looking)
                if (goLight) {
                    maxL = midL; // Try less light
                } else {
                    minL = midL; // Try less dark
                }
            } else {
                // Need more contrast, go more extreme
                if (goLight) {
                    minL = midL; // Try lighter
                } else {
                    maxL = midL; // Try darker
                }
            }
        }

        // If we couldn't achieve target, use the best we found
        const finalL = bestContrast >= targetRatio ? (minL + maxL) / 2 : bestL;
        const finalRgb = hslToRgb(baseHsl.h, baseHsl.s, finalL);
        return rgbToHex(finalRgb.r, finalRgb.g, finalRgb.b);
    }

    // Generate AAA compliant color palette with harmony support
    // Respects locked colors - only regenerates unlocked colors
    function generateAAACompliantColors() {
        // Get locked colors first
        const locked = getLockedColors();
        console.log('Locked colors:', locked);

        // 1. Get selected harmony (or pick random if "all")
        let harmony = getSelectedHarmony();
        if (harmony === 'all') {
            const harmonies = ['monochromatic', 'analogous', 'complementary', 'split-complementary', 'triadic', 'tetradic'];
            harmony = harmonies[Math.floor(Math.random() * harmonies.length)];
        }

        const offsets = HARMONY_OFFSETS[harmony] || HARMONY_OFFSETS['analogous'];
        console.log('Using harmony:', harmony, 'with offsets:', offsets);

        // Initialize result with locked colors
        let text = locked.text;
        let bg = locked.bg;
        let primary = locked.primary;
        let secondary = locked.secondary;
        let accent = locked.accent;

        // Determine the base hue for harmony calculations
        // Use locked primary's hue if available, otherwise generate random
        let primaryHue;
        if (locked.primary) {
            const lockedPrimaryRgb = hexToRgb(locked.primary);
            const lockedPrimaryHsl = rgbToHsl(lockedPrimaryRgb.r, lockedPrimaryRgb.g, lockedPrimaryRgb.b);
            primaryHue = lockedPrimaryHsl.h;
        } else {
            primaryHue = Math.random() * 360;
        }

        // Handle background generation/preservation
        let bgRgb, bgIsLight;
        if (locked.bg) {
            // Background is locked - use it as reference
            bgRgb = hexToRgb(locked.bg);
            bgIsLight = getRelativeLuminance(bgRgb) > 0.5;
        } else {
            // Generate new background that contrasts with all locked foreground colors
            // Collect all locked foreground colors to check contrast against
            const lockedFgColors = [];
            if (locked.primary) lockedFgColors.push(locked.primary);
            if (locked.secondary) lockedFgColors.push(locked.secondary);
            if (locked.accent) lockedFgColors.push(locked.accent);
            if (locked.text) lockedFgColors.push(locked.text);

            if (lockedFgColors.length > 0) {
                // Determine if we need light or dark background based on locked colors
                // Check the average luminance of locked colors
                let avgLuminance = 0;
                lockedFgColors.forEach(hex => {
                    avgLuminance += getRelativeLuminance(hexToRgb(hex));
                });
                avgLuminance /= lockedFgColors.length;

                // If locked colors are light, we need dark bg; if dark, we need light bg
                const needDarkBg = avgLuminance > 0.2;

                const bgHue = primaryHue;
                const bgSat = 3 + Math.random() * 5; // Very low saturation

                // Start with extreme lightness, then adjust if needed
                let bgLight = needDarkBg ? 5 : 95;
                bgRgb = hslToRgb(bgHue, bgSat, bgLight);
                bg = rgbToHex(bgRgb.r, bgRgb.g, bgRgb.b);

                // Verify contrast with all locked colors and adjust if needed
                let minContrast = Infinity;
                lockedFgColors.forEach(hex => {
                    const contrast = getContrastRatio(hexToRgb(hex), bgRgb);
                    if (contrast < minContrast) minContrast = contrast;
                });

                // If contrast is insufficient, go more extreme
                if (minContrast < 7.0) {
                    bgLight = needDarkBg ? 2 : 98;
                    bgRgb = hslToRgb(bgHue, bgSat, bgLight);
                    bg = rgbToHex(bgRgb.r, bgRgb.g, bgRgb.b);
                }
            } else {
                // No foreground colors locked - generate fresh bg based on primary hue
                const primarySat = 60 + Math.random() * 40;
                const primaryLight = 35 + Math.random() * 30;
                const tempPrimaryRgb = hslToRgb(primaryHue, primarySat, primaryLight);
                const primaryLuminance = getRelativeLuminance(tempPrimaryRgb);
                const primaryIsLight = primaryLuminance > 0.18;

                const bgHue = primaryHue;
                const bgSat = 3 + Math.random() * 7;
                const bgLight = primaryIsLight ? (3 + Math.random() * 7) : (93 + Math.random() * 5);
                bgRgb = hslToRgb(bgHue, bgSat, bgLight);
                bg = rgbToHex(bgRgb.r, bgRgb.g, bgRgb.b);
            }
            bgIsLight = getRelativeLuminance(bgRgb) > 0.5;
        }

        // Generate primary if not locked
        if (!locked.primary) {
            const primarySat = 60 + Math.random() * 40;
            const primaryLight = 35 + Math.random() * 30;
            let primaryRgb = hslToRgb(primaryHue, primarySat, primaryLight);
            primary = rgbToHex(primaryRgb.r, primaryRgb.g, primaryRgb.b);
            // Ensure contrast with background
            primary = adjustForContrast(primary, bg, 7.0, !bgIsLight);
        }

        // Generate text if not locked
        if (!locked.text) {
            const textHue = locked.bg ? rgbToHsl(bgRgb.r, bgRgb.g, bgRgb.b).h : primaryHue;
            const textSat = 3 + Math.random() * 7;
            let textLight = bgIsLight ? (5 + Math.random() * 10) : (90 + Math.random() * 8);
            let textRgb = hslToRgb(textHue, textSat, textLight);
            text = rgbToHex(textRgb.r, textRgb.g, textRgb.b);

            // Verify text has sufficient contrast with background
            let textContrast = getContrastRatio(hexToRgb(text), bgRgb);
            if (textContrast < 7.0) {
                textLight = bgIsLight ? 2 : 98;
                textRgb = hslToRgb(textHue, textSat, textLight);
                text = rgbToHex(textRgb.r, textRgb.g, textRgb.b);
            }
        }

        // Generate secondary if not locked
        if (!locked.secondary) {
            const secondaryHue = normalizeHue(primaryHue + offsets.secondary);
            const secondarySat = harmony === 'monochromatic'
                ? (30 + Math.random() * 30)
                : (50 + Math.random() * 30);
            let secondaryLight = bgIsLight ? (35 + Math.random() * 15) : (55 + Math.random() * 20);
            let secondaryRgb = hslToRgb(secondaryHue, secondarySat, secondaryLight);
            secondary = rgbToHex(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
            secondary = adjustForContrast(secondary, bg, 7.0, !bgIsLight);
        }

        // Generate accent if not locked
        if (!locked.accent) {
            const accentHue = normalizeHue(primaryHue + offsets.accent);
            const accentSat = harmony === 'monochromatic'
                ? (70 + Math.random() * 30)
                : (70 + Math.random() * 30);
            let accentLight = bgIsLight ? (35 + Math.random() * 15) : (55 + Math.random() * 20);
            let accentRgb = hslToRgb(accentHue, accentSat, accentLight);
            accent = rgbToHex(accentRgb.r, accentRgb.g, accentRgb.b);
            accent = adjustForContrast(accent, bg, 7.0, !bgIsLight);
        }

        // Log contrast ratios for verification
        console.log('AAA Colors generated with harmony:', harmony);
        console.log('Contrast ratios:', {
            'primary-bg': getContrastRatio(hexToRgb(primary), hexToRgb(bg)).toFixed(2),
            'text-bg': getContrastRatio(hexToRgb(text), hexToRgb(bg)).toFixed(2),
            'secondary-bg': getContrastRatio(hexToRgb(secondary), hexToRgb(bg)).toFixed(2),
            'accent-bg': getContrastRatio(hexToRgb(accent), hexToRgb(bg)).toFixed(2)
        });

        return { text, bg, primary, secondary, accent };
    }

    // Apply colors to the toolbar inputs
    function applyColors(colors) {
        const colorNames = ['text', 'bg', 'primary', 'secondary', 'accent'];

        colorNames.forEach(name => {
            const input = document.getElementById(name);
            if (input && colors[name]) {
                input.value = colors[name];

                // Trigger events to update UI
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));

                // Update CSS variable
                document.documentElement.style.setProperty('--' + name, colors[name]);
            }
        });

        // Sync color wheel markers and update contrast indicators
        setTimeout(() => {
            syncAllMarkers();
            // Update contrast checkmarks based on actual measured contrast ratios
            updateAllContrastIndicators(colors);
        }, 50);
    }

    // Create and inject AAA toggle button
    function createAAAToggle() {
        const randomizeBtn = document.getElementById('randomize');
        if (!randomizeBtn) {
            setTimeout(createAAAToggle, 100);
            return;
        }

        // Check if already created
        if (document.getElementById('aaa-toggle')) return;

        // Create AAA toggle button
        const aaaToggle = document.createElement('div');
        aaaToggle.id = 'aaa-toggle';
        aaaToggle.className = 'option colors-option utility-option aaa-toggle';
        aaaToggle.setAttribute('tabindex', '0');
        aaaToggle.innerHTML = `
            <span class="aaa-label">AAA</span>
            <span class="tooltip">AAA Compliant Mode (7:1 contrast)</span>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .aaa-toggle {
                display: flex !important;
                align-items: center;
                justify-content: center;
                padding: 8px 12px;
                border-radius: 8px;
                cursor: pointer;
                background: var(--bg);
                border: 2px solid var(--text);
                opacity: 0.5;
                transition: all 0.2s ease;
                position: relative;
                min-width: 50px;
                margin-left: 8px;
            }
            .aaa-toggle:hover {
                opacity: 0.8;
            }
            .aaa-toggle.active {
                opacity: 1;
                background: var(--primary);
                border-color: var(--primary);
            }
            .aaa-toggle.active .aaa-label {
                color: var(--bg);
                font-weight: bold;
            }
            .aaa-label {
                font-size: 12px;
                font-weight: 600;
                color: var(--text);
                letter-spacing: 0.5px;
            }
            .aaa-toggle .tooltip {
                position: absolute;
                bottom: calc(100% + 8px);
                left: 50%;
                transform: translateX(-50%);
                background: var(--text);
                color: var(--bg);
                padding: 6px 10px;
                border-radius: 6px;
                font-size: 11px;
                white-space: nowrap;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.2s;
            }
            .aaa-toggle:hover .tooltip {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);

        // Insert after randomize button
        randomizeBtn.parentNode.insertBefore(aaaToggle, randomizeBtn.nextSibling);

        // Add click handler
        aaaToggle.addEventListener('click', () => {
            aaaMode = !aaaMode;
            aaaToggle.classList.toggle('active', aaaMode);
            console.log('AAA Mode:', aaaMode ? 'ON' : 'OFF');
        });
    }

    // Initialize when DOM is ready
    function init() {
        // Wait for both ColorWheel class and DOM elements to be available
        if (typeof ColorWheel === 'undefined' || !document.getElementById('cw2canvas')) {
            setTimeout(init, 100);
            return;
        }

        // Create color wheel instance
        colorWheel = new ColorWheel('cw2canvas');

        // Setup marker movement callback
        colorWheel.onMarkerMove = handleMarkerMove;

        // Wait for toolbar elements to be available
        waitForToolbar();

        // Create AAA toggle button
        createAAAToggle();
    }

    function waitForToolbar() {
        const textInput = document.getElementById('text');
        const bgInput = document.getElementById('bg');
        const primaryInput = document.getElementById('primary');
        const secondaryInput = document.getElementById('secondary');
        const accentInput = document.getElementById('accent');

        if (!textInput || !bgInput || !primaryInput || !secondaryInput || !accentInput) {
            setTimeout(waitForToolbar, 100);
            return;
        }

        // Initialize markers with current toolbar colors
        initializeMarkers();

        // Setup toolbar listeners
        setupToolbarListeners();

        // Setup randomize button listener
        setupRandomizeListener();
    }

    function initializeMarkers() {
        const textInput = document.getElementById('text');
        const bgInput = document.getElementById('bg');
        const primaryInput = document.getElementById('primary');
        const secondaryInput = document.getElementById('secondary');
        const accentInput = document.getElementById('accent');

        // Add markers in the order they appear in the theme panel
        colorWheel.addMarker(textInput.value, 'text');
        colorWheel.addMarker(bgInput.value, 'bg');
        colorWheel.addMarker(primaryInput.value, 'primary');
        colorWheel.addMarker(secondaryInput.value, 'secondary');
        colorWheel.addMarker(accentInput.value, 'accent');
    }

    function setupToolbarListeners() {
        const inputs = [
            { id: 'text', label: 'text' },
            { id: 'bg', label: 'bg' },
            { id: 'primary', label: 'primary' },
            { id: 'secondary', label: 'secondary' },
            { id: 'accent', label: 'accent' }
        ];

        inputs.forEach(({ id, label }) => {
            const input = document.getElementById(id);
            if (!input) return;

            // Listen for input changes
            input.addEventListener('input', (e) => {
                if (isUpdatingFromWheel) return;
                isUpdatingFromToolbar = true;
                updateWheelFromToolbar(label, e.target.value);
                isUpdatingFromToolbar = false;
            });

            // Also listen for change events (when color picker is used)
            input.addEventListener('change', (e) => {
                if (isUpdatingFromWheel) return;
                isUpdatingFromToolbar = true;
                updateWheelFromToolbar(label, e.target.value);
                isUpdatingFromToolbar = false;
            });
        });

        // Also watch for mutations in case the toolbar updates colors programmatically
        const observer = new MutationObserver((mutations) => {
            if (isUpdatingFromWheel || isUpdatingFromToolbar) return;

            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
                    const input = mutation.target;
                    const label = input.id;
                    if (['text', 'bg', 'primary', 'secondary', 'accent'].includes(label)) {
                        isUpdatingFromToolbar = true;
                        updateWheelFromToolbar(label, input.value);
                        isUpdatingFromToolbar = false;
                    }
                }
            });
        });

        inputs.forEach(({ id }) => {
            const input = document.getElementById(id);
            if (input) {
                observer.observe(input, { attributes: true });
            }
        });
    }

    function setupRandomizeListener() {
        // Look for the randomize/shuffle button
        // The button might be added dynamically, so we'll use event delegation
        document.addEventListener('click', (e) => {
            // Check if clicked element or its parents have shuffle/randomize functionality
            let target = e.target;
            let depth = 0;

            while (target && depth < 5) {
                // Check for common randomize button identifiers
                if (target.id === 'shuffle' ||
                    target.id === 'randomize' ||
                    target.classList?.contains('shuffle') ||
                    target.classList?.contains('randomize') ||
                    target.getAttribute?.('data-action') === 'shuffle') {

                    // Check if click is on the settings arrow, dropdown panel, or scheme options
                    // If so, let it through even in AAA mode
                    const isSettingsInteraction = e.target.closest('.open-option-settings, .randomize-option, .option-settings, .scheme-option');
                    if (isSettingsInteraction) {
                        // Don't intercept - let native handler manage the dropdown/selection
                        return;
                    }

                    // If AAA mode is on, intercept and generate compliant colors
                    if (aaaMode) {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();

                        const colors = generateAAACompliantColors();
                        applyColors(colors);

                        console.log('AAA Compliant colors generated:', colors);
                        return;
                    }

                    // Wait a bit for the toolbar to update, then sync the wheel
                    setTimeout(() => {
                        isUpdatingFromWheel = false;
                        isUpdatingFromToolbar = false;
                        syncAllMarkers();
                    }, 150);
                    break;
                }
                target = target.parentElement;
                depth++;
            }
        }, true); // Use capture phase to intercept before other handlers

        // Also watch for keyboard shortcuts that might trigger randomization
        document.addEventListener('keydown', (e) => {
            // Common randomize shortcuts: Space, R, etc.
            if (e.code === 'Space' && !e.target.matches('input, textarea')) {
                // If AAA mode is on, intercept and generate compliant colors
                if (aaaMode) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();

                    const colors = generateAAACompliantColors();
                    applyColors(colors);

                    console.log('AAA Compliant colors generated (spacebar):', colors);
                    return;
                }

                setTimeout(() => {
                    isUpdatingFromWheel = false;
                    isUpdatingFromToolbar = false;
                    syncAllMarkers();
                }, 150);
            }
        }, true); // Use capture phase
    }

    function updateWheelFromToolbar(label, color) {
        if (!colorWheel || !color) return;

        // Normalize hex color
        if (!color.startsWith('#')) {
            color = '#' + color;
        }

        colorWheel.updateMarker(label, color);
    }

    function handleMarkerMove(label, color) {
        if (isUpdatingFromToolbar) return;

        isUpdatingFromWheel = true;

        // Update the corresponding toolbar input
        const input = document.getElementById(label);
        if (input) {
            input.value = color;

            // Trigger input and change events to update the UI
            const inputEvent = new Event('input', { bubbles: true });
            const changeEvent = new Event('change', { bubbles: true });

            input.dispatchEvent(inputEvent);
            input.dispatchEvent(changeEvent);

            // Also update any associated UI elements
            updateToolbarUI(label, color);
        }

        isUpdatingFromWheel = false;
    }

    function updateToolbarUI(label, color) {
        // Update CSS variables - the toolbar uses CSS variables for styling
        const root = document.documentElement;
        const varName = '--' + label;
        root.style.setProperty(varName, color);
    }

    function syncAllMarkers() {
        const inputs = ['text', 'bg', 'primary', 'secondary', 'accent'];

        inputs.forEach(label => {
            const input = document.getElementById(label);
            if (input && input.value) {
                updateWheelFromToolbar(label, input.value);
                // Also sync the CSS variable to match the input value
                updateToolbarUI(label, input.value);
            }
        });
    }

    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Make functions available globally for debugging
    window.colorWheelIntegration = {
        syncAllMarkers,
        updateWheelFromToolbar,
        getColorWheel: () => colorWheel
    };
})();
