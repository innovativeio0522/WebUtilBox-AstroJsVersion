function updateFromText() {
            const color = document.getElementById('baseColorText').value.trim();
            if (/^#[0-9A-F]{6}$/i.test(color)) {
                document.getElementById('baseColor').value = color;
                generateShades();
            }
        }

        function generateShades() {
            const baseColor = document.getElementById('baseColor').value;
            document.getElementById('baseColorText').value = baseColor;

            const rgb = hexToRgb(baseColor);
            
            // Generate tints (lighter - add white)
            const tintsDiv = document.getElementById('tints');
            tintsDiv.innerHTML = '';
            for (let i = 9; i >= 1; i--) {
                const factor = i / 10;
                const tint = {
                    r: Math.round(rgb.r + (255 - rgb.r) * (1 - factor)),
                    g: Math.round(rgb.g + (255 - rgb.g) * (1 - factor)),
                    b: Math.round(rgb.b + (255 - rgb.b) * (1 - factor))
                };
                const hex = rgbToHex(tint.r, tint.g, tint.b);
                tintsDiv.innerHTML += createColorCard(hex, `${i}0%`);
            }

            // Base color
            const baseDiv = document.getElementById('baseColorDisplay');
            baseDiv.innerHTML = createColorCard(baseColor, '100%', true);

            // Generate shades (darker - add black)
            const shadesDiv = document.getElementById('shades');
            shadesDiv.innerHTML = '';
            for (let i = 1; i <= 9; i++) {
                const factor = i / 10;
                const shade = {
                    r: Math.round(rgb.r * (1 - factor)),
                    g: Math.round(rgb.g * (1 - factor)),
                    b: Math.round(rgb.b * (1 - factor))
                };
                const hex = rgbToHex(shade.r, shade.g, shade.b);
                shadesDiv.innerHTML += createColorCard(hex, `${100 - i * 10}%`);
            }
        }

        function createColorCard(hex, label, isBase = false) {
            const textColor = getContrastColor(hex);
            const height = isBase ? '100px' : '80px';
            return `
                <div onclick="copyColor('${hex}')" style="background: ${hex}; height: ${height}; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s; border: 1px solid var(--border);" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    <div style="color: ${textColor}; font-size: ${isBase ? '1rem' : '0.8rem'}; font-weight: 600; font-family: 'Courier New', monospace;">${hex}</div>
                    <div style="color: ${textColor}; font-size: 0.75rem; margin-top: 3px; opacity: 0.8;">${label}</div>
                </div>
            `;
        }

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

        function getContrastColor(hex) {
            const rgb = hexToRgb(hex);
            const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
            return brightness > 128 ? '#000000' : '#ffffff';
        }

        function copyColor(hex) {
            navigator.clipboard.writeText(hex).then(() => {
                showToast(`${hex} copied!`);
            });
        }

        function showToast(message) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show';
            setTimeout(() => toast.classList.remove('show'), 3000);
        }

        // Initialize
        generateShades();