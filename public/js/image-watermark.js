let originalImage = null;
        let watermarkImage = null;
        let canvas, ctx;
        let watermarkType = 'text';
        let position = 'bottom-right';
        let customPosition = null; // For manual positioning
        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };
        let watermarkBounds = { x: 0, y: 0, width: 0, height: 0 };
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
                    document.getElementById('previewArea').style.display = 'block';
                    document.getElementById('controls').style.display = 'block';
                };
                originalImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        function handleWatermarkImage(file) {
            if (!file || !file.type.startsWith('image/')) {
                showToast('Please select an image', true);
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                watermarkImage = new Image();
                watermarkImage.onload = () => {
                    updateWatermark();
                };
                watermarkImage.src = e.target.result;
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

            // Add mouse events for dragging (only once)
            if (!eventListenersBound) {
                canvas.addEventListener('mousedown', startDrag);
                canvas.addEventListener('mousemove', drag);
                canvas.addEventListener('mouseup', endDrag);
                canvas.addEventListener('mouseleave', endDrag);
                eventListenersBound = true;
            }

            updateWatermark();
        }

        function setWatermarkType(type) {
            watermarkType = type;

            // Update button styles
            document.querySelectorAll('.type-btn').forEach(btn => {
                btn.style.background = 'var(--light)';
                btn.style.borderColor = 'var(--border)';
                btn.style.color = 'var(--white)';
            });
            document.getElementById('type-' + type).style.background = 'var(--primary)';
            document.getElementById('type-' + type).style.borderColor = 'var(--primary)';
            document.getElementById('type-' + type).style.color = 'white';

            // Show/hide controls
            if (type === 'text') {
                document.getElementById('textControls').style.display = 'block';
                document.getElementById('imageControls').style.display = 'none';
            } else {
                document.getElementById('textControls').style.display = 'none';
                document.getElementById('imageControls').style.display = 'block';
            }

            updateWatermark();
        }

        function setPosition(pos) {
            position = pos;
            customPosition = null; // Reset custom position

            // Update button styles
            document.querySelectorAll('.pos-btn').forEach(btn => {
                btn.style.background = 'var(--dark)';
                btn.style.borderColor = 'var(--border)';
                btn.style.color = 'var(--white)';
            });
            document.getElementById('pos-' + pos).style.background = 'var(--primary)';
            document.getElementById('pos-' + pos).style.borderColor = 'var(--primary)';
            document.getElementById('pos-' + pos).style.color = 'white';

            updateWatermark();
        }

        function startDrag(e) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Check if mouse is over watermark
            if (mouseX >= watermarkBounds.x && 
                mouseX <= watermarkBounds.x + watermarkBounds.width &&
                mouseY >= watermarkBounds.y && 
                mouseY <= watermarkBounds.y + watermarkBounds.height) {
                
                isDragging = true;
                dragOffset.x = mouseX - watermarkBounds.x;
                dragOffset.y = mouseY - watermarkBounds.y;
                canvas.style.cursor = 'grabbing';
            }
        }

        function drag(e) {
            if (!isDragging) {
                // Change cursor when hovering over watermark
                const rect = canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;

                if (mouseX >= watermarkBounds.x && 
                    mouseX <= watermarkBounds.x + watermarkBounds.width &&
                    mouseY >= watermarkBounds.y && 
                    mouseY <= watermarkBounds.y + watermarkBounds.height) {
                    canvas.style.cursor = 'grab';
                } else {
                    canvas.style.cursor = 'move';
                }
                return;
            }

            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Calculate new position
            let newX = mouseX - dragOffset.x;
            let newY = mouseY - dragOffset.y;

            // Keep watermark within canvas bounds
            newX = Math.max(0, Math.min(newX, canvas.width - watermarkBounds.width));
            newY = Math.max(0, Math.min(newY, canvas.height - watermarkBounds.height));

            customPosition = { x: newX, y: newY };

            // Deselect position buttons when using custom position
            document.querySelectorAll('.pos-btn').forEach(btn => {
                btn.style.background = 'var(--dark)';
                btn.style.borderColor = 'var(--border)';
                btn.style.color = 'var(--white)';
            });

            updateWatermark();
        }

        function endDrag() {
            if (isDragging) {
                isDragging = false;
                canvas.style.cursor = 'move';
            }
        }

        function updateWatermark() {
            if (!originalImage) return;

            // Draw original image
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

            const opacity = document.getElementById('opacity').value / 100;
            ctx.globalAlpha = opacity;

            if (watermarkType === 'text') {
                drawTextWatermark();
            } else if (watermarkType === 'image' && watermarkImage) {
                drawImageWatermark();
            }

            ctx.globalAlpha = 1;
        }

        function drawTextWatermark() {
            const text = document.getElementById('watermarkText').value;
            const fontSize = document.getElementById('fontSize').value;
            const color = document.getElementById('textColor').value;

            ctx.font = `bold ${fontSize}px Arial`;
            ctx.fillStyle = color;
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.lineWidth = 2;

            const metrics = ctx.measureText(text);
            const textWidth = metrics.width;
            const textHeight = fontSize;

            let coords;
            if (customPosition) {
                coords = { x: customPosition.x, y: customPosition.y + textHeight };
            } else {
                coords = getPositionCoordinates(textWidth, textHeight);
            }

            // Store bounds for drag detection
            watermarkBounds = {
                x: coords.x,
                y: coords.y - textHeight,
                width: textWidth,
                height: textHeight
            };

            ctx.strokeText(text, coords.x, coords.y);
            ctx.fillText(text, coords.x, coords.y);
        }

        function drawImageWatermark() {
            const sizePercent = document.getElementById('watermarkSize').value / 100;
            const wmWidth = canvas.width * sizePercent;
            const wmHeight = (watermarkImage.height / watermarkImage.width) * wmWidth;

            let coords;
            if (customPosition) {
                coords = { x: customPosition.x, y: customPosition.y };
            } else {
                coords = getPositionCoordinates(wmWidth, wmHeight);
            }

            // Store bounds for drag detection
            watermarkBounds = {
                x: coords.x,
                y: coords.y,
                width: wmWidth,
                height: wmHeight
            };

            ctx.drawImage(watermarkImage, coords.x, coords.y, wmWidth, wmHeight);
        }

        function getPositionCoordinates(width, height) {
            const padding = 20;
            let x, y;

            switch (position) {
                case 'top-left':
                    x = padding;
                    y = padding + height;
                    break;
                case 'top-center':
                    x = (canvas.width - width) / 2;
                    y = padding + height;
                    break;
                case 'top-right':
                    x = canvas.width - width - padding;
                    y = padding + height;
                    break;
                case 'middle-left':
                    x = padding;
                    y = (canvas.height + height) / 2;
                    break;
                case 'center':
                    x = (canvas.width - width) / 2;
                    y = (canvas.height + height) / 2;
                    break;
                case 'middle-right':
                    x = canvas.width - width - padding;
                    y = (canvas.height + height) / 2;
                    break;
                case 'bottom-left':
                    x = padding;
                    y = canvas.height - padding;
                    break;
                case 'bottom-center':
                    x = (canvas.width - width) / 2;
                    y = canvas.height - padding;
                    break;
                case 'bottom-right':
                    x = canvas.width - width - padding;
                    y = canvas.height - padding;
                    break;
            }

            return { x, y };
        }

        function downloadImage() {
            // Create full-size canvas
            const downloadCanvas = document.createElement('canvas');
            const downloadCtx = downloadCanvas.getContext('2d');
            downloadCanvas.width = originalImage.width;
            downloadCanvas.height = originalImage.height;

            // Draw original image
            downloadCtx.drawImage(originalImage, 0, 0);

            // Apply watermark
            const scale = originalImage.width / canvas.width;
            const opacity = document.getElementById('opacity').value / 100;
            downloadCtx.globalAlpha = opacity;

            if (watermarkType === 'text') {
                const text = document.getElementById('watermarkText').value;
                const fontSize = document.getElementById('fontSize').value * scale;
                const color = document.getElementById('textColor').value;

                downloadCtx.font = `bold ${fontSize}px Arial`;
                downloadCtx.fillStyle = color;
                downloadCtx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
                downloadCtx.lineWidth = 2 * scale;

                const metrics = downloadCtx.measureText(text);
                const textWidth = metrics.width;
                const textHeight = fontSize;

                let coords;
                if (customPosition) {
                    coords = {
                        x: customPosition.x * scale,
                        y: (customPosition.y + parseInt(document.getElementById('fontSize').value)) * scale
                    };
                } else {
                    coords = getPositionCoordinatesForDownload(textWidth, textHeight, downloadCanvas.width, downloadCanvas.height, scale);
                }

                downloadCtx.strokeText(text, coords.x, coords.y);
                downloadCtx.fillText(text, coords.x, coords.y);
            } else if (watermarkType === 'image' && watermarkImage) {
                const sizePercent = document.getElementById('watermarkSize').value / 100;
                const wmWidth = downloadCanvas.width * sizePercent;
                const wmHeight = (watermarkImage.height / watermarkImage.width) * wmWidth;

                let coords;
                if (customPosition) {
                    coords = {
                        x: customPosition.x * scale,
                        y: customPosition.y * scale
                    };
                } else {
                    coords = getPositionCoordinatesForDownload(wmWidth, wmHeight, downloadCanvas.width, downloadCanvas.height, scale);
                }

                downloadCtx.drawImage(watermarkImage, coords.x, coords.y, wmWidth, wmHeight);
            }

            downloadCanvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'watermarked_' + Date.now() + '.png';
                a.click();
                URL.revokeObjectURL(url);
                showToast('Image downloaded!');
            });
        }

        function getPositionCoordinatesForDownload(width, height, canvasWidth, canvasHeight, scale) {
            const padding = 20 * scale;
            let x, y;

            switch (position) {
                case 'top-left':
                    x = padding;
                    y = padding + height;
                    break;
                case 'top-center':
                    x = (canvasWidth - width) / 2;
                    y = padding + height;
                    break;
                case 'top-right':
                    x = canvasWidth - width - padding;
                    y = padding + height;
                    break;
                case 'middle-left':
                    x = padding;
                    y = (canvasHeight + height) / 2;
                    break;
                case 'center':
                    x = (canvasWidth - width) / 2;
                    y = (canvasHeight + height) / 2;
                    break;
                case 'middle-right':
                    x = canvasWidth - width - padding;
                    y = (canvasHeight + height) / 2;
                    break;
                case 'bottom-left':
                    x = padding;
                    y = canvasHeight - padding;
                    break;
                case 'bottom-center':
                    x = (canvasWidth - width) / 2;
                    y = canvasHeight - padding;
                    break;
                case 'bottom-right':
                    x = canvasWidth - width - padding;
                    y = canvasHeight - padding;
                    break;
            }

            return { x, y };
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