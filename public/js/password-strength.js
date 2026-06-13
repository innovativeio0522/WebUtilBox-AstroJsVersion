const commonPasswords = ['password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', '1234567', 'letmein', 'trustno1', 'dragon', 'baseball', 'iloveyou', 'master', 'sunshine', 'ashley', 'bailey', 'passw0rd', 'shadow', '123123', '654321', 'superman', 'qazwsx', 'michael', 'football'];

        function togglePassword() {
            const input = document.getElementById('passwordInput');
            const btn = document.getElementById('toggleBtn');
            if (input.type === 'password') {
                input.type = 'text';
                btn.textContent = '??';
            } else {
                input.type = 'password';
                btn.textContent = '???';
            }
        }

        function checkStrength() {
            const password = document.getElementById('passwordInput').value;
            
            if (!password) {
                hideAll();
                return;
            }

            let score = 0;
            const checks = {
                length: password.length >= 8,
                lengthGood: password.length >= 12,
                lengthGreat: password.length >= 16,
                uppercase: /[A-Z]/.test(password),
                lowercase: /[a-z]/.test(password),
                numbers: /[0-9]/.test(password),
                symbols: /[^A-Za-z0-9]/.test(password),
                noCommon: !commonPasswords.includes(password.toLowerCase()),
                noSequential: !hasSequential(password),
                noRepeating: !hasRepeating(password)
            };

            // Calculate score
            if (checks.length) score += 10;
            if (checks.lengthGood) score += 15;
            if (checks.lengthGreat) score += 10;
            if (checks.uppercase) score += 10;
            if (checks.lowercase) score += 10;
            if (checks.numbers) score += 10;
            if (checks.symbols) score += 15;
            if (checks.noCommon) score += 10;
            if (checks.noSequential) score += 5;
            if (checks.noRepeating) score += 5;

            // Display results
            displayStrength(score, password.length);
            displayRequirements(checks);
            displaySuggestions(checks, password);
            
            document.getElementById('strengthMeter').style.display = 'block';
            document.getElementById('statsBar').style.display = 'flex';
            document.getElementById('requirementsBox').style.display = 'block';
            document.getElementById('suggestionsBox').style.display = 'block';
        }

        function displayStrength(score, length) {
            const bar = document.getElementById('strengthBar');
            const label = document.getElementById('strengthLabel');
            const crackTime = document.getElementById('crackTime');
            
            let strength, color, time;
            
            if (score < 30) {
                strength = 'Very Weak';
                color = '#f87171';
                time = 'Instant';
            } else if (score < 50) {
                strength = 'Weak';
                color = '#fb923c';
                time = 'Minutes';
            } else if (score < 70) {
                strength = 'Fair';
                color = '#fbbf24';
                time = 'Hours';
            } else if (score < 85) {
                strength = 'Good';
                color = '#a3e635';
                time = 'Days';
            } else {
                strength = 'Strong';
                color = '#34d399';
                time = 'Years';
            }
            
            bar.style.width = score + '%';
            bar.style.background = color;
            label.textContent = strength;
            label.style.color = color;
            
            document.getElementById('lengthStat').textContent = length;
            document.getElementById('scoreStat').textContent = score;
            crackTime.textContent = time;
        }

        function displayRequirements(checks) {
            const list = document.getElementById('requirementsList');
            const requirements = [
                { check: checks.length, text: 'At least 8 characters' },
                { check: checks.lengthGood, text: 'At least 12 characters (recommended)' },
                { check: checks.uppercase, text: 'Contains uppercase letters (A-Z)' },
                { check: checks.lowercase, text: 'Contains lowercase letters (a-z)' },
                { check: checks.numbers, text: 'Contains numbers (0-9)' },
                { check: checks.symbols, text: 'Contains special characters (!@#$%^&*)' },
                { check: checks.noCommon, text: 'Not a common password' },
                { check: checks.noSequential, text: 'No sequential characters (abc, 123)' }
            ];
            
            let html = '';
            requirements.forEach(req => {
                const icon = req.check ? '?' : '?';
                const color = req.check ? 'var(--secondary)' : 'var(--danger)';
                html += `<div style="display: flex; align-items: center; gap: 10px;">
                    <span style="color: ${color}; font-size: 1.2rem; font-weight: bold;">${icon}</span>
                    <span style="color: ${req.check ? 'var(--white)' : 'var(--gray)'};">${req.text}</span>
                </div>`;
            });
            
            list.innerHTML = html;
        }

        function displaySuggestions(checks, password) {
            const suggestions = [];
            
            if (!checks.lengthGood) suggestions.push('Use at least 12 characters for better security');
            if (!checks.uppercase) suggestions.push('Add uppercase letters (A-Z)');
            if (!checks.lowercase) suggestions.push('Add lowercase letters (a-z)');
            if (!checks.numbers) suggestions.push('Include numbers (0-9)');
            if (!checks.symbols) suggestions.push('Add special characters (!@#$%^&*)');
            if (!checks.noCommon) suggestions.push('Avoid common passwords');
            if (!checks.noSequential) suggestions.push('Avoid sequential patterns (abc, 123)');
            if (!checks.noRepeating) suggestions.push('Avoid repeating characters (aaa, 111)');
            
            const list = document.getElementById('suggestionsList');
            
            if (suggestions.length === 0) {
                list.innerHTML = '<div style="color: var(--secondary);">? Excellent! Your password meets all security requirements.</div>';
            } else {
                let html = '';
                suggestions.forEach(suggestion => {
                    html += `<div style="padding: 6px 10px; background: var(--light); border-radius: 6px; border-left: 3px solid var(--warning);">
                        ${suggestion}
                    </div>`;
                });
                list.innerHTML = html;
            }
        }

        function hasSequential(str) {
            const sequences = ['abc', 'bcd', 'cde', 'def', 'efg', 'fgh', 'ghi', 'hij', 'ijk', 'jkl', 'klm', 'lmn', 'mno', 'nop', 'opq', 'pqr', 'qrs', 'rst', 'stu', 'tuv', 'uvw', 'vwx', 'wxy', 'xyz', '123', '234', '345', '456', '567', '678', '789', 'qwerty', 'asdfgh', 'zxcvbn'];
            return sequences.some(seq => str.toLowerCase().includes(seq));
        }

        function hasRepeating(str) {
            return /(.)\1{2,}/.test(str);
        }

        function hideAll() {
            document.getElementById('strengthMeter').style.display = 'none';
            document.getElementById('statsBar').style.display = 'none';
            document.getElementById('requirementsBox').style.display = 'none';
            document.getElementById('suggestionsBox').style.display = 'none';
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }