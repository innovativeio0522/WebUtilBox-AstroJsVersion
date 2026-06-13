let beforeImg = null;
        let afterImg = null;
        let isDragging = false;

        // Drag and drop for before
        const dropZoneBefore = document.getElementById('dropZoneBefore');
        dropZoneBefore.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZoneBefore.style.borderColor = 'var(--primary)';
            dropZoneBefore.style.background = 'rgba(249, 115, 22, 0.1)';
        });
        dropZoneBefore.addEventListener('dragleave', () => {
            dropZoneBefore.style.borderColor = 'var(--border)';
            dropZoneBefore.style.background = 'transparent';
        });
        dropZoneBefore.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZoneBefore.style.borderColor = 'var(--border)';
            dropZoneBefore.style.background = 'transparent';
            if (e.dataTransfer.files.length) {
                handleFile('before', e.dataTransfer.files[0]);
            }
        });

        // Drag and drop for after
        const dropZoneAfter = document.getElementById('dropZoneAfter');
        dropZoneAfter.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZoneAfter.style.borderColor = 'var(--primary)';
            dropZoneAfter.style.background = 'rgba(249, 115, 22, 0.1)';
        });
        dropZoneAfter.addEventListener('dragleave', () => {
            dropZoneAfter.style.borderColor = 'var(--border)';
            dropZoneAfter.style.background = 'transparent';
        });
        dropZoneAfter.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZoneAfter.style.borderColor = 'var(--border)';
            dropZoneAfter.style.background = 'transparent';
            if (e.dataTransfer.files.length) {
                handleFile('after', e.dataTransfer.files[0]);
            }
        });

        function handleFile(type, file) {
            if (!file || !file.type.startsWith('image/')) {
                showToast('Please select an image', true);
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                if (type === 'before') {
                    beforeImg = e.target.result;
                    document.getElementById('beforeThumb').src = beforeImg;
                    document.getElementById('beforePreview').style.display = 'block';
                } else {
                    afterImg = e.target.result;
                    document.getElementById('afterThumb').src = afterImg;
                    document.getElementById('afterPreview').style.display = 'block';
                }

                if (beforeImg && afterImg) {
                    initComparison();
                }
            };
            reader.readAsDataURL(file);
        }

        function initComparison() {
            document.getElementById('beforeImage').src = beforeImg;
            document.getElementById('afterImage').src = afterImg;
            document.getElementById('comparisonContainer').style.display = 'block';
            document.getElementById('placeholder').style.display = 'none';
            document.getElementById('settings').style.display = 'block';
            document.getElementById('downloadBtn').style.display = 'block';

            // Setup slider dragging
            const sliderLine = document.getElementById('sliderLine');
            const container = document.getElementById('comparisonContainer');

            sliderLine.addEventListener('mousedown', (e) => {
                isDragging = true;
                e.preventDefault();
            });

            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                updateSliderFromMouse(e.clientX);
            });

            document.addEventListener('mouseup', () => {
                isDragging = false;
            });

            container.addEventListener('click', (e) => {
                if (e.target !== sliderLine && !sliderLine.contains(e.target)) {
                    updateSliderFromMouse(e.clientX);
                }
            });

            updateComparison();
            showToast('Comparison ready! Drag the slider to compare');
        }

        function updateSliderFromMouse(clientX) {
            const container = document.getElementById('comparisonContainer');
            const rect = container.getBoundingClientRect();
            const x = clientX - rect.left;
            const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
            
            document.getElementById('sliderPosition').value = percentage;
            document.getElementById('sliderPos-val').textContent = Math.round(percentage) + '%';
            updateSliderPosition(percentage);
        }

        function updateSliderPosition(percentage) {
            document.getElementById('sliderPos-val').textContent = Math.round(percentage) + '%';
            
            const sliderLine = document.getElementById('sliderLine');
            const afterContainer = document.getElementById('afterContainer');
            
            sliderLine.style.left = percentage + '%';
            afterContainer.style.clipPath = `inset(0 0 0 ${percentage}%)`;
        }

        function toggleLabels() {
            const show = document.getElementById('showLabels').checked;
            document.getElementById('beforeLabelDiv').style.display = show ? 'block' : 'none';
            document.getElementById('afterLabelDiv').style.display = show ? 'block' : 'none';
            document.getElementById('labelInputs').style.display = show ? 'block' : 'none';
        }

        function updateComparison() {
            const beforeLabel = document.getElementById('beforeLabel').value;
            const afterLabel = document.getElementById('afterLabel').value;
            
            document.getElementById('beforeLabelDiv').textContent = beforeLabel;
            document.getElementById('afterLabelDiv').textContent = afterLabel;
        }

        function downloadComparison() {
            const container = document.getElementById('comparisonContainer');
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            const beforeImage = document.getElementById('beforeImage');
            const afterImage = document.getElementById('afterImage');
            
            canvas.width = beforeImage.naturalWidth;
            canvas.height = beforeImage.naturalHeight;

            const sliderPos = parseFloat(document.getElementById('sliderPosition').value) / 100;

            // Draw before image
            ctx.drawImage(beforeImage, 0, 0);

            // Draw after image (clipped)
            ctx.save();
            ctx.beginPath();
            ctx.rect(canvas.width * sliderPos, 0, canvas.width * (1 - sliderPos), canvas.height);
            ctx.clip();
            ctx.drawImage(afterImage, 0, 0);
            ctx.restore();

            // Draw slider line
            ctx.strokeStyle = '#f97316';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(canvas.width * sliderPos, 0);
            ctx.lineTo(canvas.width * sliderPos, canvas.height);
            ctx.stroke();

            // Draw labels if enabled
            if (document.getElementById('showLabels').checked) {
                const fontSize = Math.max(20, canvas.width / 30);
                ctx.font = `bold ${fontSize}px Arial`;
                
                // Before label
                const beforeText = document.getElementById('beforeLabel').value;
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                const beforeWidth = ctx.measureText(beforeText).width;
                ctx.fillRect(20, 20, beforeWidth + 24, fontSize + 16);
                ctx.fillStyle = 'white';
                ctx.fillText(beforeText, 32, 20 + fontSize);
                
                // After label
                const afterText = document.getElementById('afterLabel').value;
                ctx.fillStyle = 'rgba(249, 115, 22, 0.9)';
                const afterWidth = ctx.measureText(afterText).width;
                ctx.fillRect(canvas.width - afterWidth - 44, 20, afterWidth + 24, fontSize + 16);
                ctx.fillStyle = 'white';
                ctx.fillText(afterText, canvas.width - afterWidth - 32, 20 + fontSize);
            }

            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'comparison_' + Date.now() + '.png';
                a.click();
                URL.revokeObjectURL(url);
                showToast('Comparison downloaded!');
            });
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }