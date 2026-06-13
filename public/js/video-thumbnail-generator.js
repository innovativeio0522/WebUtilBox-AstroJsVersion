let video = null;
        let thumbnails = [];

        function loadVideo() {
            const file = document.getElementById('videoFile').files[0];
            if (!file) return;

            video = document.getElementById('videoPlayer');
            video.src = URL.createObjectURL(file);

            video.addEventListener('loadedmetadata', () => {
                const duration = formatTime(video.duration);
                const resolution = `${video.videoWidth} × ${video.videoHeight}`;
                
                document.getElementById('videoDuration').textContent = duration;
                document.getElementById('videoResolution').textContent = resolution;
                document.getElementById('videoControls').style.display = 'block';
                
                showToast('Video loaded successfully!');
            });

            video.addEventListener('timeupdate', () => {
                document.getElementById('currentTime').textContent = formatTime(video.currentTime);
            });
        }

        function updateCaptureMode() {
            const mode = document.getElementById('captureMode').value;
            document.getElementById('multipleOptions').style.display = mode === 'multiple' ? 'block' : 'none';
            document.getElementById('intervalOptions').style.display = mode === 'interval' ? 'block' : 'none';
        }

        async function captureFrame() {
            if (!video) return;

            const mode = document.getElementById('captureMode').value;

            if (mode === 'current') {
                captureSingleFrame(video.currentTime);
            } else if (mode === 'multiple') {
                const count = parseInt(document.getElementById('frameCount').value);
                const interval = video.duration / (count + 1);
                
                for (let i = 1; i <= count; i++) {
                    const time = interval * i;
                    await captureAtTime(time);
                }
            } else if (mode === 'interval') {
                const interval = parseInt(document.getElementById('intervalSeconds').value);
                const count = Math.floor(video.duration / interval);
                
                for (let i = 0; i < count; i++) {
                    const time = interval * i;
                    await captureAtTime(time);
                }
            }

            displayThumbnails();
            showToast('Frame(s) captured!');
        }

        function captureSingleFrame(time) {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                thumbnails.push({ url, blob, time });
                displayThumbnails();
            }, 'image/png');
        }

        async function captureAtTime(time) {
            return new Promise((resolve) => {
                video.currentTime = time;
                video.addEventListener('seeked', function handler() {
                    video.removeEventListener('seeked', handler);
                    captureSingleFrame(time);
                    resolve();
                });
            });
        }

        function displayThumbnails() {
            const container = document.getElementById('thumbnails');
            container.innerHTML = '';

            thumbnails.forEach((thumb, index) => {
                const item = document.createElement('div');
                item.className = 'thumbnail-item';
                item.innerHTML = `
                    <img src="${thumb.url}" alt="Frame ${index + 1}">
                    <div style="font-size: 0.85rem; color: var(--gray); margin-bottom: 8px; text-align: center;">
                        ${formatTime(thumb.time)}
                    </div>
                    <button onclick="downloadThumbnail(${index})">Download</button>
                `;
                container.appendChild(item);
            });

            document.getElementById('thumbCount').textContent = thumbnails.length;
            document.getElementById('thumbnailsSection').style.display = thumbnails.length > 0 ? 'block' : 'none';
        }

        function downloadThumbnail(index) {
            const thumb = thumbnails[index];
            const a = document.createElement('a');
            a.href = thumb.url;
            a.download = `frame_${formatTime(thumb.time).replace(/:/g, '-')}.png`;
            a.click();
            showToast('Frame downloaded!');
        }

        function downloadAll() {
            thumbnails.forEach((thumb, index) => {
                setTimeout(() => {
                    const a = document.createElement('a');
                    a.href = thumb.url;
                    a.download = `frame_${index + 1}_${formatTime(thumb.time).replace(/:/g, '-')}.png`;
                    a.click();
                }, index * 200);
            });
            showToast(`Downloading ${thumbnails.length} frames...`);
        }

        function clearThumbnails() {
            thumbnails.forEach(thumb => URL.revokeObjectURL(thumb.url));
            thumbnails = [];
            document.getElementById('thumbnailsSection').style.display = 'none';
            showToast('All thumbnails cleared');
        }

        function formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }