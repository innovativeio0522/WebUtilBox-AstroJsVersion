let timeLeft = 0;
        let totalTime = 0;
        let isRunning = false;
        let interval = null;

        function formatTime(seconds) {
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            const s = seconds % 60;
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }

        function updateDisplay() {
            document.getElementById('display').textContent = formatTime(timeLeft);
            
            // Change color based on time left
            const display = document.getElementById('display');
            if (timeLeft <= 10 && timeLeft > 0) {
                display.style.color = '#ef4444';
            } else if (timeLeft === 0) {
                display.style.color = '#10b981';
            } else {
                display.style.color = 'var(--primary)';
            }
        }

        function setTime(h, m, s) {
            if (isRunning) return;
            document.getElementById('hours').value = h;
            document.getElementById('minutes').value = m;
            document.getElementById('seconds').value = s;
            updateFromInputs();
        }

        function updateFromInputs() {
            const h = parseInt(document.getElementById('hours').value) || 0;
            const m = parseInt(document.getElementById('minutes').value) || 0;
            const s = parseInt(document.getElementById('seconds').value) || 0;
            
            timeLeft = h * 3600 + m * 60 + s;
            totalTime = timeLeft;
            updateDisplay();
        }

        function start() {
            if (isRunning) return;
            
            updateFromInputs();
            
            if (timeLeft <= 0) {
                showToast('Please set a time', true);
                return;
            }
            
            isRunning = true;
            document.getElementById('startBtn').style.display = 'none';
            document.getElementById('pauseBtn').style.display = 'inline-block';
            document.getElementById('inputSection').style.opacity = '0.5';
            document.getElementById('inputSection').style.pointerEvents = 'none';
            
            interval = setInterval(() => {
                timeLeft--;
                updateDisplay();
                
                if (timeLeft <= 0) {
                    pause();
                    playSound();
                    showToast('Time\'s up!');
                }
            }, 1000);
        }

        function pause() {
            isRunning = false;
            clearInterval(interval);
            document.getElementById('startBtn').style.display = 'inline-block';
            document.getElementById('pauseBtn').style.display = 'none';
        }

        function reset() {
            pause();
            document.getElementById('inputSection').style.opacity = '1';
            document.getElementById('inputSection').style.pointerEvents = 'auto';
            updateFromInputs();
            showToast('Timer reset');
        }

        function playSound() {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            for (let i = 0; i < 3; i++) {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = 800;
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + i * 0.3);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.3 + 0.2);
                
                oscillator.start(audioContext.currentTime + i * 0.3);
                oscillator.stop(audioContext.currentTime + i * 0.3 + 0.2);
            }
            setTimeout(() => audioContext.close(), 1000);
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }

        // Update display when inputs change
        ['hours', 'minutes', 'seconds'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => {
                if (!isRunning) updateFromInputs();
            });
        });

        updateFromInputs();