const morseCode = {
            'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
            'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
            'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
            'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
            'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
            '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
            '8': '---..', '9': '----.', '.': '.-.-.-', ',': '--..--', '?': '..--..',
            "'": '.----.', '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-',
            '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.',
            '-': '-....-', '_': '..--.-', '"': '.-..-.', '$': '...-..-', '@': '.--.-.',
            ' ': '/'
        };

        const reverseMorse = Object.fromEntries(
            Object.entries(morseCode).map(([k, v]) => [v, k])
        );

        let audioContext;
        let isConverting = false;

        function textToMorse() {
            if (isConverting) return;
            isConverting = true;

            const text = document.getElementById('textInput').value.toUpperCase();
            const morse = text.split('').map(char => morseCode[char] || '').join(' ');
            document.getElementById('morseOutput').value = morse;

            setTimeout(() => { isConverting = false; }, 100);
        }

        function morseToText() {
            if (isConverting) return;
            isConverting = true;

            const morse = document.getElementById('morseOutput').value;
            const words = morse.split(' / ');
            const text = words.map(word => {
                return word.split(' ').map(code => reverseMorse[code] || '').join('');
            }).join(' ');
            
            document.getElementById('textInput').value = text;

            setTimeout(() => { isConverting = false; }, 100);
        }

        async function playMorse() {
            const morse = document.getElementById('morseOutput').value;
            if (!morse) return showToast('No Morse code to play', true);

            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            const dotDuration = 100; // ms
            const dashDuration = dotDuration * 3;
            const gapDuration = dotDuration;
            const letterGap = dotDuration * 3;
            const wordGap = dotDuration * 7;

            let currentTime = audioContext.currentTime;

            for (const char of morse) {
                if (char === '.') {
                    playBeep(currentTime, dotDuration);
                    currentTime += (dotDuration + gapDuration) / 1000;
                } else if (char === '-') {
                    playBeep(currentTime, dashDuration);
                    currentTime += (dashDuration + gapDuration) / 1000;
                } else if (char === ' ') {
                    currentTime += letterGap / 1000;
                } else if (char === '/') {
                    currentTime += wordGap / 1000;
                }
            }

            showToast('Playing Morse code...');
        }

        function playBeep(startTime, duration) {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 600; // Hz
            gainNode.gain.setValueAtTime(0.3, startTime);
            gainNode.gain.setValueAtTime(0, startTime + duration / 1000);

            oscillator.start(startTime);
            oscillator.stop(startTime + duration / 1000);
        }

        function copyText() {
            const text = document.getElementById('textInput').value;
            if (!text) return showToast('Nothing to copy', true);
            navigator.clipboard.writeText(text).then(() => showToast('Text copied!'));
        }

        function copyMorse() {
            const morse = document.getElementById('morseOutput').value;
            if (!morse) return showToast('Nothing to copy', true);
            navigator.clipboard.writeText(morse).then(() => showToast('Morse code copied!'));
        }

        function clearAll() {
            document.getElementById('textInput').value = '';
            document.getElementById('morseOutput').value = '';
            showToast('Cleared');
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }

        // Generate reference table
        function generateReference() {
            const ref = document.getElementById('morseReference');
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            
            for (const char of chars) {
                const div = document.createElement('div');
                div.style.padding = '8px';
                div.style.background = 'var(--dark)';
                div.style.borderRadius = '6px';
                div.style.textAlign = 'center';
                div.innerHTML = `<strong>${char}</strong><br>${morseCode[char]}`;
                ref.appendChild(div);
            }
        }

        generateReference();