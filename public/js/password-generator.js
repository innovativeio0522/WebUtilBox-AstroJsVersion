function generatePassword() {
            const length = parseInt(document.getElementById('passLength').value);
            const useUpper = document.getElementById('useUpper').checked;
            const useLower = document.getElementById('useLower').checked;
            const useNumbers = document.getElementById('useNumbers').checked;
            const useSymbols = document.getElementById('useSymbols').checked;
            
            let charset = '';
            if (useLower) charset += 'abcdefghijklmnopqrstuvwxyz';
            if (useUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            if (useNumbers) charset += '0123456789';
            if (useSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
            
            if (!charset) return showToast('Select at least one character type');
            
            let password = '';
            const array = new Uint32Array(length);
            crypto.getRandomValues(array);
            
            for (let i = 0; i < length; i++) {
                password += charset[array[i] % charset.length];
            }
            
            document.getElementById('outputText').textContent = password;
            document.getElementById('outputContainer').classList.add('show');
            
            // Strength calculation
            let strength = 0;
            if (length >= 12) strength++;
            if (length >= 16) strength++;
            if (useUpper && useLower) strength++;
            if (useNumbers) strength++;
            if (useSymbols) strength++;
            
            const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
            const colors = ['#f56565', '#f56565', '#ed8936', '#ecc94b', '#48bb78', '#38a169'];
            
            const indicator = document.getElementById('strengthIndicator');
            indicator.textContent = 'Strength: ' + labels[strength];
            indicator.style.color = colors[strength];
            
            showToast('Password generated!');
        }

        function copyPassword() {
            const text = document.getElementById('outputText')?.textContent;
            if (!text) return showToast('Generate a password first');
            navigator.clipboard.writeText(text).then(() => {
                showToast('Password copied to clipboard!');
            });
        }

        function showToast(message) {
            const toast = document.getElementById('toast');
            document.getElementById('toastMessage').textContent = message;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }