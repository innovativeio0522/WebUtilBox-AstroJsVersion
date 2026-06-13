let startTime = 0;
        let elapsedTime = 0;
        let timerInterval = null;
        let isRunning = false;
        let lapCount = 0;
        let lastLapTime = 0;

        function formatTime(ms) {
            const hours = Math.floor(ms / 3600000);
            const minutes = Math.floor((ms % 3600000) / 60000);
            const seconds = Math.floor((ms % 60000) / 1000);
            const milliseconds = ms % 1000;

            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
        }

        function updateDisplay() {
            const currentTime = Date.now();
            elapsedTime = currentTime - startTime;
            document.getElementById('display').textContent = formatTime(elapsedTime);
        }

        function start() {
            if (isRunning) return;
            
            isRunning = true;
            startTime = Date.now() - elapsedTime;
            timerInterval = setInterval(updateDisplay, 10);
            
            document.getElementById('startBtn').style.display = 'none';
            document.getElementById('stopBtn').style.display = 'inline-block';
            document.getElementById('lapBtn').style.display = 'inline-block';
        }

        function stop() {
            if (!isRunning) return;
            
            isRunning = false;
            clearInterval(timerInterval);
            
            document.getElementById('startBtn').style.display = 'inline-block';
            document.getElementById('stopBtn').style.display = 'none';
            document.getElementById('lapBtn').style.display = 'none';
        }

        function reset() {
            stop();
            elapsedTime = 0;
            lapCount = 0;
            lastLapTime = 0;
            document.getElementById('display').textContent = '00:00:00.000';
            document.getElementById('lapsBody').innerHTML = '';
            document.getElementById('lapsContainer').style.display = 'none';
            showToast('Stopwatch reset');
        }

        function lap() {
            if (!isRunning) return;
            
            lapCount++;
            const currentTime = elapsedTime;
            const lapTime = currentTime - lastLapTime;
            lastLapTime = currentTime;
            
            const tbody = document.getElementById('lapsBody');
            const row = tbody.insertRow(0);
            
            row.innerHTML = `
                <td style="padding: 8px;">#${lapCount}</td>
                <td style="padding: 8px; text-align: right; color: var(--primary);">${formatTime(lapTime)}</td>
                <td style="padding: 8px; text-align: right;">${formatTime(currentTime)}</td>
            `;
            
            document.getElementById('lapsContainer').style.display = 'block';
            showToast(`Lap ${lapCount} recorded`);
        }

        function clearLaps() {
            document.getElementById('lapsBody').innerHTML = '';
            document.getElementById('lapsContainer').style.display = 'none';
            lapCount = 0;
            lastLapTime = 0;
            showToast('Laps cleared');
        }

        function showToast(message) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show';
            setTimeout(() => toast.classList.remove('show'), 2000);
        }