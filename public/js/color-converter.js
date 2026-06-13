let currentMode = 'converter';

        function switchMode(mode) {
            currentMode = mode;
            document.querySelectorAll('.mode-tab').forEach(tab => tab.classList.remove('active'));
            document.getElementById(mode + 'Tab').classList.add('active');
            
            if (mode === 'converter') {
                document.getElementById('converterMode').style.display = 'block';
                document.getElementById('contrastMode').style.display = 'none';
            } else {
                document.getElementById('converterMode').style.display = 'none';
                document.getElementById('contrastMode').style.display = 'block';
                checkContrast();
            }
        }

        // ===== COLOR CONVERTER =====
        
        function updateFromPicker() {
            const hex = document.getElementById('colorPicker').value;
            document.getElementById('hexInput').value = hex;
            updateFromHex();
        }

        function updateFromHex() {
            const hex = document.getElementById('hexInput').value.trim();
            if (!/^#?[0-9A-Fa-f]{6}$/.test(hex)) return;
            
            const cleanHex = hex.startsWith('#') ? hex : '#' + hex;
            const rgb = hexToRgb(cleanHex);
            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
            const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
            
            updateDisplay(cleanHex, rgb, hsl, cmyk);
        }

        function updateFromRgb() {
            const r = parseInt(document.getElementById('rgbR').value) || 0;
            const g = parseInt(document.getElementById('rgbG').value) || 0;
            const b = parseInt(document.getElementById('rgbB').value) || 0;
            
            const hex = rgbToHex(r, g, b);
            const hsl = rgbToHsl(r, g, b);
            const cmyk = rgbToCmyk(r, g, b);
            
            updateDisplay(hex, {r, g, b}, hsl, cmyk);
        }

        function updateFromHsl() {
            const h = parseInt(document.getElementById('hslH').value) || 0;
            const s = parseInt(document.getElementById('hslS').value) || 0;
            const l = parseInt(document.getElementById('hslL').value) || 0;
            
            const rgb = hslToRgb(h, s, l);
            const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
            const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
            
            updateDisplay(hex, rgb, {h, s, l}, cmyk);
        }

        function updateFromCmyk() {
            const c = parseInt(document.getElementById('cmykC').value) || 0;
            const m = parseInt(document.getElementById('cmykM').value) || 0;
            const y = parseInt(document.getElementById('cmykY').value) || 0;
            const k = parseInt(document.getElementById('cmykK').value) || 0;
            
            const rgb = cmykToRgb(c, m, y, k);
            const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
            
            updateDisplay(hex, rgb, hsl, {c, m, y, k});
        }

        function updateDisplay(hex, rgb, hsl, cmyk) {
            document.getElementById('colorPreview').style.background = hex;
            document.getElementById('colorPicker').value = hex;
            document.getElementById('hexInput').value = hex;
            
            document.getElementById('rgbR').value = rgb.r;
            document.getElementById('rgbG').value = rgb.g;
            document.getElementById('rgbB').value = rgb.b;
            document.getElementById('rgbString').textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
            
            document.getElementById('hslH').value = Math.round(hsl.h);
            document.getElementById('hslS').value = Math.round(hsl.s);
            document.getElementById('hslL').value = Math.round(hsl.l);
            document.getElementById('hslString').textContent = `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
            
            document.getElementById('cmykC').value = Math.round(cmyk.c);
            document.getElementById('cmykM').value = Math.round(cmyk.m);
            document.getElementById('cmykY').value = Math.round(cmyk.y);
            document.getElementById('cmykK').value = Math.round(cmyk.k);
            document.getElementById('cmykString').textContent = `cmyk(${Math.round(cmyk.c)}%, ${Math.round(cmyk.m)}%, ${Math.round(cmyk.y)}%, ${Math.round(cmyk.k)}%)`;
        }

        // Conversion functions
        function hexToRgb(hex) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : {r: 0, g: 0, b: 0};
        }

        function rgbToHex(r, g, b) {
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }

        function rgbToHsl(r, g, b) {
            r /= 255; g /= 255; b /= 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
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

            return {h: h * 360, s: s * 100, l: l * 100};
        }

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

            return {r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255)};
        }

        function rgbToCmyk(r, g, b) {
            let c = 1 - (r / 255);
            let m = 1 - (g / 255);
            let y = 1 - (b / 255);
            let k = Math.min(c, m, y);
            
            if (k === 1) {
                return {c: 0, m: 0, y: 0, k: 100};
            }
            
            c = ((c - k) / (1 - k)) * 100;
            m = ((m - k) / (1 - k)) * 100;
            y = ((y - k) / (1 - k)) * 100;
            k = k * 100;
            
            return {c, m, y, k};
        }

        function cmykToRgb(c, m, y, k) {
            c = c / 100;
            m = m / 100;
            y = y / 100;
            k = k / 100;
            
            const r = 255 * (1 - c) * (1 - k);
            const g = 255 * (1 - m) * (1 - k);
            const b = 255 * (1 - y) * (1 - k);
            
            return {r: Math.round(r), g: Math.round(g), b: Math.round(b)};
        }

        function copyHex() {
            const hex = document.getElementById('hexInput').value;
            navigator.clipboard.writeText(hex).then(() => showToast('HEX copied!'));
        }

        function copyRgb() {
            const rgb = document.getElementById('rgbString').textContent;
            navigator.clipboard.writeText(rgb).then(() => showToast('RGB copied!'));
        }

        function copyHsl() {
            const hsl = document.getElementById('hslString').textContent;
            navigator.clipboard.writeText(hsl).then(() => showToast('HSL copied!'));
        }

        function copyCmyk() {
            const cmyk = document.getElementById('cmykString').textContent;
            navigator.clipboard.writeText(cmyk).then(() => showToast('CMYK copied!'));
        }

        // ===== CONTRAST CHECKER =====
        
        function updateFgFromHex() {
            const hex = document.getElementById('fgHex').value.trim();
            if (/^#?[0-9A-Fa-f]{6}$/.test(hex)) {
                const cleanHex = hex.startsWith('#') ? hex : '#' + hex;
                document.getElementById('fgColor').value = cleanHex;
                document.getElementById('fgHex').value = cleanHex;
                checkContrast();
            }
        }

        function updateBgFromHex() {
            const hex = document.getElementById('bgHex').value.trim();
            if (/^#?[0-9A-Fa-f]{6}$/.test(hex)) {
                const cleanHex = hex.startsWith('#') ? hex : '#' + hex;
                document.getElementById('bgColor').value = cleanHex;
                document.getElementById('bgHex').value = cleanHex;
                checkContrast();
            }
        }

        function checkContrast() {
            const fgHex = document.getElementById('fgColor').value;
            const bgHex = document.getElementById('bgColor').value;
            
            document.getElementById('fgHex').value = fgHex;
            document.getElementById('bgHex').value = bgHex;
            document.getElementById('fgPreview').style.background = fgHex;
            document.getElementById('bgPreview').style.background = bgHex;
            
            const preview = document.getElementById('contrastPreview');
            preview.style.color = fgHex;
            preview.style.background = bgHex;
            
            const ratio = getContrastRatio(fgHex, bgHex);
            document.getElementById('contrastRatio').textContent = ratio.toFixed(2) + ':1';
            
            // Check WCAG compliance
            updateCompliance('normalAA', ratio >= 4.5);
            updateCompliance('normalAAA', ratio >= 7);
            updateCompliance('largeAA', ratio >= 3);
            updateCompliance('largeAAA', ratio >= 4.5);
        }

        function getContrastRatio(hex1, hex2) {
            const lum1 = getLuminance(hex1);
            const lum2 = getLuminance(hex2);
            const lighter = Math.max(lum1, lum2);
            const darker = Math.min(lum1, lum2);
            return (lighter + 0.05) / (darker + 0.05);
        }

        function getLuminance(hex) {
            const rgb = hexToRgb(hex);
            const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
                val = val / 255;
                return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
            });
            return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        }

        function updateCompliance(id, passes) {
            const elem = document.getElementById(id);
            const badge = elem.querySelector('.badge');
            if (passes) {
                badge.textContent = '? Pass';
                badge.style.background = '#10b981';
                badge.style.color = 'white';
            } else {
                badge.textContent = '? Fail';
                badge.style.background = '#ef4444';
                badge.style.color = 'white';
            }
        }

        function showToast(message) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show';
            setTimeout(() => toast.classList.remove('show'), 3000);
        }

        // Initialize
        requestIdleCallback(() => { updateFromPicker(); }, { timeout: 2000 });