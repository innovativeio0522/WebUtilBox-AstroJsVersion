// Simple AES-like encryption using Web Crypto API
        async function deriveKey(password, salt) {
            const encoder = new TextEncoder();
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                encoder.encode(password),
                'PBKDF2',
                false,
                ['deriveBits', 'deriveKey']
            );
            
            return crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                false,
                ['encrypt', 'decrypt']
            );
        }

        function togglePassword() {
            const input = document.getElementById('passwordInput');
            const btn = document.getElementById('toggleBtn');
            if (input.type === 'password') {
                input.type = 'text';
                btn.textContent = '🙈';
            } else {
                input.type = 'password';
                btn.textContent = '👁️';
            }
        }

        async function encryptText() {
            const password = document.getElementById('passwordInput').value;
            const plainText = document.getElementById('plainText').value;
            
            if (!password) {
                showToast('Enter a password first', true);
                return;
            }
            
            if (!plainText) {
                showToast('Enter text to encrypt', true);
                return;
            }
            
            try {
                const encoder = new TextEncoder();
                const salt = crypto.getRandomValues(new Uint8Array(16));
                const iv = crypto.getRandomValues(new Uint8Array(12));
                
                const key = await deriveKey(password, salt);
                
                const encrypted = await crypto.subtle.encrypt(
                    { name: 'AES-GCM', iv: iv },
                    key,
                    encoder.encode(plainText)
                );
                
                // Combine salt + iv + encrypted data
                const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
                combined.set(salt, 0);
                combined.set(iv, salt.length);
                combined.set(new Uint8Array(encrypted), salt.length + iv.length);
                
                // Convert to Base64
                const base64 = btoa(String.fromCharCode(...combined));
                
                document.getElementById('encryptedText').value = base64;
                updateStats(plainText, base64);
                showToast('Text encrypted successfully!');
                
            } catch (e) {
                showToast('Encryption failed', true);
            }
        }

        async function decryptText() {
            const password = document.getElementById('passwordInput').value;
            const encryptedText = document.getElementById('encryptedText').value;
            
            if (!password) {
                showToast('Enter the password', true);
                return;
            }
            
            if (!encryptedText) {
                showToast('Enter encrypted text to decrypt', true);
                return;
            }
            
            try {
                // Decode Base64
                const combined = new Uint8Array(
                    atob(encryptedText).split('').map(c => c.charCodeAt(0))
                );
                
                // Extract salt, iv, and encrypted data
                const salt = combined.slice(0, 16);
                const iv = combined.slice(16, 28);
                const encrypted = combined.slice(28);
                
                const key = await deriveKey(password, salt);
                
                const decrypted = await crypto.subtle.decrypt(
                    { name: 'AES-GCM', iv: iv },
                    key,
                    encrypted
                );
                
                const decoder = new TextDecoder();
                const plainText = decoder.decode(decrypted);
                
                document.getElementById('plainText').value = plainText;
                updateStats(plainText, encryptedText);
                showToast('Text decrypted successfully!');
                
            } catch (e) {
                showToast('Decryption failed - wrong password or corrupted data', true);
            }
        }

        function updateStats(plain, encrypted) {
            document.getElementById('originalSize').textContent = plain.length;
            document.getElementById('encryptedSize').textContent = encrypted.length;
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

        function copyEncrypted() {
            const text = document.getElementById('encryptedText').value;
            if (!text) {
                showToast('Nothing to copy', true);
                return;
            }
            navigator.clipboard.writeText(text).then(() => {
                showToast('Encrypted text copied!');
            });
        }

        function clearPlain() {
            document.getElementById('plainText').value = '';
            showToast('Cleared');
        }

        function clearEncrypted() {
            document.getElementById('encryptedText').value = '';
            showToast('Cleared');
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }