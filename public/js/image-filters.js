let originalImage = null;
        let canvas, ctx;

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
                    document.getElementById('previewArea').style.display = 'block';
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

            updateFilters();
        }

        function applyPreset(preset) {
            // Update button styles
            document.querySelectorAll('.preset-btn').forEach(btn => {
                btn.style.background = 'var(--light)';
                btn.style.borderColor = 'var(--border)';
                btn.style.color = 'var(--white)';
            });
            const activeBtn = document.getElementById('preset-' + preset);
            activeBtn.style.background = 'var(--primary)';
            activeBtn.style.borderColor = 'var(--primary)';
            activeBtn.style.color = 'white';

            // Reset all
            document.getElementById('brightness').value = 100;
            document.getElementById('contrast').value = 100;
            document.getElementById('saturation').value = 100;
            document.getElementById('blur').value = 0;
            document.getElementById('hue').value = 0;
            document.getElementById('opacity').value = 100;

            // Apply preset
            switch(preset) {
                case 'grayscale':
                    document.getElementById('saturation').value = 0;
                    break;
                case 'sepia':
                    document.getElementById('saturation').value = 50;
                    document.getElementById('hue').value = 30;
                    document.getElementById('contrast').value = 90;
                    break;
                case 'invert':
                    document.getElementById('hue').value = 180;
                    document.getElementById('brightness').value = 150;
                    break;
                case 'vintage':
                    document.getElementById('saturation').value = 70;
                    document.getElementById('contrast').value = 110;
                    document.getElementById('brightness').value = 110;
                    document.getElementById('hue').value = 20;
                    break;
                case 'cool':
                    document.getElementById('saturation').value = 120;
                    document.getElementById('hue').value = 200;
                    document.getElementById('brightness').value = 105;
                    break;
            }

            updateFilters();
        }

        function updateFilters() {
            const brightness = document.getElementById('brightness').value;
            const contrast = document.getElementById('contrast').value;
            const saturation = document.getElementById('saturation').value;
            const blur = document.getElementById('blur').value;
            const hue = document.getElementById('hue').value;
            const opacity = document.getElementById('opacity').value;

            // Update labels
            document.getElementById('brightness-val').textContent = brightness + '%';
            document.getElementById('contrast-val').textContent = contrast + '%';
            document.getElementById('saturation-val').textContent = saturation + '%';
            document.getElementById('blur-val').textContent = blur + 'px';
            document.getElementById('hue-val').textContent = hue + '°';
            document.getElementById('opacity-val').textContent = opacity + '%';

            // Apply filters
            ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px) hue-rotate(${hue}deg) opacity(${opacity}%)`;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
        }

        function resetFilters() {
            applyPreset('none');
        }

        function downloadImage() {
            // Create a new canvas with original image size
            const downloadCanvas = document.createElement('canvas');
            const downloadCtx = downloadCanvas.getContext('2d');
            downloadCanvas.width = originalImage.width;
            downloadCanvas.height = originalImage.height;

            // Apply same filters
            const brightness = document.getElementById('brightness').value;
            const contrast = document.getElementById('contrast').value;
            const saturation = document.getElementById('saturation').value;
            const blur = document.getElementById('blur').value;
            const hue = document.getElementById('hue').value;
            const opacity = document.getElementById('opacity').value;

            downloadCtx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px) hue-rotate(${hue}deg) opacity(${opacity}%)`;
            downloadCtx.drawImage(originalImage, 0, 0);

            downloadCanvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'filtered_' + Date.now() + '.png';
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