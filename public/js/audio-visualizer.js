let audioContext;
        let analyser;
        let dataArray;
        let bufferLength;
        let animationId;
        let playerSource;
        let micSource;
        let canvas;
        let ctx;
        let activeAudioUrl = null;

        function initCanvas() {
            canvas = document.getElementById('visualizer');
            ctx = canvas.getContext('2d');
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }

        async function loadAudioFile() {
            const file = document.getElementById('audioFile').files[0];
            if (!file) return;

            stopVisualization();

            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }
            if (!analyser) {
                analyser = audioContext.createAnalyser();
                analyser.fftSize = 2048;
                analyser.smoothingTimeConstant = 0.8;
            }

            const player = document.getElementById('audioPlayer');
            if (activeAudioUrl) {
                URL.revokeObjectURL(activeAudioUrl);
            }
            activeAudioUrl = URL.createObjectURL(file);
            player.src = activeAudioUrl;
            document.getElementById('audioPlayerSection').style.display = 'block';

            if (!playerSource) {
                playerSource = audioContext.createMediaElementSource(player);
                playerSource.connect(analyser);
                analyser.connect(audioContext.destination);
            }

            bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);

            initCanvas();
            visualize();
            player.play();

            showToast('Audio file loaded!');
        }

        async function useMicrophone() {
            try {
                stopVisualization();

                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                
                if (!audioContext) {
                    audioContext = new (window.AudioContext || window.webkitAudioContext)();
                }
                if (audioContext.state === 'suspended') {
                    await audioContext.resume();
                }
                if (!analyser) {
                    analyser = audioContext.createAnalyser();
                    analyser.fftSize = 2048;
                    analyser.smoothingTimeConstant = 0.8;
                }

                micSource = audioContext.createMediaStreamSource(stream);
                micSource.connect(analyser);

                bufferLength = analyser.frequencyBinCount;
                dataArray = new Uint8Array(bufferLength);

                document.getElementById('audioPlayerSection').style.display = 'none';
                document.getElementById('stopBtn').style.display = 'inline-block';

                initCanvas();
                visualize();

                showToast('Microphone active!');
            } catch (error) {
                showToast('Microphone access denied', true);
            }
        }

        function visualize() {
            const vizType = document.getElementById('vizType').value;

            function draw() {
                animationId = requestAnimationFrame(draw);

                if (vizType === 'bars') {
                    drawBars();
                } else if (vizType === 'wave') {
                    drawWaveform();
                } else if (vizType === 'circular') {
                    drawCircular();
                } else if (vizType === 'mirror') {
                    drawMirror();
                }
            }

            draw();
        }

        function drawBars() {
            analyser.getByteFrequencyData(dataArray);

            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height;
                ctx.fillStyle = getColor(i, bufferLength);
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                x += barWidth + 1;
            }
        }

        function drawWaveform() {
            analyser.getByteTimeDomainData(dataArray);

            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.lineWidth = 2;
            ctx.strokeStyle = getColor(0, 1);
            ctx.beginPath();

            const sliceWidth = canvas.width / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * canvas.height / 2;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();
        }

        function drawCircular() {
            analyser.getByteFrequencyData(dataArray);

            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = Math.min(centerX, centerY) - 50;
            const bars = 180;

            for (let i = 0; i < bars; i++) {
                const angle = (i / bars) * Math.PI * 2;
                const barHeight = (dataArray[i] / 255) * 100;

                const x1 = centerX + Math.cos(angle) * radius;
                const y1 = centerY + Math.sin(angle) * radius;
                const x2 = centerX + Math.cos(angle) * (radius + barHeight);
                const y2 = centerY + Math.sin(angle) * (radius + barHeight);

                ctx.strokeStyle = getColor(i, bars);
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
        }

        function drawMirror() {
            analyser.getByteFrequencyData(dataArray);

            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * (canvas.height / 2);
                const color = getColor(i, bufferLength);
                
                ctx.fillStyle = color;
                ctx.fillRect(x, canvas.height / 2 - barHeight, barWidth, barHeight);
                ctx.fillRect(x, canvas.height / 2, barWidth, barHeight);
                
                x += barWidth + 1;
            }
        }

        function getColor(index, total) {
            const scheme = document.getElementById('colorScheme').value;
            
            if (scheme === 'rainbow') {
                const hue = (index / total) * 360;
                return `hsl(${hue}, 100%, 50%)`;
            } else if (scheme === 'orange') {
                return '#f97316';
            } else if (scheme === 'blue') {
                return '#3b82f6';
            } else if (scheme === 'green') {
                return '#10b981';
            } else if (scheme === 'purple') {
                return '#a855f7';
            } else if (scheme === 'red') {
                return '#ef4444';
            }
        }

        function updateSettings() {
            const smoothing = parseFloat(document.getElementById('smoothing').value);
            document.getElementById('smoothingValue').textContent = smoothing;
            
            if (analyser) {
                analyser.smoothingTimeConstant = smoothing;
            }

            if (animationId) {
                cancelAnimationFrame(animationId);
                visualize();
            }
        }

        function stopVisualization() {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }

            if (micSource) {
                if (micSource.mediaStream) {
                    micSource.mediaStream.getTracks().forEach(track => track.stop());
                }
                micSource.disconnect();
                micSource = null;
            }

            const player = document.getElementById('audioPlayer');
            player.pause();
            if (activeAudioUrl) {
                URL.revokeObjectURL(activeAudioUrl);
                activeAudioUrl = null;
            }
            player.src = '';

            document.getElementById('stopBtn').style.display = 'none';

            if (ctx) {
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            showToast('Visualization stopped');
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }

        initCanvas();