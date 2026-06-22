let timeLeft = 25 * 60; // seconds
        let isRunning = false;
        let interval = null;
        let currentSession = 1;
        let sessionType = 'focus'; // focus, shortBreak, longBreak
        let completedSessions = 0;

        function updateDisplay() {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            document.getElementById('timerDisplay').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            // Update session type
            if (sessionType === 'focus') {
                document.getElementById('sessionType').textContent = 'Focus Session';
                document.getElementById('timerDisplay').style.color = 'var(--primary)';
            } else if (sessionType === 'shortBreak') {
                document.getElementById('sessionType').textContent = 'Short Break';
                document.getElementById('timerDisplay').style.color = '#10b981';
            } else {
                document.getElementById('sessionType').textContent = 'Long Break';
                document.getElementById('timerDisplay').style.color = '#3b82f6';
            }
            
            document.getElementById('sessionCount').textContent = `Session ${currentSession} of 4`;
            
            // Update progress dots
            for (let i = 1; i <= 4; i++) {
                const dot = document.getElementById(`progress${i}`);
                if (i <= completedSessions) {
                    dot.classList.add('completed');
                } else {
                    dot.classList.remove('completed');
                }
            }
        }

        function startTimer() {
            if (isRunning) return;
            
            isRunning = true;
            document.getElementById('startBtn').style.display = 'none';
            document.getElementById('pauseBtn').style.display = 'inline-block';
            
            interval = setInterval(() => {
                timeLeft--;
                updateDisplay();
                
                if (timeLeft <= 0) {
                    playSound();
                    nextSession();
                }
            }, 1000);
        }

        function pauseTimer() {
            isRunning = false;
            clearInterval(interval);
            document.getElementById('startBtn').style.display = 'inline-block';
            document.getElementById('pauseBtn').style.display = 'none';
        }

        function resetTimer() {
            pauseTimer();
            sessionType = 'focus';
            currentSession = 1;
            completedSessions = 0;
            timeLeft = parseInt(document.getElementById('focusDuration').value) * 60;
            updateDisplay();
            showToast('Timer reset');
        }

        function nextSession() {
            pauseTimer();
            
            if (sessionType === 'focus') {
                completedSessions++;
                
                if (completedSessions >= 4) {
                    sessionType = 'longBreak';
                    timeLeft = parseInt(document.getElementById('longBreak').value) * 60;
                    completedSessions = 0;
                    currentSession = 1;
                    showToast('Great work! Take a long break!');
                } else {
                    sessionType = 'shortBreak';
                    timeLeft = parseInt(document.getElementById('shortBreak').value) * 60;
                    currentSession++;
                    showToast('Focus session complete! Take a short break.');
                }
            } else {
                sessionType = 'focus';
                timeLeft = parseInt(document.getElementById('focusDuration').value) * 60;
                showToast('Break over! Time to focus.');
            }
            
            updateDisplay();
            
            if (document.getElementById('autoStart').checked) {
                setTimeout(startTimer, 2000);
            }
        }

        function playSound() {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
            
            setTimeout(() => audioContext.close(), 1000);
        }

        function showToast(message) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show';
            setTimeout(() => toast.classList.remove('show'), 3000);
        }

        updateDisplay();