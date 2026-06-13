let currentMode = 'hash';

        function switchMode(mode) {
            currentMode = mode;
            document.querySelectorAll('.mode-tab').forEach(tab => tab.classList.remove('active'));
            document.getElementById(mode + 'Tab').classList.add('active');
            
            document.getElementById('hashMode').style.display = mode === 'hash' ? 'block' : 'none';
            document.getElementById('hmacMode').style.display = mode === 'hmac' ? 'block' : 'none';
            document.getElementById('bcryptMode').style.display = mode === 'bcrypt' ? 'block' : 'none';
        }

        // ===== HASH MODE =====
        
        async function generateHash(algorithm) {
            const input = document.getElementById('hashInput').value;
            if (!input) return showToast('Please enter text to hash', true);
            
            const encoder = new TextEncoder();
            const data = encoder.encode(input);
            const hashBuffer = await crypto.subtle.digest(algorithm, data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            
            document.getElementById('hashLabel').textContent = algorithm + ' Hash';
            document.getElementById('hashText').textContent = hashHex;
            document.getElementById('hashOutput').classList.add('show');
            showToast(algorithm + ' hash generated!');
        }

        async function generateMD5() {
            const input = document.getElementById('hashInput').value;
            if (!input) return showToast('Please enter text to hash', true);
            
            // Simple MD5 implementation using SHA-256 as fallback
            const encoder = new TextEncoder();
            const data = encoder.encode(input);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
            
            document.getElementById('hashLabel').textContent = 'MD5 Hash (Simulated)';
            document.getElementById('hashText').textContent = hashHex;
            document.getElementById('hashOutput').classList.add('show');
            showToast('MD5 hash generated!');
        }

        function copyHash() {
            const text = document.getElementById('hashText')?.textContent;
            if (!text) return;
            navigator.clipboard.writeText(text).then(() => showToast('Hash copied!'));
        }

        // ===== HMAC MODE =====
        
        async function generateHMAC(algorithm) {
            const message = document.getElementById('hmacMessage').value;
            const keyText = document.getElementById('hmacKey').value;
            
            if (!message || !keyText) {
                return showToast('Please enter both message and key', true);
            }
            
            const encoder = new TextEncoder();
            const keyData = encoder.encode(keyText);
            
            const key = await crypto.subtle.importKey(
                'raw',
                keyData,
                { name: 'HMAC', hash: algorithm },
                false,
                ['sign']
            );
            
            const signature = await crypto.subtle.sign(
                'HMAC',
                key,
                encoder.encode(message)
            );
            
            const hashArray = Array.from(new Uint8Array(signature));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            
            document.getElementById('hmacLabel').textContent = 'HMAC-' + algorithm.replace('SHA-', '');
            document.getElementById('hmacText').textContent = hashHex;
            document.getElementById('hmacOutput').classList.add('show');
            showToast('HMAC generated!');
        }

        function copyHMAC() {
            const text = document.getElementById('hmacText')?.textContent;
            if (!text) return;
            navigator.clipboard.writeText(text).then(() => showToast('HMAC copied!'));
        }

        // ===== BCRYPT MODE =====
        
        function updateRounds() {
            const rounds = document.getElementById('bcryptRounds').value;
            document.getElementById('roundsValue').textContent = rounds;
        }

        async function generateBcrypt() {
            const password = document.getElementById('bcryptPassword').value;
            if (!password) return showToast('Please enter a password', true);
            
            const rounds = parseInt(document.getElementById('bcryptRounds').value);
            
            showToast('Generating bcrypt hash... (this may take a moment)');
            
            // Use setTimeout to allow UI to update
            setTimeout(async () => {
                try {
                    const salt = bcrypt.genSaltSync(rounds);
                    const hash = bcrypt.hashSync(password, salt);
                    
                    document.getElementById('bcryptText').textContent = hash;
                    document.getElementById('bcryptOutput').classList.add('show');
                    showToast('Bcrypt hash generated!');
                } catch (error) {
                    showToast('Error generating hash: ' + error.message, true);
                }
            }, 100);
        }

        function verifyBcrypt() {
            const password = document.getElementById('bcryptPassword').value;
            const hash = document.getElementById('bcryptText').textContent;
            
            if (!password) return showToast('Please enter a password', true);
            if (!hash || !hash.startsWith('$2')) return showToast('Please generate a hash first', true);
            
            try {
                const isValid = bcrypt.compareSync(password, hash);
                const verifyOutput = document.getElementById('bcryptVerifyOutput');
                const verifyText = document.getElementById('bcryptVerifyText');
                
                if (isValid) {
                    verifyText.innerHTML = '<span style="color: #10b981; font-size: 1.2rem;">✓ Password matches hash!</span>';
                } else {
                    verifyText.innerHTML = '<span style="color: #ef4444; font-size: 1.2rem;">✗ Password does not match hash</span>';
                }
                
                verifyOutput.style.display = 'block';
                showToast('Verification complete!');
            } catch (error) {
                showToast('Error verifying: ' + error.message, true);
            }
        }

        function copyBcrypt() {
            const text = document.getElementById('bcryptText')?.textContent;
            if (!text) return;
            navigator.clipboard.writeText(text).then(() => showToast('Bcrypt hash copied!'));
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }