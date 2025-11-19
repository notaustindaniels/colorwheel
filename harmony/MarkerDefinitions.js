/**
 * Marker Definitions for All Harmony Types
 * Based on Adobe Color specifications
 *
 * Each harmony type has configurations for different marker counts (2-20)
 * The base color is #0015FA (h=234°, s=94%, v=98%) for all harmonies
 * The '<' symbol in the original files indicates the base/primary marker
 */

class MarkerDefinitions {
    constructor() {
        // Store all marker configurations
        this.definitions = {
            analogous: this.getAnalogousDefinitions(),
            monochromatic: this.getMonochromaticDefinitions(),
            triad: this.getTriadDefinitions(),
            complementary: this.getComplementaryDefinitions(),
            'split-complementary': this.getSplitComplementaryDefinitions(),
            square: this.getSquareDefinitions(),
            compound: this.getCompoundDefinitions()
        };
    }

    /**
     * Get marker configuration for a specific harmony and marker count
     */
    getConfiguration(harmonyType, markerCount) {
        const harmonyDef = this.definitions[harmonyType];
        if (!harmonyDef) {
            console.error(`Unknown harmony type: ${harmonyType}`);
            return null;
        }

        const config = harmonyDef[markerCount];
        if (!config) {
            console.error(`No configuration for ${harmonyType} with ${markerCount} markers`);
            return null;
        }

        return config;
    }

    /**
     * Get valid marker count range for a harmony type
     */
    getMarkerRange(harmonyType) {
        const harmonyDef = this.definitions[harmonyType];
        if (!harmonyDef) return { min: 3, max: 20 };

        const counts = Object.keys(harmonyDef).map(Number).sort((a, b) => a - b);
        return {
            min: counts[0],
            max: counts[counts.length - 1]
        };
    }

    /**
     * Convert hex color to HSV
     */
    hexToHSV(hex) {
        // Remove # if present
        hex = hex.replace('#', '');

        // Parse RGB
        const r = parseInt(hex.substr(0, 2), 16) / 255;
        const g = parseInt(hex.substr(2, 2), 16) / 255;
        const b = parseInt(hex.substr(4, 2), 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;

        let h = 0;
        let s = 0;
        const v = max;

        if (delta !== 0) {
            s = delta / max;

            if (max === r) {
                h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
            } else if (max === g) {
                h = ((b - r) / delta + 2) / 6;
            } else {
                h = ((r - g) / delta + 4) / 6;
            }
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            v: Math.round(v * 100)
        };
    }

    /**
     * Create configuration from hex colors
     */
    createConfig(hexColors, baseIndex) {
        const colors = hexColors.map(hex => this.hexToHSV(hex));
        const baseColor = colors[baseIndex];

        // Calculate offsets from base color
        const angleOffsets = {};
        const saturationOffsets = {};

        colors.forEach((color, index) => {
            // Calculate angle offset
            let angleDelta = color.h - baseColor.h;
            // Normalize to -180 to 180 range
            while (angleDelta > 180) angleDelta -= 360;
            while (angleDelta < -180) angleDelta += 360;
            angleOffsets[index] = angleDelta;

            // Calculate saturation offset (linear)
            saturationOffsets[index] = color.s - baseColor.s;
        });

        return {
            numColors: colors.length,
            baseColorIndex: baseIndex,
            angleOffsets,
            saturationOffsets,
            colors // Store actual colors for reference
        };
    }

    getAnalogousDefinitions() {
        return {
            3: this.createConfig(['#0064FA', '#3C00FA', '#0015FA'], 2),
            4: this.createConfig(['#0064FA', '#3C00FA', '#0015FA', '#3D427A'], 2),
            5: this.createConfig(['#0064FA', '#3C00FA', '#0015FA', '#00B3FA', '#8E00FA'], 2),
            6: this.createConfig(['#0064FA', '#3C00FA', '#0015FA', '#00B3FA', '#8E00FA', '#5361FA'], 2),
            7: this.createConfig(['#0064FA', '#3C00FA', '#0015FA', '#00B3FA', '#8E00FA', '#5361FA', '#3D567A'], 2),
            8: this.createConfig(['#0064FA', '#3C00FA', '#0015FA', '#00B3FA', '#8E00FA', '#5361FA', '#3D567A', '#4C3D7A'], 2),
            9: this.createConfig(['#0064FA', '#3C00FA', '#0015FA', '#00B3FA', '#8E00FA', '#5361FA', '#3D567A', '#4C3D7A', '#3D697A'], 2),
            10: this.createConfig(['#0064FA', '#3C00FA', '#0015FA', '#00B3FA', '#8E00FA', '#5361FA', '#3D567A', '#4C3D7A', '#3D697A', '#603D7A'], 2),
            11: this.createConfig(['#0064FA', '#3C00FA', '#0015FA', '#00B3FA', '#8E00FA', '#3E4EFA', '#3763A5', '#5137A5', '#3786A5', '#7537A5', '#7D87FA'], 2),
            12: this.createConfig(['#0064FA', '#3C00FA', '#0015FA', '#00B3FA', '#8E00FA', '#3E4EFA', '#3763A5', '#5137A5', '#3786A5', '#7537A5', '#7D87FA', '#354050'], 2),
            13: this.createConfig(['#0064FA', '#3C00FA', '#0015FA', '#00B3FA', '#8E00FA', '#3E4EFA', '#3763A5', '#5137A5', '#3786A5', '#7537A5', '#7D87FA', '#354050', '#3C3550'], 2),
            14: this.createConfig(['#0064FA', '#3C00FA', '#0015FA', '#00B3FA', '#8E00FA', '#3E4EFA', '#3763A5', '#5137A5', '#3786A5', '#7537A5', '#7D87FA', '#354050', '#3C3550', '#354850'], 2),
            15: this.createConfig(['#0064FA', '#3C00FA', '#0015FA', '#00B3FA', '#8E00FA', '#3E4EFA', '#3763A5', '#5137A5', '#3786A5', '#7537A5', '#7D87FA', '#354050', '#3C3550', '#354850', '#443550'], 2),
            16: this.createConfig(['#0064FA', '#3C00FA', '#0015FA', '#00B3FA', '#8E00FA', '#3243FA', '#2F66BA', '#502FBA', '#2F92BA', '#7E2FBA', '#6470FA', '#3D567A', '#4C3D7A', '#3D697A', '#603D7A', '#969EFA'], 2),
            17: this.createConfig(['#0064FA', '#3C00FA', '#0015FA', '#00B3FA', '#8E00FA', '#3243FA', '#2F66BA', '#502FBA', '#2F92BA', '#7E2FBA', '#6470FA', '#3D567A', '#4C3D7A', '#3D697A', '#603D7A', '#969EFA', '#2C323B'], 2),
            18: this.createConfig(['#0064FA', '#3C00FA', '#0015FA', '#00B3FA', '#8E00FA', '#3243FA', '#2F66BA', '#502FBA', '#2F92BA', '#7E2FBA', '#6470FA', '#3D567A', '#4C3D7A', '#3D697A', '#603D7A', '#969EFA', '#2C323B', '#302C3B'], 2),
            19: this.createConfig(['#0064FA', '#3C00FA', '#0015FA', '#00B3FA', '#8E00FA', '#3243FA', '#2F66BA', '#502FBA', '#2F92BA', '#7E2FBA', '#6470FA', '#3D567A', '#4C3D7A', '#3D697A', '#603D7A', '#969EFA', '#2C323B', '#302C3B', '#2C363B'], 2),
            20: this.createConfig(['#0064FA', '#3C00FA', '#0015FA', '#00B3FA', '#8E00FA', '#3243FA', '#2F66BA', '#502FBA', '#2F92BA', '#7E2FBA', '#6470FA', '#3D567A', '#4C3D7A', '#3D697A', '#603D7A', '#969EFA', '#2C323B', '#302C3B', '#2C363B', '#342C3B'], 2)
        };
    }

    getMonochromaticDefinitions() {
        return {
            2: this.createConfig(['#3D427A', '#0015FA'], 1),
            3: this.createConfig(['#3740A5', '#353750', '#0015FA'], 2),
            4: this.createConfig(['#2F3ABA', '#3D427A', '#0015FA', '#2C2D3B'], 2),
            5: this.createConfig(['#2835C7', '#3B4394', '#0015FA', '#3A3D61', '#292A33'], 2),
            6: this.createConfig(['#2331CF', '#3740A5', '#0015FA', '#3D427A', '#353750', '#2B2B33'], 2),
            7: this.createConfig(['#1E2ED5', '#333DB1', '#0015FA', '#3C438D', '#3C3F68', '#303244', '#2C2C33'], 2),
            8: this.createConfig(['#1B2BDA', '#2F3ABA', '#0015FA', '#3A429A', '#3D427A', '#393B5B', '#2C2D3B', '#2D2D33'], 2),
            9: this.createConfig(['#1929DE', '#2B37C1', '#0015FA', '#3740A5', '#3D4389', '#3C406C', '#353750', '#282934', '#2D2E33'], 2),
            10: this.createConfig(['#1627E0', '#2835C7', '#0015FA', '#343EAD', '#3B4394', '#3D427A', '#3A3D61', '#323447', '#292A33', '#2E2E33'], 2),
            11: this.createConfig(['#1526E3', '#2533CC', '#0015FA', '#313CB4', '#39419D', '#3D4386', '#3C416F', '#383A58', '#2F3040', '#2A2B33', '#2D2E33'], 2),
            12: this.createConfig(['#1325E5', '#2331CF', '#0015FA', '#2F3ABA', '#3740A5', '#3C4390', '#3D427A', '#3B3F65', '#353750', '#2C2D3B', '#2B2B33', '#2D2E33'], 2),
            13: this.createConfig(['#1223E6', '#202FD3', '#0015FA', '#2C38BF', '#353FAB', '#3A4298', '#3D4384', '#3D4171', '#393C5D', '#333549', '#292A36', '#2B2C33', '#2D2D33'], 2),
            14: this.createConfig(['#1122E8', '#1E2ED5', '#0015FA', '#2A37C3', '#333DB1', '#39419F', '#3C438D', '#3D427A', '#3C3F68', '#373A56', '#303244', '#282933', '#2C2C33', '#2C2D33'], 2),
            15: this.createConfig(['#1022E9', '#1D2CD8', '#0015FA', '#2835C7', '#313CB6', '#3740A5', '#3B4394', '#3D4383', '#3D4172', '#3A3D61', '#353750', '#2E303F', '#292A33', '#2C2D33', '#2C2D33'], 2),
            16: this.createConfig(['#0F21EA', '#1B2BDA', '#0015FA', '#2634CA', '#2F3ABA', '#353FAA', '#3A429A', '#3D438A', '#3D427A', '#3C406A', '#393B5B', '#33354B', '#2C2D3B', '#292A33', '#2D2D33', '#2C2D33'], 2),
            17: this.createConfig(['#0E20EB', '#1A2ADC', '#0015FA', '#2432CD', '#2D39BE', '#333EAF', '#3841A0', '#3C4391', '#3D4382', '#3D4173', '#3B3E64', '#373955', '#313346', '#2A2B37', '#2A2B33', '#2D2E33', '#2C2C33'], 2),
            18: this.createConfig(['#0D20EC', '#1929DE', '#0015FA', '#2331CF', '#2B37C1', '#323DB3', '#3740A5', '#3B4297', '#3D4389', '#3D427A', '#3C406C', '#393D5E', '#353750', '#2F3142', '#282934', '#2B2B33', '#2D2E33', '#2C2C33'], 2),
            19: this.createConfig(['#0C1FEC', '#1728DF', '#0015FA', '#2130D2', '#2936C4', '#303BB7', '#353FA9', '#39429C', '#3C438F', '#3D4381', '#3D4174', '#3B3F66', '#383B59', '#34364B', '#2E2F3E', '#282933', '#2B2C33', '#2E2E33', '#2B2C33'], 2),
            20: this.createConfig(['#0C1FED', '#1627E0', '#0015FA', '#202FD4', '#2835C7', '#2F3ABA', '#343EAD', '#3841A1', '#3B4394', '#3D4387', '#3D427A', '#3C406E', '#3A3D61', '#373954', '#323447', '#2C2D3B', '#292A33', '#2B2C33', '#2E2E33', '#2B2C33'], 2)
        };
    }

    getTriadDefinitions() {
        return {
            3: this.createConfig(['#56FA00', '#FA4900', '#0015FA'], 2),
            4: this.createConfig(['#56FA00', '#FA4900', '#0015FA', '#3740A5'], 2),
            5: this.createConfig(['#56FA00', '#FA4900', '#0015FA', '#3740A5', '#527A3D'], 2),
            6: this.createConfig(['#56FA00', '#FA4900', '#0015FA', '#3740A5', '#527A3D', '#7A4F3D'], 2),
            7: this.createConfig(['#56FA00', '#FA4900', '#0015FA', '#2F3ABA', '#5DA537', '#A55737', '#3D427A'], 2),
            8: this.createConfig(['#56FA00', '#FA4900', '#0015FA', '#2F3ABA', '#5DA537', '#A55737', '#3D427A', '#3E5035'], 2),
            9: this.createConfig(['#56FA00', '#FA4900', '#0015FA', '#2F3ABA', '#5DA537', '#A55737', '#3D427A', '#3E5035', '#503D35'], 2),
            10: this.createConfig(['#56FA00', '#FA4900', '#0015FA', '#2835C7', '#5EBA2F', '#BA582F', '#3B4394', '#527A3D', '#7A4F3D', '#3A3D61'], 2),
            11: this.createConfig(['#56FA00', '#FA4900', '#0015FA', '#2835C7', '#5EBA2F', '#BA582F', '#3B4394', '#527A3D', '#7A4F3D', '#3A3D61', '#313B2C'], 2),
            12: this.createConfig(['#56FA00', '#FA4900', '#0015FA', '#2835C7', '#5EBA2F', '#BA582F', '#3B4394', '#527A3D', '#7A4F3D', '#3A3D61', '#313B2C', '#3B302C'], 2),
            13: this.createConfig(['#56FA00', '#FA4900', '#0015FA', '#2331CF', '#5EC728', '#C75728', '#3740A5', '#5A943B', '#94553B', '#3D427A', '#47613A', '#61463A', '#353750'], 2),
            14: this.createConfig(['#56FA00', '#FA4900', '#0015FA', '#2331CF', '#5EC728', '#C75728', '#3740A5', '#5A943B', '#94553B', '#3D427A', '#47613A', '#61463A', '#353750', '#2C3329'], 2),
            15: this.createConfig(['#56FA00', '#FA4900', '#0015FA', '#2331CF', '#5EC728', '#C75728', '#3740A5', '#5A943B', '#94553B', '#3D427A', '#47613A', '#61463A', '#353750', '#2C3329', '#332C29'], 2),
            16: this.createConfig(['#56FA00', '#FA4900', '#0015FA', '#1E2ED5', '#5ECF23', '#CF5523', '#333DB1', '#5DA537', '#A55737', '#3C438D', '#527A3D', '#7A4F3D', '#3C3F68', '#3E5035', '#503D35', '#303244'], 2),
            17: this.createConfig(['#56FA00', '#FA4900', '#0015FA', '#1E2ED5', '#5ECF23', '#CF5523', '#333DB1', '#5DA537', '#A55737', '#3C438D', '#527A3D', '#7A4F3D', '#3C3F68', '#3E5035', '#503D35', '#303244', '#2D332B'], 2),
            18: this.createConfig(['#56FA00', '#FA4900', '#0015FA', '#1E2ED5', '#5ECF23', '#CF5523', '#333DB1', '#5DA537', '#A55737', '#3C438D', '#527A3D', '#7A4F3D', '#3C3F68', '#3E5035', '#503D35', '#303244', '#2D332B', '#332D2B'], 2),
            19: this.createConfig(['#56FA00', '#FA4900', '#0015FA', '#1B2BDA', '#5DD51E', '#D5541E', '#2F3ABA', '#5EB133', '#B15833', '#3A429A', '#588D3C', '#8D543C', '#3D427A', '#4B683C', '#68493C', '#393B5B', '#374430', '#443630', '#2C2D3B'], 2),
            20: this.createConfig(['#56FA00', '#FA4900', '#0015FA', '#1B2BDA', '#5DD51E', '#D5541E', '#2F3ABA', '#5EB133', '#B15833', '#3A429A', '#588D3C', '#8D543C', '#3D427A', '#4B683C', '#68493C', '#393B5B', '#374430', '#443630', '#2C2D3B', '#2E332C'], 2)
        };
    }

    getComplementaryDefinitions() {
        return {
            2: this.createConfig(['#FAC500', '#0115FA'], 1),
            3: this.createConfig(['#FAC500', '#3740A5', '#0015FA'], 2),
            4: this.createConfig(['#FAC500', '#3740A5', '#0015FA', '#7A6D3D'], 2),
            5: this.createConfig(['#FAC500', '#2F3ABA', '#0015FA', '#A58D37', '#3D427A'], 2),
            6: this.createConfig(['#FAC500', '#2F3ABA', '#0015FA', '#A58D37', '#3D427A', '#504A35'], 2),
            7: this.createConfig(['#FAC500', '#2835C7', '#0015FA', '#BA9C2F', '#3B4394', '#7A6D3D', '#3A3D61'], 2),
            8: this.createConfig(['#FAC500', '#2835C7', '#0015FA', '#BA9C2F', '#3B4394', '#7A6D3D', '#3A3D61', '#3B382C'], 2),
            9: this.createConfig(['#FAC500', '#2331CF', '#0015FA', '#C7A528', '#3740A5', '#94813B', '#3D427A', '#61593A', '#353750'], 2),
            10: this.createConfig(['#FAC500', '#2331CF', '#0015FA', '#C7A528', '#3740A5', '#94813B', '#3D427A', '#61593A', '#353750', '#333129'], 2),
            11: this.createConfig(['#FAC500', '#1E2ED5', '#0015FA', '#CFAB23', '#333DB1', '#A58D37', '#3C438D', '#7A6D3D', '#3C3F68', '#504A35', '#303244'], 2),
            12: this.createConfig(['#FAC500', '#1E2ED5', '#0015FA', '#CFAB23', '#333DB1', '#A58D37', '#3C438D', '#7A6D3D', '#3C3F68', '#504A35', '#303244', '#33312B'], 2),
            13: this.createConfig(['#FAC500', '#1B2BDA', '#0015FA', '#D5AE1E', '#2F3ABA', '#B19633', '#3A429A', '#8D7B3C', '#3D427A', '#685F3C', '#393B5B', '#444030', '#2C2D3B'], 2),
            14: this.createConfig(['#FAC500', '#1B2BDA', '#0015FA', '#D5AE1E', '#2F3ABA', '#B19633', '#3A429A', '#8D7B3C', '#3D427A', '#685F3C', '#393B5B', '#444030', '#2C2D3B', '#33312C'], 2),
            15: this.createConfig(['#FAC500', '#1929DE', '#0015FA', '#DAB11B', '#2B37C1', '#BA9C2F', '#3740A5', '#9A863A', '#3D4389', '#7A6D3D', '#3C406C', '#5B5339', '#353750', '#3B382C', '#282934'], 2),
            16: this.createConfig(['#FAC500', '#1929DE', '#0015FA', '#DAB11B', '#2B37C1', '#BA9C2F', '#3740A5', '#9A863A', '#3D4389', '#7A6D3D', '#3C406C', '#5B5339', '#353750', '#3B382C', '#282934', '#33322D'], 2),
            17: this.createConfig(['#FAC500', '#1627E0', '#0015FA', '#DEB419', '#2835C7', '#C1A12B', '#343EAD', '#A58D37', '#3B4394', '#89783D', '#3D427A', '#6C623C', '#3A3D61', '#504A35', '#323447', '#343128', '#292A33'], 2),
            18: this.createConfig(['#FAC500', '#1627E0', '#0015FA', '#DEB419', '#2835C7', '#C1A12B', '#343EAD', '#A58D37', '#3B4394', '#89783D', '#3D427A', '#6C623C', '#3A3D61', '#504A35', '#323447', '#343128', '#292A33', '#33322D'], 2),
            19: this.createConfig(['#FAC500', '#1526E3', '#0015FA', '#E0B516', '#2533CC', '#C7A528', '#313CB4', '#AD9434', '#39419D', '#94813B', '#3D4386', '#7A6D3D', '#3C416F', '#61593A', '#383A58', '#474332', '#2F3040', '#333129', '#2A2B33'], 2),
            20: this.createConfig(['#FAC500', '#1526E3', '#0015FA', '#E0B516', '#2533CC', '#C7A528', '#313CB4', '#AD9434', '#39419D', '#94813B', '#3D4386', '#7A6D3D', '#3C416F', '#61593A', '#383A58', '#474332', '#2F3040', '#333129', '#2A2B33', '#33322E'], 2)
        };
    }

    getSplitComplementaryDefinitions() {
        return {
            3: this.createConfig(['#FAE300', '#FAA600', '#0015FA'], 2),
            4: this.createConfig(['#FAE300', '#FAA600', '#0015FA', '#3D427A'], 2),
            5: this.createConfig(['#FAE300', '#FAA600', '#0015FA', '#3D427A', '#7A753D'], 2),
            6: this.createConfig(['#FAE300', '#FAA600', '#0015FA', '#3D427A', '#7A753D', '#7A663D'], 2),
            7: this.createConfig(['#FAE300', '#FAA600', '#0015FA', '#3740A5', '#A59B37', '#353750'], 2),
            8: this.createConfig(['#FAE300', '#FAA600', '#0015FA', '#3740A5', '#A59B37', '#353750', '#504D35'], 2),
            9: this.createConfig(['#FAE300', '#FAA600', '#0015FA', '#3740A5', '#A59B37', '#A58037', '#353750', '#504D35', '#504735'], 2),
            10: this.createConfig(['#FAE300', '#FAA600', '#0015FA', '#2F3ABA', '#BAAD2F', '#BA8B2F', '#3D427A', '#7A753D', '#7A663D', '#2C2D3B'], 2),
            11: this.createConfig(['#FAE300', '#FAA600', '#0015FA', '#2F3ABA', '#BAAD2F', '#BA8B2F', '#3D427A', '#7A753D', '#7A663D', '#2C2D3B', '#3B392C'], 2),
            12: this.createConfig(['#FAE300', '#FAA600', '#0015FA', '#2F3ABA', '#BAAD2F', '#BA8B2F', '#3D427A', '#7A753D', '#7A663D', '#2C2D3B', '#3B392C', '#3B362C'], 2),
            13: this.createConfig(['#FAE300', '#FAA600', '#0015FA', '#2835C7', '#C7B828', '#C79228', '#3B4394', '#948C3B', '#94763B', '#3A3D61', '#615D3A', '#61543A', '#292A33'], 2),
            14: this.createConfig(['#FAE300', '#FAA600', '#0015FA', '#2835C7', '#C7B828', '#C79228', '#3B4394', '#948C3B', '#94763B', '#3A3D61', '#615D3A', '#61543A', '#292A33', '#333229'], 2),
            15: this.createConfig(['#FAE300', '#FAA600', '#0015FA', '#2835C7', '#C7B828', '#C79228', '#3B4394', '#948C3B', '#94763B', '#3A3D61', '#615D3A', '#61543A', '#292A33', '#333229', '#333029'], 2),
            16: this.createConfig(['#FAE300', '#FAA600', '#0015FA', '#2331CF', '#CFBF23', '#CF9623', '#3740A5', '#A59B37', '#A58037', '#3D427A', '#7A753D', '#7A663D', '#353750', '#504D35', '#504735', '#2B2B33'], 2),
            17: this.createConfig(['#FAE300', '#FAA600', '#0015FA', '#2331CF', '#CFBF23', '#CF9623', '#3740A5', '#A59B37', '#A58037', '#3D427A', '#7A753D', '#7A663D', '#353750', '#504D35', '#504735', '#2B2B33', '#33322B'], 2),
            18: this.createConfig(['#FAE300', '#FAA600', '#0015FA', '#2331CF', '#CFBF23', '#CF9623', '#3740A5', '#A59B37', '#A58037', '#3D427A', '#7A753D', '#7A663D', '#353750', '#504D35', '#504735', '#2B2B33', '#33322B', '#33302B'], 2),
            19: this.createConfig(['#FAE300', '#FAA600', '#0015FA', '#1E2ED5', '#D5C51E', '#D5981E', '#333DB1', '#B1A533', '#B18733', '#3C438D', '#8D853C', '#8D723C', '#3C3F68', '#68643C', '#68593C', '#303244', '#444230', '#443D30', '#2C2C33'], 2),
            20: this.createConfig(['#FAE300', '#FAA600', '#0015FA', '#1E2ED5', '#D5C51E', '#D5981E', '#333DB1', '#B1A533', '#B18733', '#3C438D', '#8D853C', '#8D723C', '#3C3F68', '#68643C', '#68593C', '#303244', '#444230', '#443D30', '#2C2C33', '#33322C'], 2)
        };
    }

    getSquareDefinitions() {
        return {
            4: this.createConfig(['#00FA48', '#FAC500', '#0015FA', '#FA0100'], 2),
            5: this.createConfig(['#00FA48', '#FAC500', '#0015FA', '#FA0100', '#3740A5'], 2),
            6: this.createConfig(['#00FA48', '#FAC500', '#0015FA', '#FA0100', '#3740A5', '#3D7A4F'], 2),
            7: this.createConfig(['#00FA48', '#FAC500', '#0015FA', '#FA0100', '#3740A5', '#3D7A4F', '#7A6D3D'], 2),
            8: this.createConfig(['#00FA48', '#FAC500', '#0015FA', '#FA0100', '#3740A5', '#3D7A4F', '#7A6D3D', '#7A3D3D'], 2),
            9: this.createConfig(['#00FA48', '#FAC500', '#0015FA', '#FA0100', '#2F3ABA', '#37A557', '#A58D37', '#A53737', '#3D427A'], 2),
            10: this.createConfig(['#00FA48', '#FAC500', '#0015FA', '#FA0100', '#2F3ABA', '#37A557', '#A58D37', '#A53737', '#3D427A', '#35503D'], 2),
            11: this.createConfig(['#00FA48', '#FAC500', '#0015FA', '#FA0100', '#2F3ABA', '#37A557', '#A58D37', '#A53737', '#3D427A', '#35503D', '#504A35'], 2),
            12: this.createConfig(['#00FA48', '#FAC500', '#0015FA', '#FA0100', '#2F3ABA', '#37A557', '#A58D37', '#A53737', '#3D427A', '#35503D', '#504A35', '#503535'], 2),
            13: this.createConfig(['#00FA48', '#FAC500', '#0015FA', '#FA0100', '#2835C7', '#2FBA57', '#BA9C2F', '#BA2F2F', '#3B4394', '#3D7A4F', '#7A6D3D', '#7A3D3D', '#3A3D61'], 2),
            14: this.createConfig(['#00FA48', '#FAC500', '#0015FA', '#FA0100', '#2835C7', '#2FBA57', '#BA9C2F', '#BA2F2F', '#3B4394', '#3D7A4F', '#7A6D3D', '#7A3D3D', '#3A3D61', '#2C3B30'], 2),
            15: this.createConfig(['#00FA48', '#FAC500', '#0015FA', '#FA0100', '#2835C7', '#2FBA57', '#BA9C2F', '#BA2F2F', '#3B4394', '#3D7A4F', '#7A6D3D', '#7A3D3D', '#3A3D61', '#2C3B30', '#3B382C'], 2),
            16: this.createConfig(['#00FA48', '#FAC500', '#0015FA', '#FA0100', '#2835C7', '#2FBA57', '#BA9C2F', '#BA2F2F', '#3B4394', '#3D7A4F', '#7A6D3D', '#7A3D3D', '#3A3D61', '#2C3B30', '#3B382C', '#3B2C2C'], 2),
            17: this.createConfig(['#00FA48', '#FAC500', '#0015FA', '#FA0100', '#2331CF', '#28C756', '#C7A528', '#C72828', '#3740A5', '#3B9455', '#94813B', '#943B3B', '#3D427A', '#3A6145', '#61593A', '#613A3A', '#353750'], 2),
            18: this.createConfig(['#00FA48', '#FAC500', '#0015FA', '#FA0100', '#2331CF', '#28C756', '#C7A528', '#C72828', '#3740A5', '#3B9455', '#94813B', '#943B3B', '#3D427A', '#3A6145', '#61593A', '#613A3A', '#353750', '#29332C'], 2),
            19: this.createConfig(['#00FA48', '#FAC500', '#0015FA', '#FA0100', '#2331CF', '#28C756', '#C7A528', '#C72828', '#3740A5', '#3B9455', '#94813B', '#943B3B', '#3D427A', '#3A6145', '#61593A', '#613A3A', '#353750', '#29332C', '#333129'], 2),
            20: this.createConfig(['#00FA48', '#FAC500', '#0015FA', '#FA0100', '#2331CF', '#28C756', '#C7A528', '#C72828', '#3740A5', '#3B9455', '#94813B', '#943B3B', '#3D427A', '#3A6145', '#61593A', '#613A3A', '#353750', '#29332C', '#333129', '#332929'], 2)
        };
    }

    getCompoundDefinitions() {
        return {
            4: this.createConfig(['#0098FA', '#FAF700', '#0015FA', '#FAC500'], 2),
            5: this.createConfig(['#0098FA', '#FAF700', '#0015FA', '#FAC500', '#3740A5'], 2),
            6: this.createConfig(['#0098FA', '#FAF700', '#0015FA', '#FAC500', '#3740A5', '#3D637A'], 2),
            7: this.createConfig(['#0098FA', '#FAF700', '#0015FA', '#FAC500', '#3740A5', '#3D637A', '#7A7A3D'], 2),
            8: this.createConfig(['#0098FA', '#FAF700', '#0015FA', '#FAC500', '#3740A5', '#3D637A', '#7A7A3D', '#7A6D3D'], 2),
            9: this.createConfig(['#0098FA', '#FAF700', '#0015FA', '#FAC500', '#2F3ABA', '#377AA5', '#A5A437', '#A58D37', '#3D427A'], 2),
            10: this.createConfig(['#0098FA', '#FAF700', '#0015FA', '#FAC500', '#2F3ABA', '#377AA5', '#A5A437', '#A58D37', '#3D427A', '#354650'], 2),
            11: this.createConfig(['#0098FA', '#FAF700', '#0015FA', '#FAC500', '#2F3ABA', '#377AA5', '#A5A437', '#A58D37', '#3D427A', '#354650', '#505035'], 2),
            12: this.createConfig(['#0098FA', '#FAF700', '#0015FA', '#FAC500', '#2F3ABA', '#377AA5', '#A5A437', '#A58D37', '#3D427A', '#354650', '#505035', '#504A35'], 2),
            13: this.createConfig(['#0098FA', '#FAF700', '#0015FA', '#FAC500', '#2835C7', '#2F84BA', '#BAB92F', '#BA9C2F', '#3B4394', '#3D637A', '#7A7A3D', '#7A6D3D', '#3A3D61'], 2),
            14: this.createConfig(['#0098FA', '#FAF700', '#0015FA', '#FAC500', '#2835C7', '#2F84BA', '#BAB92F', '#BA9C2F', '#3B4394', '#3D637A', '#7A7A3D', '#7A6D3D', '#3A3D61', '#2C353B'], 2),
            15: this.createConfig(['#0098FA', '#FAF700', '#0015FA', '#FAC500', '#2835C7', '#2F84BA', '#BAB92F', '#BA9C2F', '#3B4394', '#3D637A', '#7A7A3D', '#7A6D3D', '#3A3D61', '#2C353B', '#3B3A2C'], 2),
            16: this.createConfig(['#0098FA', '#FAF700', '#0015FA', '#FAC500', '#2835C7', '#2F84BA', '#BAB92F', '#BA9C2F', '#3B4394', '#3D637A', '#7A7A3D', '#7A6D3D', '#3A3D61', '#2C353B', '#3B3A2C', '#3B382C'], 2),
            17: this.createConfig(['#0098FA', '#FAF700', '#0015FA', '#FAC500', '#2331CF', '#2889C7', '#C7C528', '#C7A528', '#3740A5', '#3B7194', '#94933B', '#94813B', '#3D427A', '#3A5261', '#61603A', '#61593A', '#353750'], 2),
            18: this.createConfig(['#0098FA', '#FAF700', '#0015FA', '#FAC500', '#2331CF', '#2889C7', '#C7C528', '#C7A528', '#3740A5', '#3B7194', '#94933B', '#94813B', '#3D427A', '#3A5261', '#61603A', '#61593A', '#353750', '#292F33'], 2),
            19: this.createConfig(['#0098FA', '#FAF700', '#0015FA', '#FAC500', '#2331CF', '#2889C7', '#C7C528', '#C7A528', '#3740A5', '#3B7194', '#94933B', '#94813B', '#3D427A', '#3A5261', '#61603A', '#61593A', '#353750', '#292F33', '#333329'], 2),
            20: this.createConfig(['#0098FA', '#FAF700', '#0015FA', '#FAC500', '#2331CF', '#2889C7', '#C7C528', '#C7A528', '#3740A5', '#3B7194', '#94933B', '#94813B', '#3D427A', '#3A5261', '#61603A', '#61593A', '#353750', '#292F33', '#333329', '#333129'], 2)
        };
    }
}
