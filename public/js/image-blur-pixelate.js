let originalImage = null;
        let canvas, ctx;
        let isDrawing = false;
        let startX, startY;
        let currentEffect = 'blur';
        let censoredAreas = [];
        let tempRect = null;
        let eventListenersBound = false;

        // Drag and drop
        requestIdleCallback(() => {
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
        }, { timeout: 2000 });

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
                    document.getElementById('uploadArea').style.display = 'none';
                    document.getElementById('canvasArea').style.display = 'block';
                    document.getElementById('controls').style.display = 'block';
                };
                originalImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        function initCanvas() {
            canvas = document.getElementById('canvas');
            ctx = canvas.getContext('2d');

            const maxWidth = 500;
            const scale = Math.min(1, maxWidth / originalImage.width);
            canvas.width = originalImage.width * scale;
            canvas.height = originalImage.height * scale;

            censoredAreas = [];
            updateAreaCount();
            redrawCanvas();

            // Mouse events (only once)
            if (!eventListenersBound) {
                canvas.addEventListener('mousedown', startDrawing);
                canvas.addEventListener('mousemove', draw);
                canvas.addEventListener('mouseup', endDrawing);
                canvas.addEventListener('mouseleave', endDrawing);
                eventListenersBound = true;
            }
        }

        function startDrawing(e) {
            isDrawing = true;
            const rect = canvas.getBoundingClientRect();
            startX = e.clientX - rect.left;
            startY = e.clientY - rect.top;
        }

        function draw(e) {
            if (!isDrawing) return;

            const rect = canvas.getBoundingClientRect();
            const currentX = e.clientX - rect.left;
            const currentY = e.clientY - rect.top;

            tempRect = {
                x: Math.min(startX, currentX),
                y: Math.min(startY, currentY),
                width: Math.abs(currentX - startX),
                height: Math.abs(currentY - startY)
            };

            redrawCanvas();
        }

        function endDrawing(e) {
            if (!isDrawing) return;
            isDrawing = false;

            if (tempRect && tempRect.width > 5 && tempRect.height > 5) {
                censoredAreas.push({
                    ...tempRect,
                    effect: currentEffect,
                    blurAmount: parseInt(document.getElementById('blurAmount').value),
                    pixelSize: parseInt(document.getElementById('pixelSize').value)
                });
                updateAreaCount();
            }

            tempRect = null;
            redrawCanvas();
        }

        function redrawCanvas() {
            // Clear and draw original image
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

            // Apply all censored areas
            censoredAreas.forEach(area => {
                applyCensor(area);
            });

            // Draw temporary rectangle outline
            if (tempRect) {
                ctx.strokeStyle = 'rgba(249, 115, 22, 0.8)';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(tempRect.x, tempRect.y, tempRect.width, tempRect.height);
                ctx.setLineDash([]);
            }
        }

        function applyCensor(area) {
            if (area.effect === 'blur') {
                applyBlur(area);
            } else {
                applyPixelate(area);
            }
        }

        function applyBlur(area) {
            // Save the area to blur
            const imageData = ctx.getImageData(area.x, area.y, area.width, area.height);
            
            // Apply blur using canvas filter
            ctx.save();
            ctx.filter = `blur(${area.blurAmount}px)`;
            ctx.drawImage(canvas, area.x, area.y, area.width, area.height, area.x, area.y, area.width, area.height);
            ctx.restore();
        }

        function applyPixelate(area) {
            const pixelSize = area.pixelSize;
            
            // Get image data
            const imageData = ctx.getImageData(area.x, area.y, area.width, area.height);
            
            // Pixelate
            for (let y = 0; y < area.height; y += pixelSize) {
                for (let x = 0; x < area.width; x += pixelSize) {
                    // Get average color of pixel block
                    const pixelIndex = (y * area.width + x) * 4;
                    const r = imageData.data[pixelIndex];
                    const g = imageData.data[pixelIndex + 1];
                    const b = imageData.data[pixelIndex + 2];
                    
                    // Fill block with average color
                    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                    ctx.fillRect(area.x + x, area.y + y, pixelSize, pixelSize);
                }
            }
        }

        function setEffect(effect) {
            currentEffect = effect;
            
            // Update buttons
            document.getElementById('effect-blur').style.background = effect === 'blur' ? 'var(--primary)' : 'var(--dark)';
            document.getElementById('effect-blur').style.border = effect === 'blur' ? 'none' : '1px solid var(--border)';
            document.getElementById('effect-pixelate').style.background = effect === 'pixelate' ? 'var(--primary)' : 'var(--dark)';
            document.getElementById('effect-pixelate').style.border = effect === 'pixelate' ? 'none' : '1px solid var(--border)';
            
            // Show/hide settings
            document.getElementById('blur-settings').style.display = effect === 'blur' ? 'block' : 'none';
            document.getElementById('pixelate-settings').style.display = effect === 'pixelate' ? 'block' : 'none';
        }

        function clearLast() {
            if (censoredAreas.length > 0) {
                censoredAreas.pop();
                updateAreaCount();
                redrawCanvas();
                showToast('Last area removed');
            }
        }

        function clearAll() {
            censoredAreas = [];
            updateAreaCount();
            redrawCanvas();
            showToast('All areas cleared');
        }

        function updateAreaCount() {
            document.getElementById('areaCount').textContent = censoredAreas.length;
        }

        function downloadImage() {
            if (!originalImage) return;

            // Create download canvas at full resolution
            const downloadCanvas = document.createElement('canvas');
            const downloadCtx = downloadCanvas.getContext('2d');
            downloadCanvas.width = originalImage.width;
            downloadCanvas.height = originalImage.height;

            // Draw original image
            downloadCtx.drawImage(originalImage, 0, 0);

            // Scale factor
            const scale = originalImage.width / canvas.width;

            // Apply all censored areas at full resolution
            censoredAreas.forEach(area => {
                const scaledArea = {
                    x: area.x * scale,
                    y: area.y * scale,
                    width: area.width * scale,
                    height: area.height * scale,
                    effect: area.effect,
                    blurAmount: area.blurAmount * scale,
                    pixelSize: area.pixelSize * scale
                };

                if (scaledArea.effect === 'blur') {
                    downloadCtx.save();
                    downloadCtx.filter = `blur(${scaledArea.blurAmount}px)`;
                    downloadCtx.drawImage(downloadCanvas, scaledArea.x, scaledArea.y, scaledArea.width, scaledArea.height, scaledArea.x, scaledArea.y, scaledArea.width, scaledArea.height);
                    downloadCtx.restore();
                } else {
                    const pixelSize = scaledArea.pixelSize;
                    const imageData = downloadCtx.getImageData(scaledArea.x, scaledArea.y, scaledArea.width, scaledArea.height);
                    
                    for (let y = 0; y < scaledArea.height; y += pixelSize) {
                        for (let x = 0; x < scaledArea.width; x += pixelSize) {
                            const pixelIndex = (y * scaledArea.width + x) * 4;
                            const r = imageData.data[pixelIndex];
                            const g = imageData.data[pixelIndex + 1];
                            const b = imageData.data[pixelIndex + 2];
                            
                            downloadCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                            downloadCtx.fillRect(scaledArea.x + x, scaledArea.y + y, pixelSize, pixelSize);
                        }
                    }
                }
            });

            downloadCanvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'censored_image_' + Date.now() + '.png';
                a.click();
                URL.revokeObjectURL(url);
                showToast('Image downloaded!');
            });
        }

        function uploadNew() {
            document.getElementById('fileInput').click();
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }