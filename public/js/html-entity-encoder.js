let isEncoding = false;
        let isDecoding = false;

        const htmlEntities = {
            '<': '&lt;',
            '>': '&gt;',
            '&': '&amp;',
            '"': '&quot;',
            "'": '&apos;',
            '©': '&copy;',
            '®': '&reg;',
            '™': '&trade;',
            '€': '&euro;',
            '£': '&pound;',
            '¥': '&yen;',
            '¢': '&cent;',
            '§': '&sect;',
            '¶': '&para;',
            '•': '&bull;',
            '…': '&hellip;',
            '–': '&ndash;',
            '—': '&mdash;',
            ' ': '&nbsp;'
        };

        function encodeText() {
            const plain = document.getElementById('plainText').value;
            
            if (!plain) {
                showToast('Enter text to encode', true);
                return;
            }
            
            const encodeAll = document.getElementById('encodeAll').checked;
            const useNumeric = document.getElementById('useNumeric').checked;
            
            let encoded = '';
            let entityCount = 0;
            
            for (let char of plain) {
                if (encodeAll && char.charCodeAt(0) > 127) {
                    encoded += `&#${char.charCodeAt(0)};`;
                    entityCount++;
                } else if (useNumeric && htmlEntities[char]) {
                    encoded += `&#${char.charCodeAt(0)};`;
                    entityCount++;
                } else if (htmlEntities[char]) {
                    encoded += htmlEntities[char];
                    entityCount++;
                } else if (encodeAll) {
                    encoded += `&#${char.charCodeAt(0)};`;
                    entityCount++;
                } else {
                    encoded += char;
                }
            }
            
            document.getElementById('encodedText').value = encoded;
            updateStats(plain, encoded, entityCount);
            showToast('Text encoded to HTML entities');
        }
        
        function decodeText() {
            const encoded = document.getElementById('encodedText').value;
            
            if (!encoded) {
                showToast('Enter HTML entities to decode', true);
                return;
            }
            
            const textarea = document.createElement('textarea');
            textarea.innerHTML = encoded;
            const decoded = textarea.value;
            
            document.getElementById('plainText').value = decoded;
            
            const entityCount = (encoded.match(/&[^;]+;/g) || []).length;
            updateStats(decoded, encoded, entityCount);
            showToast('HTML entities decoded to text');
        }
        
        function autoEncode() {
            if (!document.getElementById('autoMode').checked || isDecoding) return;
            
            isEncoding = true;
            const plain = document.getElementById('plainText').value;
            
            if (plain) {
                const encodeAll = document.getElementById('encodeAll').checked;
                const useNumeric = document.getElementById('useNumeric').checked;
                
                let encoded = '';
                let entityCount = 0;
                
                for (let char of plain) {
                    if (encodeAll && char.charCodeAt(0) > 127) {
                        encoded += `&#${char.charCodeAt(0)};`;
                        entityCount++;
                    } else if (useNumeric && htmlEntities[char]) {
                        encoded += `&#${char.charCodeAt(0)};`;
                        entityCount++;
                    } else if (htmlEntities[char]) {
                        encoded += htmlEntities[char];
                        entityCount++;
                    } else if (encodeAll) {
                        encoded += `&#${char.charCodeAt(0)};`;
                        entityCount++;
                    } else {
                        encoded += char;
                    }
                }
                
                document.getElementById('encodedText').value = encoded;
                updateStats(plain, encoded, entityCount);
            } else {
                document.getElementById('encodedText').value = '';
                document.getElementById('statsBar').style.display = 'none';
            }
            
            setTimeout(() => { isEncoding = false; }, 100);
        }
        
        function autoDecode() {
            if (!document.getElementById('autoMode').checked || isEncoding) return;
            
            isDecoding = true;
            const encoded = document.getElementById('encodedText').value;
            
            if (encoded) {
                const textarea = document.createElement('textarea');
                textarea.innerHTML = encoded;
                const decoded = textarea.value;
                
                document.getElementById('plainText').value = decoded;
                
                const entityCount = (encoded.match(/&[^;]+;/g) || []).length;
                updateStats(decoded, encoded, entityCount);
            } else {
                document.getElementById('plainText').value = '';
                document.getElementById('statsBar').style.display = 'none';
            }
            
            setTimeout(() => { isDecoding = false; }, 100);
        }
        
        function updateStats(plain, encoded, entityCount) {
            document.getElementById('originalChars').textContent = plain.length;
            document.getElementById('encodedChars').textContent = encoded.length;
            document.getElementById('entityCount').textContent = entityCount;
            document.getElementById('statsBar').style.display = 'flex';
        }
        
        function copyPlain() {
            const text = document.getElementById('plainText').value;
            if (!text) {
                showToast('Nothing to copy', true);
                return;
            }
            navigator.clipboard.writeText(text).then(() => {
                showToast('Plain text copied!');
            });
        }
        
        function copyEncoded() {
            const text = document.getElementById('encodedText').value;
            if (!text) {
                showToast('Nothing to copy', true);
                return;
            }
            navigator.clipboard.writeText(text).then(() => {
                showToast('HTML entities copied!');
            });
        }
        
        function clearPlain() {
            document.getElementById('plainText').value = '';
            if (document.getElementById('autoMode').checked) {
                document.getElementById('encodedText').value = '';
                document.getElementById('statsBar').style.display = 'none';
            }
            showToast('Cleared');
        }
        
        function clearEncoded() {
            document.getElementById('encodedText').value = '';
            if (document.getElementById('autoMode').checked) {
                document.getElementById('plainText').value = '';
                document.getElementById('statsBar').style.display = 'none';
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