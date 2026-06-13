function updateCurrentTimestamp() {
            const now = Math.floor(Date.now() / 1000);
            document.getElementById('currentTimestamp').textContent = now;
            document.getElementById('currentDate').textContent = new Date().toLocaleString();
        }

        function convertTimestamp() {
            const timestamp = parseInt(document.getElementById('timestampInput').value);
            
            if (!timestamp || isNaN(timestamp)) {
                clearTimestampOutput();
                return;
            }
            
            const date = new Date(timestamp * 1000);
            
            document.getElementById('convertedDate').textContent = date.toLocaleString();
            document.getElementById('dateOnly').textContent = date.toLocaleDateString();
            document.getElementById('timeOnly').textContent = date.toLocaleTimeString();
            document.getElementById('utcTime').textContent = date.toUTCString();
            document.getElementById('isoTime').textContent = date.toISOString();
        }

        function clearTimestampOutput() {
            document.getElementById('convertedDate').textContent = '-';
            document.getElementById('dateOnly').textContent = '-';
            document.getElementById('timeOnly').textContent = '-';
            document.getElementById('utcTime').textContent = '-';
            document.getElementById('isoTime').textContent = '-';
        }

        function convertDate() {
            const dateInput = document.getElementById('dateInput').value;
            
            if (!dateInput) {
                document.getElementById('convertedTimestamp').textContent = '-';
                return;
            }
            
            const timestamp = Math.floor(new Date(dateInput).getTime() / 1000);
            document.getElementById('convertedTimestamp').textContent = timestamp;
        }

        function useNow() {
            const now = Math.floor(Date.now() / 1000);
            document.getElementById('timestampInput').value = now;
            convertTimestamp();
            showToast('Current timestamp loaded');
        }

        function copyTimestamp() {
            const timestamp = document.getElementById('convertedTimestamp').textContent;
            if (timestamp === '-') return;
            
            navigator.clipboard.writeText(timestamp).then(() => {
                showToast('Timestamp copied!');
            });
        }

        function showToast(message) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show';
            setTimeout(() => toast.classList.remove('show'), 3000);
        }

        // Update current timestamp every second
        updateCurrentTimestamp();
        setInterval(updateCurrentTimestamp, 1000);