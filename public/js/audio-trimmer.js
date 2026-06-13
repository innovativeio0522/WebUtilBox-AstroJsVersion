let audioContext;
        let audioBuffer;
        let sourceNode;
        let fileName = '';

        async function loadAudio() {
            const file = document.getElementById('audioFile').files[0];
            if (!file) return;

            fileName = file.name.split('.')[0];
            const arrayBuffer = await file.arrayBuffer();
            
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

            const player = document.getElementById('audioPlayer');
            player.src = URL.createObjectURL(file);

            document.getElementById('endTime').value = audioBuffer.duration.toFixed(2);
            document.getElementById('endTime').max = audioBuffer.duration;
            document.getElementById('startTime').max = audioBuffer.duration;

            drawWaveform();
            updateSelection();
            document.getElementById('audioControls').style.display = 'block';
            showToast('Audio loaded successfully!');
        }

        function drawWaveform() {
            const canvas = document.getElementById('waveform');
            const ctx = canvas.getContext('2d');
            const width = canvas.width = canvas.offsetWidth;
            const height = canvas.height = canvas.offsetHeight;

            const data = audioBuffer.getChannelData(0);
            const step = Math.ceil(data.length / width);
            const amp = height / 2;

            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, width, height);

            ctx.strokeStyle = '#f97316';
            ctx.lineWidth = 1;
            ctx.beginPath();

            for (let i = 0; i < width; i++) {
                let min = 1.0;
                let max = -1.0;
                for (let j = 0; j < step; j++) {
                    const datum = data[(i * step) + j];
                    if (datum < min) min = datum;
                    if (datum > max) max = datum;
                }
                ctx.moveTo(i, (1 + min) * amp);
                ctx.lineTo(i, (1 + max) * amp);
            }
            ctx.stroke();
        }

        function updateSelection() {
            const start = parseFloat(document.getElementById('startTime').value) || 0;
            const end = parseFloat(document.getElementById('endTime').value) || audioBuffer.duration;
            const duration = (end - start).toFixed(2);

            document.getElementById('durationInfo').textContent = 
                `Trimmed duration: ${duration}s (from ${start.toFixed(2)}s to ${end.toFixed(2)}s)`;
        }

        function previewTrimmed() {
            const start = parseFloat(document.getElementById('startTime').value) || 0;
            const player = document.getElementById('audioPlayer');
            player.currentTime = start;
            player.play();

            const end = parseFloat(document.getElementById('endTime').value);
            const checkTime = setInterval(() => {
                if (player.currentTime >= end) {
                    player.pause();
                    clearInterval(checkTime);
                }
            }, 100);
        }

        async function downloadTrimmed() {
            const start = parseFloat(document.getElementById('startTime').value) || 0;
            const end = parseFloat(document.getElementById('endTime').value) || audioBuffer.duration;

            if (start >= end) {
                showToast('Start time must be less than end time', true);
                return;
            }

            const startOffset = Math.floor(start * audioBuffer.sampleRate);
            const endOffset = Math.floor(end * audioBuffer.sampleRate);
            const frameCount = endOffset - startOffset;

            const trimmedBuffer = audioContext.createBuffer(
                audioBuffer.numberOfChannels,
                frameCount,
                audioBuffer.sampleRate
            );

            for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
                const sourceData = audioBuffer.getChannelData(channel);
                const trimmedData = trimmedBuffer.getChannelData(channel);
                for (let i = 0; i < frameCount; i++) {
                    trimmedData[i] = sourceData[startOffset + i];
                }
            }

            const wav = audioBufferToWav(trimmedBuffer);
            const blob = new Blob([wav], { type: 'audio/wav' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileName}_trimmed.wav`;
            a.click();

            showToast('Audio trimmed and downloaded!');
        }

        function audioBufferToWav(buffer) {
            const length = buffer.length * buffer.numberOfChannels * 2 + 44;
            const arrayBuffer = new ArrayBuffer(length);
            const view = new DataView(arrayBuffer);
            const channels = [];
            let offset = 0;
            let pos = 0;

            function setUint16(data) {
                view.setUint16(pos, data, true);
                pos += 2;
            }

            function setUint32(data) {
                view.setUint32(pos, data, true);
                pos += 4;
            }

            setUint32(0x46464952);
            setUint32(length - 8);
            setUint32(0x45564157);
            setUint32(0x20746d66);
            setUint32(16);
            setUint16(1);
            setUint16(buffer.numberOfChannels);
            setUint32(buffer.sampleRate);
            setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels);
            setUint16(buffer.numberOfChannels * 2);
            setUint16(16);
            setUint32(0x61746164);
            setUint32(length - pos - 4);

            for (let i = 0; i < buffer.numberOfChannels; i++) {
                channels.push(buffer.getChannelData(i));
            }

            while (pos < length) {
                for (let i = 0; i < buffer.numberOfChannels; i++) {
                    let sample = Math.max(-1, Math.min(1, channels[i][offset]));
                    sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
                    view.setInt16(pos, sample, true);
                    pos += 2;
                }
                offset++;
            }

            return arrayBuffer;
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }