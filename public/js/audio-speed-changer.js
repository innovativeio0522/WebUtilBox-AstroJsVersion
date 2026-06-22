let audioContext;
        let audioBuffer;
        let fileName = '';
        let originalDuration = 0;
        let activeAudioUrl = null;

        async function loadAudio() {
            const file = document.getElementById('audioFile').files[0];
            if (!file) return;

            fileName = file.name.split('.')[0];
            const arrayBuffer = await file.arrayBuffer();
            
            // Close old AudioContext to prevent context limits throttling
            if (audioContext) {
                try {
                    await audioContext.close();
                } catch (e) {
                    console.error('Error closing AudioContext', e);
                }
            }
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

            const player = document.getElementById('audioPlayer');
            
            // Revoke old player Object URL to prevent memory leaks
            if (activeAudioUrl) {
                URL.revokeObjectURL(activeAudioUrl);
            }
            activeAudioUrl = URL.createObjectURL(file);
            player.src = activeAudioUrl;
            player.preservesPitch = true;

            originalDuration = audioBuffer.duration;
            updateDurationInfo();

            document.getElementById('controls').style.display = 'block';
            showToast('Audio loaded successfully!');
        }

        function changeSpeed() {
            const speed = parseFloat(document.getElementById('speedSlider').value);
            document.getElementById('speedValue').textContent = speed.toFixed(2) + 'x';
            
            const player = document.getElementById('audioPlayer');
            player.playbackRate = speed;
            
            updateDurationInfo();
        }

        function setSpeed(speed) {
            document.getElementById('speedSlider').value = speed;
            changeSpeed();
        }

        function togglePitch() {
            const player = document.getElementById('audioPlayer');
            player.preservesPitch = document.getElementById('preservePitch').checked;
        }

        function updateDurationInfo() {
            const speed = parseFloat(document.getElementById('speedSlider').value);
            const newDur = originalDuration / speed;
            const diff = Math.abs(originalDuration - newDur);

            document.getElementById('originalDuration').textContent = formatTime(originalDuration);
            document.getElementById('newDuration').textContent = formatTime(newDur);
            
            const diffText = formatTime(diff);
            const prefix = speed > 1 ? '-' : '+';
            document.getElementById('timeDiff').textContent = prefix + diffText;
            document.getElementById('timeDiff').style.color = speed > 1 ? '#10b981' : '#ef4444';
        }

        function formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        }

        async function downloadAudio() {
            const speed = parseFloat(document.getElementById('speedSlider').value);
            
            if (speed === 1) {
                showToast('Speed is already 1x. No changes needed.', true);
                return;
            }

            showToast('Processing audio... This may take a moment.');

            const offlineContext = new OfflineAudioContext(
                audioBuffer.numberOfChannels,
                audioBuffer.length / speed,
                audioBuffer.sampleRate
            );

            const source = offlineContext.createBufferSource();
            source.buffer = audioBuffer;
            source.playbackRate.value = speed;
            source.connect(offlineContext.destination);
            source.start();

            const renderedBuffer = await offlineContext.startRendering();
            const wav = audioBufferToWav(renderedBuffer);
            const blob = new Blob([wav], { type: 'audio/wav' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileName}_${speed}x.wav`;
            a.click();
            URL.revokeObjectURL(url);

            showToast('Audio downloaded successfully!');
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