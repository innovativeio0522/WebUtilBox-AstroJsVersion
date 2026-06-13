let isConverting = false;

        function convertFromText() {
            if (isConverting) return;
            const text = document.getElementById('textInput').value;
            if (!text) {
                clearOutputs();
                return;
            }

            // Binary
            const binary = text.split('').map(char => 
                char.charCodeAt(0).toString(2).padStart(8, '0')
            ).join(' ');
            document.getElementById('binaryOutput').value = binary;

            // Hexadecimal
            const hex = text.split('').map(char => 
                char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')
            ).join(' ');
            document.getElementById('hexOutput').value = hex;

            // Octal
            const octal = text.split('').map(char => 
                char.charCodeAt(0).toString(8).padStart(3, '0')
            ).join(' ');
            document.getElementById('octalOutput').value = octal;

            // Decimal
            const decimal = text.split('').map(char => 
                char.charCodeAt(0)
            ).join(' ');
            document.getElementById('decimalOutput').value = decimal;
        }

        function convertFromBinary() {
            isConverting = true;
            const binary = document.getElementById('binaryOutput').value;
            if (!binary.trim()) {
                showToast('No binary data to decode', true);
                isConverting = false;
                return;
            }

            try {
                const text = binary.split(' ').map(bin => 
                    String.fromCharCode(parseInt(bin, 2))
                ).join('');
                document.getElementById('textInput').value = text;
                convertFromText();
                showToast('Binary decoded!');
            } catch (e) {
                showToast('Invalid binary format', true);
            }
            isConverting = false;
        }

        function convertFromHex() {
            isConverting = true;
            const hex = document.getElementById('hexOutput').value;
            if (!hex.trim()) {
                showToast('No hex data to decode', true);
                isConverting = false;
                return;
            }

            try {
                const text = hex.split(' ').map(h => 
                    String.fromCharCode(parseInt(h, 16))
                ).join('');
                document.getElementById('textInput').value = text;
                convertFromText();
                showToast('Hex decoded!');
            } catch (e) {
                showToast('Invalid hex format', true);
            }
            isConverting = false;
        }

        function convertFromOctal() {
            isConverting = true;
            const octal = document.getElementById('octalOutput').value;
            if (!octal.trim()) {
                showToast('No octal data to decode', true);
                isConverting = false;
                return;
            }

            try {
                const text = octal.split(' ').map(oct => 
                    String.fromCharCode(parseInt(oct, 8))
                ).join('');
                document.getElementById('textInput').value = text;
                convertFromText();
                showToast('Octal decoded!');
            } catch (e) {
                showToast('Invalid octal format', true);
            }
            isConverting = false;
        }

        function convertFromDecimal() {
            isConverting = true;
            const decimal = document.getElementById('decimalOutput').value;
            if (!decimal.trim()) {
                showToast('No decimal data to decode', true);
                isConverting = false;
                return;
            }

            try {
                const text = decimal.split(' ').map(dec => 
                    String.fromCharCode(parseInt(dec, 10))
                ).join('');
                document.getElementById('textInput').value = text;
                convertFromText();
                showToast('Decimal decoded!');
            } catch (e) {
                showToast('Invalid decimal format', true);
            }
            isConverting = false;
        }

        function copyBinary() {
            copyToClipboard('binaryOutput', 'Binary');
        }

        function copyHex() {
            copyToClipboard('hexOutput', 'Hex');
        }

        function copyOctal() {
            copyToClipboard('octalOutput', 'Octal');
        }

        function copyDecimal() {
            copyToClipboard('decimalOutput', 'Decimal');
        }

        function copyToClipboard(elementId, name) {
            const text = document.getElementById(elementId).value;
            if (!text) return showToast('Nothing to copy', true);
            navigator.clipboard.writeText(text).then(() => showToast(name + ' copied!'));
        }

        function clearOutputs() {
            document.getElementById('binaryOutput').value = '';
            document.getElementById('hexOutput').value = '';
            document.getElementById('octalOutput').value = '';
            document.getElementById('decimalOutput').value = '';
        }

        function clearAll() {
            document.getElementById('textInput').value = '';
            clearOutputs();
            showToast('Cleared');
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }