let originalImage = null;
        let canvas, ctx, previewCanvas, previewCtx;
        let cropStart = null;
        let cropEnd = null;
        let isDragging = false;
        let aspectRatio = null;
        let eventListenersBound = false;

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
                    document.getElementById('uploadArea').style.display = 'none';
                    document.getElementById('cropArea').style.display = 'block';
                    document.getElementById('controls').style.display = 'block';
                };
                originalImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        function initCanvas() {
            canvas = document.getElementById('canvas');
            ctx = canvas.getContext('2d');
            previewCanvas = document.getElementById('preview');
            previewCtx = previewCanvas.getContext('2d');

            const maxWidth = 450;
            const scale = Math.min(1, maxWidth / originalImage.width);
            canvas.width = originalImage.width * scale;
            canvas.height = originalImage.height * scale;

            drawImage();

            // Mouse events (only once)
            if (!eventListenersBound) {
                canvas.addEventListener('mousedown', startCrop);
                canvas.addEventListener('mousemove', updateCrop);
                canvas.addEventListener('mouseup', endCrop);
                canvas.addEventListener('mouseleave', endCrop);
                eventListenersBound = true;
            }

            // Initialize with full image selection
            cropStart = { x: 0, y: 0 };
            cropEnd = { x: canvas.width, y: canvas.height };
            drawCropArea();
            updatePreview();
        }

        function drawImage() {
            ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
        }

        function startCrop(e) {
            const rect = canvas.getBoundingClientRect();
            cropStart = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
            isDragging = true;
        }

        function updateCrop(e) {
            if (!isDragging) return;

            const rect = canvas.getBoundingClientRect();
            let x = e.clientX - rect.left;
            let y = e.clientY - rect.top;

            if (aspectRatio) {
                const width = Math.abs(x - cropStart.x);
                const height = width / aspectRatio;
                y = cropStart.y + (y > cropStart.y ? height : -height);
            }

            cropEnd = { x, y };
            drawCropArea();
        }

        function endCrop() {
            if (isDragging) {
                isDragging = false;
                updatePreview();
            }
        }

        function drawCropArea() {
            drawImage();

            if (!cropStart || !cropEnd) return;

            const x = Math.min(cropStart.x, cropEnd.x);
            const y = Math.min(cropStart.y, cropEnd.y);
            const width = Math.abs(cropEnd.x - cropStart.x);
            const height = Math.abs(cropEnd.y - cropStart.y);

            // Darken outside area
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, canvas.width, y);
            ctx.fillRect(0, y, x, height);
            ctx.fillRect(x + width, y, canvas.width - x - width, height);
            ctx.fillRect(0, y + height, canvas.width, canvas.height - y - height);

            // Draw selection border
            ctx.strokeStyle = '#f97316';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, width, height);

            // Update info
            const scale = originalImage.width / canvas.width;
            const realWidth = Math.round(width * scale);
            const realHeight = Math.round(height * scale);
            document.getElementById('cropPos').textContent = `${Math.round(x * scale)}, ${Math.round(y * scale)}`;
            document.getElementById('cropSize').textContent = `${realWidth} × ${realHeight}`;
        }

        function updatePreview() {
            if (!cropStart || !cropEnd) return;

            const x = Math.min(cropStart.x, cropEnd.x);
            const y = Math.min(cropStart.y, cropEnd.y);
            const width = Math.abs(cropEnd.x - cropStart.x);
            const height = Math.abs(cropEnd.y - cropStart.y);

            if (width === 0 || height === 0) return;

            const scale = originalImage.width / canvas.width;
            const sx = x * scale;
            const sy = y * scale;
            const sWidth = width * scale;
            const sHeight = height * scale;

            previewCanvas.width = sWidth;
            previewCanvas.height = sHeight;
            previewCtx.drawImage(originalImage, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);
        }

        function setAspectRatio(ratio) {
            // Update button styles
            document.querySelectorAll('.ratio-btn').forEach(btn => {
                btn.style.background = 'var(--light)';
                btn.style.borderColor = 'var(--border)';
                btn.style.color = 'var(--white)';
            });
            const activeBtn = document.getElementById('ratio-' + ratio);
            activeBtn.style.background = 'var(--primary)';
            activeBtn.style.borderColor = 'var(--primary)';
            activeBtn.style.color = 'white';

            if (ratio === 'free') {
                aspectRatio = null;
            } else {
                const parts = ratio.split(':');
                aspectRatio = parseInt(parts[0]) / parseInt(parts[1]);
            }

            // Reset crop to center with new aspect ratio
            if (aspectRatio) {
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                const size = Math.min(canvas.width, canvas.height) * 0.7;
                const width = aspectRatio > 1 ? size : size * aspectRatio;
                const height = aspectRatio > 1 ? size / aspectRatio : size;

                cropStart = { x: centerX - width / 2, y: centerY - height / 2 };
                cropEnd = { x: centerX + width / 2, y: centerY + height / 2 };
                drawCropArea();
                updatePreview();
            }
        }

        function resetCrop() {
            cropStart = { x: 0, y: 0 };
            cropEnd = { x: canvas.width, y: canvas.height };
            drawCropArea();
            updatePreview();
        }

        function downloadCropped() {
            if (!previewCanvas.width || !previewCanvas.height) {
                showToast('Please select an area to crop', true);
                return;
            }

            previewCanvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'cropped_' + Date.now() + '.png';
                a.click();
                URL.revokeObjectURL(url);
                showToast('Image downloaded!');
            });
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }