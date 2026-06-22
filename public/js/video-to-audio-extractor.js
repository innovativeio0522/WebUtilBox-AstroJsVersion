let video = null;
        let audioContext = null;
        let sourceNode = null;
        let destinationNode = null;
        let audioBlob = null;
        let originalFileName = '';
        let activeVideoUrl = null;
        let activeAudioUrl = null;
        let loadedFile = null;
        let eventListenersBound = false;

        function loadVideo() {
            const file = document.getElementById('videoFile').files[0];
            if (!file) return;
            loadedFile = file;

            if (activeVideoUrl) {
                URL.revokeObjectURL(activeVideoUrl);
            }

            originalFileName = file.name.replace(/\.[^/.]+$/, '');
            video = document.getElementById('videoPlayer');
            activeVideoUrl = URL.createObjectURL(file);
            video.src = activeVideoUrl;

            if (!eventListenersBound) {
                video.addEventListener('loadedmetadata', () => {
                    const duration = formatTime(video.duration);
                    const resolution = `${video.videoWidth} × ${video.videoHeight}`;
                    
                    document.getElementById('fileName').textContent = loadedFile.name;
                    document.getElementById('videoDuration').textContent = duration;
                    document.getElementById('videoResolution').textContent = resolution;
                    document.getElementById('endTime').max = video.duration;
                    document.getElementById('startTime').max = video.duration;
                    document.getElementById('endTime').placeholder = `End (max: ${video.duration.toFixed(1)}s)`;
                    
                    document.getElementById('videoControls').style.display = 'block';
                    showToast('Video loaded successfully!');
                });
                eventListenersBound = true;
            }
        }

        async function extractAudio() {
            if (!video) {
                showToast('Please select a video file first', true);
                return;
            }

            document.getElementById('progress').style.display = 'block';
            document.getElementById('progressText').textContent = 'Extracting audio...';

            try {
                if (!audioContext) {
                    audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    sourceNode = audioContext.createMediaElementSource(video);
                    destinationNode = audioContext.createMediaStreamDestination();
                    sourceNode.connect(destinationNode);
                    sourceNode.connect(audioContext.destination);
                } else if (audioContext.state === 'suspended') {
                    await audioContext.resume();
                }

                // Record audio
                const mediaRecorder = new MediaRecorder(destinationNode.stream);
                const chunks = [];

                mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) {
                        chunks.push(e.data);
                    }
                };

                mediaRecorder.onstop = async () => {
                    audioBlob = new Blob(chunks, { type: 'audio/webm' });
                    
                    // Convert to selected format
                    const format = document.getElementById('audioFormat').value;
                    await convertAudioFormat(audioBlob, format);
                    
                    document.getElementById('progress').style.display = 'none';
                    showToast('Audio extracted successfully!');
                };

                // Get time range
                const startTime = parseFloat(document.getElementById('startTime').value) || 0;
                const endTime = parseFloat(document.getElementById('endTime').value) || video.duration;

                video.currentTime = startTime;
                video.play();

                mediaRecorder.start();

                // Stop recording at end time
                setTimeout(() => {
                    mediaRecorder.stop();
                    video.pause();
                }, (endTime - startTime) * 1000);

            } catch (error) {
                document.getElementById('progress').style.display = 'none';
                showToast('Error extracting audio: ' + error.message, true);
            }
        }

        async function convertAudioFormat(blob, format) {
            // For now, we'll use the WebM audio as-is
            // In a production app, you'd use a library like ffmpeg.wasm for format conversion
            if (activeAudioUrl) {
                URL.revokeObjectURL(activeAudioUrl);
            }
            activeAudioUrl = URL.createObjectURL(blob);
            const audioPlayer = document.getElementById('audioPlayer');
            audioPlayer.src = activeAudioUrl;
            document.getElementById('audioPreview').style.display = 'block';
        }

        function downloadAudio() {
            if (!audioBlob) return;

            const format = document.getElementById('audioFormat').value;
            const url = URL.createObjectURL(audioBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${originalFileName}_audio.${format === 'mp3' ? 'mp3' : format === 'wav' ? 'wav' : 'ogg'}`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('Audio downloaded!');
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