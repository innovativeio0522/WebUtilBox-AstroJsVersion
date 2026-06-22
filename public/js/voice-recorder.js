let mediaRecorder;
        let audioChunks = [];
        let startTime;
        let timerInterval;
        let audioContext;
        let analyser;
        let dataArray;
        let animationId;
        let isPaused = false;
        let pausedTime = 0;
        let activeAudioUrl = null;

        async function startRecording() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                
                mediaRecorder = new MediaRecorder(stream);
                audioChunks = [];
                isPaused = false;
                pausedTime = 0;

                mediaRecorder.ondataavailable = (event) => {
                    audioChunks.push(event.data);
                };

                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    if (activeAudioUrl) {
                        URL.revokeObjectURL(activeAudioUrl);
                    }
                    activeAudioUrl = URL.createObjectURL(audioBlob);
                    document.getElementById('audioPlayback').src = activeAudioUrl;
                    document.getElementById('playbackSection').style.display = 'block';
                    stopVisualizer();
                };

                mediaRecorder.start();
                startTime = Date.now();
                startTimer();
                startVisualizer(stream);

                document.getElementById('startBtn').style.display = 'none';
                document.getElementById('stopBtn').style.display = 'inline-block';
                document.getElementById('pauseBtn').style.display = 'inline-block';
                document.getElementById('micIcon').classList.add('recording');
                document.getElementById('visualizer').style.display = 'block';

                showToast('Recording started!');
            } catch (error) {
                showToast('Microphone access denied', true);
            }
        }

        function stopRecording() {
            if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop();
                mediaRecorder.stream.getTracks().forEach(track => track.stop());
                clearInterval(timerInterval);

                document.getElementById('stopBtn').style.display = 'none';
                document.getElementById('pauseBtn').style.display = 'none';
                document.getElementById('resumeBtn').style.display = 'none';
                document.getElementById('micIcon').classList.remove('recording');

                showToast('Recording stopped!');
            }
        }

        function pauseRecording() {
            if (mediaRecorder && mediaRecorder.state === 'recording') {
                mediaRecorder.pause();
                isPaused = true;
                pausedTime = Date.now();
                clearInterval(timerInterval);

                document.getElementById('pauseBtn').style.display = 'none';
                document.getElementById('resumeBtn').style.display = 'inline-block';
                document.getElementById('micIcon').classList.remove('recording');

                showToast('Recording paused');
            }
        }

        function resumeRecording() {
            if (mediaRecorder && mediaRecorder.state === 'paused') {
                mediaRecorder.resume();
                isPaused = false;
                startTime += (Date.now() - pausedTime);
                startTimer();

                document.getElementById('resumeBtn').style.display = 'none';
                document.getElementById('pauseBtn').style.display = 'inline-block';
                document.getElementById('micIcon').classList.add('recording');

                showToast('Recording resumed');
            }
        }

        function startTimer() {
            timerInterval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
                const seconds = (elapsed % 60).toString().padStart(2, '0');
                document.getElementById('timer').textContent = `${minutes}:${seconds}`;
            }, 1000);
        }

        function startVisualizer(stream) {
            stopVisualizer();
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);
            analyser.fftSize = 256;

            const bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);

            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;

            function draw() {
                animationId = requestAnimationFrame(draw);

                analyser.getByteFrequencyData(dataArray);

                ctx.fillStyle = '#1a1a1a';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                const barWidth = (canvas.width / bufferLength) * 2.5;
                let x = 0;

                for (let i = 0; i < bufferLength; i++) {
                    const barHeight = (dataArray[i] / 255) * canvas.height;

                    ctx.fillStyle = `rgb(249, ${115 + dataArray[i] / 2}, 22)`;
                    ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

                    x += barWidth + 1;
                }
            }

            draw();
        }

        function stopVisualizer() {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            if (audioContext) {
                audioContext.close();
            }
        }

        function downloadRecording() {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const url = URL.createObjectURL(audioBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `recording_${Date.now()}.wav`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('Recording downloaded!');
        }

        function resetRecorder() {
            document.getElementById('playbackSection').style.display = 'none';
            document.getElementById('startBtn').style.display = 'inline-block';
            document.getElementById('timer').textContent = '00:00';
            document.getElementById('visualizer').style.display = 'none';
            audioChunks = [];
            if (activeAudioUrl) {
                URL.revokeObjectURL(activeAudioUrl);
                activeAudioUrl = null;
            }
            document.getElementById('audioPlayback').src = '';
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }