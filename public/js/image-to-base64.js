let currentBase64 = '';
        let currentFormat = 'datauri';
        let imageType = '';

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

            imageType = file.type;
            const reader = new FileReader();
            reader.onload = (e) => {
                currentBase64 = e.target.result;
                document.getElementById('preview').src = currentBase64;
                
                // Show image info
                const img = new Image();
                img.onload = () => {
                    document.getElementById('imageInfo').textContent = 
                        `${img.width} × ${img.height} px • ${formatSize(file.size)} • ${file.type.split('/')[1].toUpperCase()}`;
                };
                img.src = currentBase64;

                updateOutput();
                document.getElementById('previewSection').style.display = 'block';
                document.getElementById('outputSection').style.display = 'block';
            };
            reader.readAsDataURL(file);
        }

        function setFormat(format) {
            currentFormat = format;
            
            // Update button styles
            document.querySelectorAll('.format-btn').forEach(btn => {
                btn.style.background = 'var(--light)';
                btn.style.borderColor = 'var(--border)';
            });
            const activeBtn = document.getElementById('btn-' + format);
            activeBtn.style.background = 'var(--primary)';
            activeBtn.style.borderColor = 'var(--primary)';
            
            updateOutput();
        }

        function updateOutput() {
            let output = '';
            
            if (currentFormat === 'datauri') {
                output = currentBase64;
            } else if (currentFormat === 'plain') {
                output = currentBase64.split(',')[1];
            } else if (currentFormat === 'css') {
                output = `background-image: url('${currentBase64}');`;
            }
            
            document.getElementById('base64Output').value = output;
            document.getElementById('stringLength').textContent = output.length.toLocaleString() + ' chars';
        }

        function copyToClipboard() {
            const output = document.getElementById('base64Output');
            output.select();
            document.execCommand('copy');
            showToast('Copied to clipboard!');
        }

        function downloadAsText() {
            const output = document.getElementById('base64Output').value;
            const blob = new Blob([output], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'base64_' + Date.now() + '.txt';
            a.click();
            URL.revokeObjectURL(url);
            showToast('Downloaded!');
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