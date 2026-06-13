let isEncoding = false;
        let isDecoding = false;
        let currentMode = 'base64';

        function switchMode(mode) {
            currentMode = mode;
            document.querySelectorAll('.mode-tab').forEach(tab => tab.classList.remove('active'));
            document.getElementById(mode + 'Tab').classList.add('active');
            
            document.getElementById('base64Mode').style.display = mode === 'base64' ? 'block' : 'none';
            document.getElementById('urlMode').style.display = mode === 'url' ? 'block' : 'none';
        }

        // ===== BASE64 MODE =====

        function encodeText() {
            const plain = document.getElementById('plainText').value;
            
            if (!plain) {
                showToast('Enter text to encode', true);
                return;
            }
            
            try {
                const encoded = btoa(unescape(encodeURIComponent(plain)));
                document.getElementById('base64Text').value = encoded;
                updateStats(plain, encoded);
                showToast('Text encoded to Base64');
            } catch (e) {
                showToast('Encoding failed', true);
            }
        }
        
        function decodeText() {
            const base64 = document.getElementById('base64Text').value;
            
            if (!base64) {
                showToast('Enter Base64 to decode', true);
                return;
            }
            
            try {
                const decoded = decodeURIComponent(escape(atob(base64)));
                document.getElementById('plainText').value = decoded;
                updateStats(decoded, base64);
                showToast('Base64 decoded to text');
            } catch (e) {
                showToast('Invalid Base64 string', true);
            }
        }
        
        function autoEncode() {
            if (!document.getElementById('autoMode').checked || isDecoding) return;
            
            isEncoding = true;
            const plain = document.getElementById('plainText').value;
            
            if (plain) {
                try {
                    const encoded = btoa(unescape(encodeURIComponent(plain)));
                    document.getElementById('base64Text').value = encoded;
                    updateStats(plain, encoded);
                } catch (e) {}
            } else {
                document.getElementById('base64Text').value = '';
                document.getElementById('statsBar').style.display = 'none';
            }
            
            setTimeout(() => { isEncoding = false; }, 100);
        }
        
        function autoDecode() {
            if (!document.getElementById('autoMode').checked || isEncoding) return;
            
            isDecoding = true;
            const base64 = document.getElementById('base64Text').value;
            
            if (base64) {
                try {
                    const decoded = decodeURIComponent(escape(atob(base64)));
                    document.getElementById('plainText').value = decoded;
                    updateStats(decoded, base64);
                } catch (e) {}
            } else {
                document.getElementById('plainText').value = '';
                document.getElementById('statsBar').style.display = 'none';
            }
            
            setTimeout(() => { isDecoding = false; }, 100);
        }
        
        function updateStats(plain, encoded) {
            const originalBytes = new Blob([plain]).size;
            const encodedBytes = new Blob([encoded]).size;
            const ratio = originalBytes > 0 ? ((encodedBytes / originalBytes) * 100).toFixed(1) : 0;
            
            document.getElementById('originalSize').textContent = originalBytes;
            document.getElementById('encodedSize').textContent = encodedBytes;
            document.getElementById('sizeRatio').textContent = ratio + '%';
            document.getElementById('statsBar').style.display = 'flex';
        }
        
        function copyPlain() {
            const text = document.getElementById('plainText').value;
            if (!text) return showToast('Nothing to copy', true);
            navigator.clipboard.writeText(text).then(() => showToast('Plain text copied!'));
        }
        
        function copyBase64() {
            const text = document.getElementById('base64Text').value;
            if (!text) return showToast('Nothing to copy', true);
            navigator.clipboard.writeText(text).then(() => showToast('Base64 copied!'));
        }
        
        function clearPlain() {
            document.getElementById('plainText').value = '';
            if (document.getElementById('autoMode').checked) {
                document.getElementById('base64Text').value = '';
                document.getElementById('statsBar').style.display = 'none';
            }
            showToast('Cleared');
        }
        
        function clearBase64() {
            document.getElementById('base64Text').value = '';
            if (document.getElementById('autoMode').checked) {
                document.getElementById('plainText').value = '';
                document.getElementById('statsBar').style.display = 'none';
            }
            showToast('Cleared');
        }

        // ===== URL ENCODING MODE =====

        function encodeURL() {
            const plain = document.getElementById('urlPlainText').value;
            
            if (!plain) {
                showToast('Enter text to encode', true);
                return;
            }
            
            try {
                const encoded = encodeURIComponent(plain);
                document.getElementById('urlEncodedText').value = encoded;
                showToast('Text URL encoded');
            } catch (e) {
                showToast('Encoding failed', true);
            }
        }
        
        function decodeURL() {
            const encoded = document.getElementById('urlEncodedText').value;
            
            if (!encoded) {
                showToast('Enter URL encoded text to decode', true);
                return;
            }
            
            try {
                const decoded = decodeURIComponent(encoded);
                document.getElementById('urlPlainText').value = decoded;
                showToast('URL decoded to text');
            } catch (e) {
                showToast('Invalid URL encoded string', true);
            }
        }
        
        function autoEncodeURL() {
            if (!document.getElementById('urlAutoMode').checked || isDecoding) return;
            
            isEncoding = true;
            const plain = document.getElementById('urlPlainText').value;
            
            if (plain) {
                try {
                    const encoded = encodeURIComponent(plain);
                    document.getElementById('urlEncodedText').value = encoded;
                } catch (e) {}
            } else {
                document.getElementById('urlEncodedText').value = '';
            }
            
            setTimeout(() => { isEncoding = false; }, 100);
        }
        
        function autoDecodeURL() {
            if (!document.getElementById('urlAutoMode').checked || isEncoding) return;
            
            isDecoding = true;
            const encoded = document.getElementById('urlEncodedText').value;
            
            if (encoded) {
                try {
                    const decoded = decodeURIComponent(encoded);
                    document.getElementById('urlPlainText').value = decoded;
                } catch (e) {}
            } else {
                document.getElementById('urlPlainText').value = '';
            }
            
            setTimeout(() => { isDecoding = false; }, 100);
        }
        
        function copyURLPlain() {
            const text = document.getElementById('urlPlainText').value;
            if (!text) return showToast('Nothing to copy', true);
            navigator.clipboard.writeText(text).then(() => showToast('Plain text copied!'));
        }
        
        function copyURLEncoded() {
            const text = document.getElementById('urlEncodedText').value;
            if (!text) return showToast('Nothing to copy', true);
            navigator.clipboard.writeText(text).then(() => showToast('URL encoded text copied!'));
        }
        
        function clearURLPlain() {
            document.getElementById('urlPlainText').value = '';
            if (document.getElementById('urlAutoMode').checked) {
                document.getElementById('urlEncodedText').value = '';
            }
            showToast('Cleared');
        }
        
        function clearURLEncoded() {
            document.getElementById('urlEncodedText').value = '';
            if (document.getElementById('urlAutoMode').checked) {
                document.getElementById('urlPlainText').value = '';
            }
            showToast('Cleared');
        }
        
        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }