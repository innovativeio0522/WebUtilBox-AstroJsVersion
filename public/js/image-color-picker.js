let canvas, ctx, originalImage;
        let colorHistory = [];

        // Drag and drop
        const dropZone = document.getElementById('dropZone');
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = 'var(--primary)';
            dropZone.style.background = 'rgba(249, 115, 22, 0.1)';
        });
        dropZone.addEventListener('dragleave', () => {
            dropZone.style.borderColor = 'var(--border)';
            dropZone.style.background = 'transparent';
        });
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = 'var(--border)';
            dropZone.style.background = 'transparent';
            if (e.dataTransfer.files.length) {
                handleFile(e.dataTransfer.files[0]);
            }
        });

        function handleFile(file) {
            if (!file || !file.type.startsWith('image/')) {
                showToast('Please select an image', true);
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                originalImage = new Image();
                originalImage.onload = () => {
                    initCanvas();
                    extractDominantColors();
                    document.getElementById('uploadArea').style.display = 'none';
                    document.getElementById('imageArea').style.display = 'block';
                    document.getElementById('controls').style.display = 'block';
                };
                originalImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        function initCanvas() {
            canvas = document.getElementById('canvas');
            ctx = canvas.getContext('2d');

            const maxWidth = 450;
            const scale = Math.min(1, maxWidth / originalImage.width);
            canvas.width = originalImage.width * scale;
            canvas.height = originalImage.height * scale;

            ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

            canvas.addEventListener('click', pickColor);
        }

        function pickColor(e) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const pixel = ctx.getImageData(x, y, 1, 1).data;
            const r = pixel[0];
            const g = pixel[1];
            const b = pixel[2];

            updateColorDisplay(r, g, b);
            addToHistory(r, g, b);
        }

        function updateColorDisplay(r, g, b) {
            const hex = rgbToHex(r, g, b);
            const rgb = `rgb(${r}, ${g}, ${b})`;
            const hsl = rgbToHsl(r, g, b);

            document.getElementById('colorPreview').style.background = hex;
            document.getElementById('hexValue').value = hex;
            document.getElementById('rgbValue').value = rgb;
            document.getElementById('hslValue').value = hsl;
        }

        function addToHistory(r, g, b) {
            const hex = rgbToHex(r, g, b);
            
            // Avoid duplicates
            if (colorHistory.includes(hex)) return;
            
            colorHistory.unshift(hex);
            if (colorHistory.length > 12) colorHistory.pop();

            renderHistory();
        }

        function renderHistory() {
            const historyDiv = document.getElementById('colorHistory');
            historyDiv.innerHTML = '';

            colorHistory.forEach(color => {
                const div = document.createElement('div');
                div.style.cssText = `background: ${color}; height: 40px; border-radius: 6px; cursor: pointer; border: 2px solid var(--border);`;
                div.title = color;
                div.onclick = () => {
                    const rgb = hexToRgb(color);
                    updateColorDisplay(rgb.r, rgb.g, rgb.b);
                    showToast('Color selected from history');
                };
                historyDiv.appendChild(div);
            });
        }

        function clearHistory() {
            colorHistory = [];
            document.getElementById('colorHistory').innerHTML = '<div style="font-size: 0.7rem; color: var(--gray); grid-column: 1 / -1; text-align: center; padding: 10px;">Pick colors to see history</div>';
        }

        function extractDominantColors() {
            // Sample colors from image
            const sampleCanvas = document.createElement('canvas');
            const sampleCtx = sampleCanvas.getContext('2d');
            sampleCanvas.width = 100;
            sampleCanvas.height = 100;
            sampleCtx.drawImage(originalImage, 0, 0, 100, 100);

            const imageData = sampleCtx.getImageData(0, 0, 100, 100).data;
            const colorMap = {};

            // Count colors
            for (let i = 0; i < imageData.length; i += 4) {
                const r = Math.round(imageData[i] / 10) * 10;
                const g = Math.round(imageData[i + 1] / 10) * 10;
                const b = Math.round(imageData[i + 2] / 10) * 10;
                const key = `${r},${g},${b}`;
                colorMap[key] = (colorMap[key] || 0) + 1;
            }

            // Get top 5 colors
            const sortedColors = Object.entries(colorMap)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);

            renderDominantColors(sortedColors);
        }

        function renderDominantColors(colors) {
            const dominantDiv = document.getElementById('dominantColors');
            dominantDiv.innerHTML = '';

            colors.forEach(([color]) => {
                const [r, g, b] = color.split(',').map(Number);
                const hex = rgbToHex(r, g, b);
                
                const div = document.createElement('div');
                div.style.cssText = `background: ${hex}; height: 50px; border-radius: 6px; cursor: pointer; border: 2px solid var(--border); position: relative;`;
                div.title = hex;
                div.onclick = () => {
                    updateColorDisplay(r, g, b);
                    addToHistory(r, g, b);
                    showToast('Color selected');
                };
                
                // Add hex label
                const label = document.createElement('div');
                label.textContent = hex;
                label.style.cssText = 'position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%); font-size: 0.6rem; background: rgba(0,0,0,0.7); color: white; padding: 2px 4px; border-radius: 3px; white-space: nowrap;';
                div.appendChild(label);
                
                dominantDiv.appendChild(div);
            });
        }

        function copyColor(type) {
            let value;
            if (type === 'hex') value = document.getElementById('hexValue').value;
            else if (type === 'rgb') value = document.getElementById('rgbValue').value;
            else if (type === 'hsl') value = document.getElementById('hslValue').value;

            navigator.clipboard.writeText(value).then(() => {
                showToast(`${type.toUpperCase()} copied!`);
            });
        }

        function rgbToHex(r, g, b) {
            return '#' + [r, g, b].map(x => {
                const hex = x.toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            }).join('');
        }

        function hexToRgb(hex) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }

        function rgbToHsl(r, g, b) {
            r /= 255;
            g /= 255;
            b /= 255;

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

            h = Math.round(h * 360);
            s = Math.round(s * 100);
            l = Math.round(l * 100);

            return `hsl(${h}, ${s}%, ${l}%)`;
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }

        function uploadNew() {
            document.getElementById('fileInput').click();
        }