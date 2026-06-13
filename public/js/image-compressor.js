let originalFile = null;
        let compressedBlob = null;

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

            originalFile = file;
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('originalImg').src = e.target.result;
                document.getElementById('origSize').textContent = formatSize(file.size);
                document.getElementById('controls').style.display = 'block';
                compressImage();
            };
            reader.readAsDataURL(file);
        }

        function updateQuality() {
            const quality = document.getElementById('quality').value;
            document.getElementById('qualityDisplay').textContent = quality + '%';
            console.log('Quality changed to:', quality);
            if (originalFile) {
                console.log('Calling compressImage...');
                compressImage();
            }
        }

        function compressImage() {
            if (!originalFile) return;
            
            const quality = document.getElementById('quality').value / 100;
            console.log('Compressing with quality:', quality);
            const img = new Image();
            img.onload = () => {
                console.log('Image loaded, creating canvas...');
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                canvas.toBlob((blob) => {
                    if (!blob) {
                        console.error('Blob creation failed');
                        return;
                    }
                    
                    console.log('Blob created, size:', blob.size);
                    compressedBlob = blob;
                    const url = URL.createObjectURL(blob);
                    
                    // Update compressed image
                    const compImg = document.getElementById('compressedImg');
                    if (compImg.src) URL.revokeObjectURL(compImg.src);
                    compImg.src = url;
                    
                    // Update sizes
                    document.getElementById('compSize').textContent = formatSize(blob.size);
                    
                    // Calculate and update saved percentage
                    const saved = ((originalFile.size - blob.size) / originalFile.size * 100).toFixed(1);
                    console.log('Original size:', originalFile.size, 'Compressed size:', blob.size, 'Saved:', saved + '%');
                    const savedElement = document.getElementById('savedSize');
                    savedElement.textContent = saved + '%';
                    
                    // Change color based on whether we saved or increased size
                    if (parseFloat(saved) < 0) {
                        savedElement.style.color = '#ef4444'; // Red for increased size
                    } else {
                        savedElement.style.color = 'var(--primary)'; // Orange for saved
                    }
                    
                    document.getElementById('preview').style.display = 'block';
                }, 'image/jpeg', quality);
            };
            img.src = document.getElementById('originalImg').src;
        }

        function downloadImage() {
            if (!compressedBlob) return;
            
            const url = URL.createObjectURL(compressedBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'compressed_' + (originalFile.name.replace(/\.[^/.]+$/, '') || 'image') + '.jpg';
            a.click();
            URL.revokeObjectURL(url);
            showToast('Image downloaded!');
        }

        function formatSize(bytes) {
            if (bytes < 1024) return bytes + ' B';
            if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
            return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }