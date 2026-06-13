let audioContext;
        let isPlaying = false;
        let bpm = 120;
        let beatsPerMeasure = 4;
        let currentBeat = 0;
        let nextNoteTime = 0;
        let scheduleAheadTime = 0.1;
        let timerID;
        let volume = 0.5;
        let tapTimes = [];

        function initAudio() {
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
        }

        function start() {
            if (isPlaying) return;
            
            initAudio();
            isPlaying = true;
            currentBeat = 0;
            nextNoteTime = audioContext.currentTime;
            
            scheduler();
            
            document.getElementById('startBtn').style.display = 'none';
            document.getElementById('stopBtn').style.display = 'inline-block';
            showToast('Metronome started');
        }

        function stop() {
            isPlaying = false;
            clearTimeout(timerID);
            
            document.getElementById('startBtn').style.display = 'inline-block';
            document.getElementById('stopBtn').style.display = 'none';
            document.getElementById('beatIndicator').classList.remove('beat-active', 'beat-accent');
            showToast('Metronome stopped');
        }

        function scheduler() {
            while (nextNoteTime < audioContext.currentTime + scheduleAheadTime) {
                scheduleNote(currentBeat, nextNoteTime);
                nextNote();
            }
            timerID = setTimeout(scheduler, 25);
        }

        function scheduleNote(beatNumber, time) {
            const osc = audioContext.createOscillator();
            const envelope = audioContext.createGain();

            osc.frequency.value = beatNumber % beatsPerMeasure === 0 ? 1000 : 800;
            envelope.gain.value = volume;
            envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

            osc.connect(envelope);
            envelope.connect(audioContext.destination);

            osc.start(time);
            osc.stop(time + 0.1);

            setTimeout(() => {
                visualBeat(beatNumber);
            }, (time - audioContext.currentTime) * 1000);
        }

        function nextNote() {
            const secondsPerBeat = 60.0 / bpm;
            nextNoteTime += secondsPerBeat;
            currentBeat = (currentBeat + 1) % beatsPerMeasure;
        }

        function visualBeat(beatNumber) {
            const indicator = document.getElementById('beatIndicator');
            const beatNum = document.getElementById('beatNumber');
            
            indicator.classList.remove('beat-active', 'beat-accent');
            
            setTimeout(() => {
                indicator.classList.add('beat-active');
                if (beatNumber % beatsPerMeasure === 0) {
                    indicator.classList.add('beat-accent');
                }
                beatNum.textContent = (beatNumber % beatsPerMeasure) + 1;
            }, 10);

            setTimeout(() => {
                indicator.classList.remove('beat-active', 'beat-accent');
            }, 100);
        }

        function updateBPM() {
            bpm = parseInt(document.getElementById('bpmSlider').value);
            document.getElementById('bpmDisplay').textContent = bpm;
            document.getElementById('bpmInput').value = bpm;
        }

        function updateBPMFromInput() {
            let value = parseInt(document.getElementById('bpmInput').value);
            if (value < 40) value = 40;
            if (value > 240) value = 240;
            bpm = value;
            document.getElementById('bpmSlider').value = bpm;
            document.getElementById('bpmDisplay').textContent = bpm;
        }

        function setBPM(value) {
            bpm = value;
            document.getElementById('bpmSlider').value = bpm;
            document.getElementById('bpmInput').value = bpm;
            document.getElementById('bpmDisplay').textContent = bpm;
        }

        function updateTimeSignature() {
            beatsPerMeasure = parseInt(document.getElementById('timeSignature').value);
            currentBeat = 0;
        }

        function updateVolume() {
            const vol = parseInt(document.getElementById('volume').value);
            volume = vol / 100;
            document.getElementById('volumeValue').textContent = vol;
        }

        function tapTempo() {
            const now = Date.now();
            tapTimes.push(now);

            if (tapTimes.length > 1) {
                tapTimes = tapTimes.filter(time => now - time < 3000);
                
                if (tapTimes.length >= 2) {
                    const intervals = [];
                    for (let i = 1; i < tapTimes.length; i++) {
                        intervals.push(tapTimes[i] - tapTimes[i - 1]);
                    }
                    const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
                    const calculatedBPM = Math.round(60000 / avgInterval);
                    
                    if (calculatedBPM >= 40 && calculatedBPM <= 240) {
                        setBPM(calculatedBPM);
                        showToast(`Tempo set to ${calculatedBPM} BPM`);
                    }
                }
            }

            const indicator = document.getElementById('beatIndicator');
            indicator.classList.add('beat-active');
            setTimeout(() => indicator.classList.remove('beat-active'), 100);
        }

        function showToast(message) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show';
            setTimeout(() => toast.classList.remove('show'), 3000);
        }