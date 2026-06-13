let originalImage = null;
        let canvas, ctx;
        let currentRotation = 0;
        let horizontalFlip = false;
        let verticalFlip = false;

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
                    reset();
                    document.getElementById('uploadArea').style.display = 'none';
                    document.getElementById('previewArea').style.display = 'block';
                    document.getElementById('controls').style.display = 'block';
                };
                originalImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        function rotate(degrees) {
            currentRotation = (currentRotation + degrees) % 360;
            if (currentRotation < 0) currentRotation += 360;
            updateDisplay();
        }

        function flip(direction) {
            if (direction === 'horizontal') {
                horizontalFlip = !horizontalFlip;
            } else {
                verticalFlip = !verticalFlip;
            }
            updateDisplay();
        }

        function reset() {
            currentRotation = 0;
            horizontalFlip = false;
            verticalFlip = false;
            updateDisplay();
        }

        function updateDisplay() {
            if (!originalImage) return;

            canvas = document.getElementById('canvas');
            ctx = canvas.getContext('2d');

            // Calculate canvas size based on rotation
            let width = originalImage.width;
            let height = originalImage.height;

            if (currentRotation === 90 || currentRotation === 270) {
                // Swap dimensions for 90° and 270° rotations
                canvas.width = height;
                canvas.height = width;
            } else {
                canvas.width = width;
                canvas.height = height;
            }

            // Scale canvas to fit preview area
            const maxWidth = 450;
            const maxHeight = 400;
            const scale = Math.min(1, maxWidth / canvas.width, maxHeight / canvas.height);
            const displayWidth = canvas.width * scale;
            const displayHeight = canvas.height * scale;
            canvas.style.width = displayWidth + 'px';
            canvas.style.height = displayHeight + 'px';

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Save context state
            ctx.save();

            // Move to center
            ctx.translate(canvas.width / 2, canvas.height / 2);

            // Apply rotation
            ctx.rotate((currentRotation * Math.PI) / 180);

            // Apply flips
            ctx.scale(horizontalFlip ? -1 : 1, verticalFlip ? -1 : 1);

            // Draw image centered
            ctx.drawImage(originalImage, -width / 2, -height / 2, width, height);

            // Restore context state
            ctx.restore();

            // Update display info
            document.getElementById('rotationDisplay').textContent = currentRotation + '°';
            document.getElementById('hFlipDisplay').textContent = horizontalFlip ? 'Yes' : 'No';
            document.getElementById('vFlipDisplay').textContent = verticalFlip ? 'Yes' : 'No';
            document.getElementById('dimensions').textContent = `${canvas.width} × ${canvas.height} px`;
        }

        function downloadImage() {
            if (!originalImage) return;

            // Create a new canvas with the correct dimensions
            const downloadCanvas = document.createElement('canvas');
            const downloadCtx = downloadCanvas.getContext('2d');

            let width = originalImage.width;
            let height = originalImage.height;

            if (currentRotation === 90 || currentRotation === 270) {
                downloadCanvas.width = height;
                downloadCanvas.height = width;
            } else {
                downloadCanvas.width = width;
                downloadCanvas.height = height;
            }

            // Apply transformations
            downloadCtx.save();
            downloadCtx.translate(downloadCanvas.width / 2, downloadCanvas.height / 2);
            downloadCtx.rotate((currentRotation * Math.PI) / 180);
            downloadCtx.scale(horizontalFlip ? -1 : 1, verticalFlip ? -1 : 1);
            downloadCtx.drawImage(originalImage, -width / 2, -height / 2, width, height);
            downloadCtx.restore();

            // Download
            downloadCanvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'transformed_' + Date.now() + '.png';
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

        function uploadNew() {
            document.getElementById('fileInput').click();
        }