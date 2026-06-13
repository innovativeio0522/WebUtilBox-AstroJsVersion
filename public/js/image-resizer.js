let originalImage = null;
        let aspectRatio = 1;

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
                    aspectRatio = originalImage.width / originalImage.height;
                    document.getElementById('width').value = originalImage.width;
                    document.getElementById('height').value = originalImage.height;
                    document.getElementById('controls').style.display = 'block';
                    resizeImage();
                };
                originalImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        function updateFromWidth() {
            if (document.getElementById('maintainRatio').checked) {
                const width = parseInt(document.getElementById('width').value);
                document.getElementById('height').value = Math.round(width / aspectRatio);
            }
            resizeImage();
        }

        function updateFromHeight() {
            if (document.getElementById('maintainRatio').checked) {
                const height = parseInt(document.getElementById('height').value);
                document.getElementById('width').value = Math.round(height * aspectRatio);
            }
            resizeImage();
        }

        function toggleRatio() {
            if (document.getElementById('maintainRatio').checked) {
                updateFromWidth();
            }
        }

        function setSize(w, h) {
            document.getElementById('width').value = w;
            document.getElementById('height').value = h;
            document.getElementById('maintainRatio').checked = false;
            resizeImage();
        }

        function resizeImage() {
            if (!originalImage) return;

            const width = parseInt(document.getElementById('width').value) || originalImage.width;
            const height = parseInt(document.getElementById('height').value) || originalImage.height;

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(originalImage, 0, 0, width, height);

            document.getElementById('preview').src = canvas.toDataURL();
            document.getElementById('previewSize').textContent = `${width} × ${height} px`;
        }

        function downloadImage() {
            const canvas = document.createElement('canvas');
            const width = parseInt(document.getElementById('width').value);
            const height = parseInt(document.getElementById('height').value);
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(originalImage, 0, 0, width, height);

            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `resized_${width}x${height}.png`;
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