let originalImage = null;
        const sizes = [16, 32, 64, 128, 256];

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
                    generateFavicons();
                    document.getElementById('uploadArea').style.display = 'none';
                    document.getElementById('result').style.display = 'block';
                };
                originalImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        function generateFavicons() {
            sizes.forEach(size => {
                const canvas = document.getElementById(`canvas-${size}`);
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(originalImage, 0, 0, size, size);
            });

            // Generate HTML code
            const htmlCode = `<!-- Favicon Links -->
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="64x64" href="/favicon-64x64.png">
<link rel="apple-touch-icon" sizes="128x128" href="/favicon-128x128.png">
<link rel="apple-touch-icon" sizes="256x256" href="/favicon-256x256.png">`;
            
            document.getElementById('htmlCode').value = htmlCode;
        }

        function downloadSize(size) {
            const canvas = document.getElementById(`canvas-${size}`);
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `favicon-${size}x${size}.png`;
                a.click();
                URL.revokeObjectURL(url);
                showToast(`${size}×${size} downloaded!`);
            });
        }

        async function downloadAll() {
            if (typeof JSZip === 'undefined') {
                showToast('Loading ZIP library...', false);
                setTimeout(downloadAll, 1000);
                return;
            }

            const zip = new JSZip();

            // Add all sizes to ZIP
            for (const size of sizes) {
                const canvas = document.getElementById(`canvas-${size}`);
                const blob = await new Promise(resolve => canvas.toBlob(resolve));
                zip.file(`favicon-${size}x${size}.png`, blob);
            }

            // Add HTML file
            const htmlCode = document.getElementById('htmlCode').value;
            zip.file('favicon-links.html', htmlCode);

            // Generate and download ZIP
            const content = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'favicons.zip';
            a.click();
            URL.revokeObjectURL(url);
            showToast('All favicons downloaded!');
        }

        function copyCode() {
            const code = document.getElementById('htmlCode');
            code.select();
            document.execCommand('copy');
            showToast('HTML code copied!');
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }