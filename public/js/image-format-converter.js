let imageData = null;
        let currentBackground = 'transparent';
        let outputFormat = 'png';
        let originalWidth = 512;
        let originalHeight = 512;
        let isSVG = false;

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
                showToast('Please select an image file', true);
                return;
            }

            isSVG = file.name.endsWith('.svg') || file.type === 'image/svg+xml';

            if (isSVG) {
                // Handle SVG
                const reader = new FileReader();
                reader.onload = (e) => {
                    imageData = e.target.result;
                    const parser = new DOMParser();
                    const svgDoc = parser.parseFromString(imageData, 'image/svg+xml');
                    const svgElement = svgDoc.querySelector('svg');
                    
                    if (svgElement) {
                        originalWidth = parseInt(svgElement.getAttribute('width')) || 512;
                        originalHeight = parseInt(svgElement.getAttribute('height')) || 512;
                        
                        if (!svgElement.getAttribute('width') && svgElement.getAttribute('viewBox')) {
                            const viewBox = svgElement.getAttribute('viewBox').split(' ');
                            originalWidth = parseInt(viewBox[2]);
                            originalHeight = parseInt(viewBox[3]);
                        }
                        
                        document.getElementById('width').value = originalWidth;
                        document.getElementById('height').value = originalHeight;
                    }
                    
                    document.getElementById('controls').style.display = 'block';
                    updatePreview();
                };
                reader.readAsText(file);
            } else {
                // Handle raster images
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        imageData = img;
                        originalWidth = img.width;
                        originalHeight = img.height;
                        document.getElementById('width').value = originalWidth;
                        document.getElementById('height').value = originalHeight;
                        document.getElementById('controls').style.display = 'block';
                        updatePreview();
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        }

        function setOutputFormat(format) {
            outputFormat = format;
            
            // Update button styles
            document.querySelectorAll('.format-btn').forEach(btn => {
                btn.style.background = 'var(--light)';
                btn.style.borderColor = 'var(--border)';
                btn.style.color = 'var(--white)';
            });
            const activeBtn = document.getElementById('fmt-' + format);
            activeBtn.style.background = 'var(--primary)';
            activeBtn.style.borderColor = 'var(--primary)';
            activeBtn.style.color = 'white';
            
            // Show/hide quality control (only for JPEG and WebP)
            const qualityControl = document.getElementById('qualityControl');
            const scaleControl = document.getElementById('scaleControl');
            if (format === 'jpeg' || format === 'webp') {
                qualityControl.style.display = 'block';
                scaleControl.style.display = 'none';
            } else {
                qualityControl.style.display = 'none';
                scaleControl.style.display = 'block';
            }
            
            // Update download button text
            document.getElementById('downloadBtn').textContent = 'Download ' + format.toUpperCase();
            
            updatePreview();
        }

        function applyScale() {
            const scale = parseFloat(document.getElementById('scale').value);
            document.getElementById('width').value = Math.round(originalWidth * scale);
            document.getElementById('height').value = Math.round(originalHeight * scale);
            updatePreview();
        }

        function setBackground(color) {
            currentBackground = color;
            
            // Update button styles
            document.querySelectorAll('.bg-btn').forEach(btn => {
                btn.style.borderWidth = '1px';
                btn.style.borderColor = 'var(--border)';
            });
            
            const activeBtn = document.getElementById('bg-' + (color === 'transparent' ? 'transparent' : color.replace('#', '')));
            if (activeBtn) {
                activeBtn.style.borderWidth = '2px';
                activeBtn.style.borderColor = 'var(--primary)';
            }
            
            updatePreview();
        }

        function updatePreview() {
            if (!imageData) return;

            const width = parseInt(document.getElementById('width').value) || originalWidth;
            const height = parseInt(document.getElementById('height').value) || originalHeight;
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = width;
            canvas.height = height;

            // Fill background
            if (currentBackground !== 'transparent') {
                ctx.fillStyle = currentBackground;
                ctx.fillRect(0, 0, width, height);
            } else {
                ctx.clearRect(0, 0, width, height);
            }

            if (isSVG) {
                // Draw SVG
                const img = new Image();
                const blob = new Blob([imageData], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                
                img.onload = () => {
                    ctx.drawImage(img, 0, 0, width, height);
                    URL.revokeObjectURL(url);
                };
                img.src = url;
            } else {
                // Draw raster image
                ctx.drawImage(imageData, 0, 0, width, height);
            }
        }

        function downloadImage() {
            const canvas = document.getElementById('canvas');
            const quality = (document.getElementById('quality').value / 100) || 0.9;
            
            let mimeType = 'image/png';
            let extension = 'png';
            
            if (outputFormat === 'jpeg') {
                mimeType = 'image/jpeg';
                extension = 'jpg';
            } else if (outputFormat === 'webp') {
                mimeType = 'image/webp';
                extension = 'webp';
            } else if (outputFormat === 'gif') {
                mimeType = 'image/gif';
                extension = 'gif';
            }
            
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'converted_' + Date.now() + '.' + extension;
                a.click();
                URL.revokeObjectURL(url);
                showToast(outputFormat.toUpperCase() + ' downloaded!');
            }, mimeType, quality);
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }