/**
 * Color Wheel Integration with Realtime Colors Toolbar
 * Provides bidirectional sync between the color wheel and toolbar
 */

(function() {
    'use strict';

    let colorWheel = null;
    let isUpdatingFromWheel = false;
    let isUpdatingFromToolbar = false;

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
        });

        // Also watch for keyboard shortcuts that might trigger randomization
        document.addEventListener('keydown', (e) => {
            // Common randomize shortcuts: Space, R, etc.
            if (e.code === 'Space' && !e.target.matches('input, textarea')) {
                setTimeout(() => {
                    isUpdatingFromWheel = false;
                    isUpdatingFromToolbar = false;
                    syncAllMarkers();
                }, 150);
            }
        });
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
