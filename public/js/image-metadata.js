let originalFile = null;
        let originalImage = null;
        let allExifData = {};

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

            originalFile = file;

            const reader = new FileReader();
            reader.onload = (e) => {
                originalImage = new Image();
                originalImage.onload = () => {
                    document.getElementById('preview').src = e.target.result;
                    document.getElementById('fileInfo').textContent = 
                        `${originalImage.width} × ${originalImage.height} px • ${formatSize(file.size)} • ${file.type.split('/')[1].toUpperCase()}`;
                    
                    // Extract EXIF data
                    extractMetadata(originalImage);
                    
                    document.getElementById('uploadArea').style.display = 'none';
                    document.getElementById('previewArea').style.display = 'block';
                    document.getElementById('controls').style.display = 'block';
                };
                originalImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        function extractMetadata(img) {
            if (typeof EXIF === 'undefined') {
                showToast('Loading EXIF library...', false);
                setTimeout(() => extractMetadata(img), 500);
                return;
            }

            EXIF.getData(img, function() {
                allExifData = EXIF.getAllTags(this);
                displayMetadata();
            });
        }

        function displayMetadata() {
            const keyFields = ['Make', 'Model', 'DateTime', 'DateTimeOriginal', 'GPSLatitude', 'GPSLongitude', 
                               'GPSLatitudeRef', 'GPSLongitudeRef', 'Software', 'Orientation'];
            
            const totalFields = Object.keys(allExifData).length;
            const hasGPS = allExifData.GPSLatitude || allExifData.GPSLongitude;

            document.getElementById('totalFields').textContent = totalFields;
            document.getElementById('hasGPS').textContent = hasGPS ? 'Yes ??' : 'No';
            document.getElementById('hasGPS').style.color = hasGPS ? '#ef4444' : 'var(--primary)';

            // Display key metadata
            const keyMetadataDiv = document.getElementById('keyMetadata');
            if (totalFields === 0) {
                keyMetadataDiv.innerHTML = '<div style="color: var(--gray); text-align: center; padding: 20px;">No metadata found</div>';
            } else {
                let html = '';
                keyFields.forEach(field => {
                    if (allExifData[field]) {
                        let value = allExifData[field];
                        
                        // Format GPS coordinates
                        if (field === 'GPSLatitude' || field === 'GPSLongitude') {
                            value = formatGPS(value, allExifData[field + 'Ref']);
                        }
                        
                        // Format arrays
                        if (Array.isArray(value)) {
                            value = value.join(', ');
                        }
                        
                        html += `<div style="margin-bottom: 6px; display: flex; justify-content: space-between;">
                            <span style="color: var(--gray);">${field}:</span>
                            <span style="color: var(--white); text-align: right; max-width: 60%; word-break: break-word;">${value}</span>
                        </div>`;
                    }
                });
                keyMetadataDiv.innerHTML = html || '<div style="color: var(--gray); text-align: center; padding: 20px;">No key metadata found</div>';
            }

            // Display all metadata
            const allMetadataDiv = document.getElementById('allMetadata');
            if (totalFields === 0) {
                allMetadataDiv.textContent = 'No metadata found';
            } else {
                let html = '';
                for (const [key, value] of Object.entries(allExifData)) {
                    let displayValue = value;
                    if (Array.isArray(value)) {
                        displayValue = value.join(', ');
                    } else if (typeof value === 'object') {
                        displayValue = JSON.stringify(value);
                    }
                    html += `<div style="margin-bottom: 4px;"><strong>${key}:</strong> ${displayValue}</div>`;
                }
                allMetadataDiv.innerHTML = html;
            }
        }

        function formatGPS(coords, ref) {
            if (!coords || coords.length < 3) return 'N/A';
            const degrees = coords[0];
            const minutes = coords[1];
            const seconds = coords[2];
            return `${degrees}° ${minutes}' ${seconds}" ${ref || ''}`;
        }

        function toggleAllMetadata() {
            const div = document.getElementById('allMetadata');
            const btn = document.getElementById('toggleBtn');
            if (div.style.display === 'none') {
                div.style.display = 'block';
                btn.textContent = 'Hide All';
            } else {
                div.style.display = 'none';
                btn.textContent = 'Show All';
            }
        }

        function removeMetadata() {
            if (!originalImage) return;

            // Create canvas and draw image (this removes EXIF data)
            const canvas = document.createElement('canvas');
            canvas.width = originalImage.width;
            canvas.height = originalImage.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(originalImage, 0, 0);

            // Convert to blob and download
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'no_metadata_' + (originalFile.name || 'image.jpg');
                a.click();
                URL.revokeObjectURL(url);
                showToast('Image downloaded without metadata!');
            }, 'image/jpeg', 0.95);
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

        function uploadNew() {
            document.getElementById('fileInput').click();
        }