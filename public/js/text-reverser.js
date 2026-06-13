let currentMode = 'reverse';

        function switchMode(mode) {
            currentMode = mode;
            document.querySelectorAll('.mode-tab').forEach(tab => tab.classList.remove('active'));
            document.getElementById(mode + 'Tab').classList.add('active');
            
            document.getElementById('reverseMode').style.display = mode === 'reverse' ? 'block' : 'none';
            document.getElementById('frequencyMode').style.display = mode === 'frequency' ? 'block' : 'none';
        }

        // ===== REVERSE TEXT =====
        
        function reverseText() {
            const input = document.getElementById('reverseInput').value;
            if (!input) return showToast('Please enter text', true);
            
            const result = input.split('').reverse().join('');
            document.getElementById('reverseText').textContent = result;
            document.getElementById('reverseOutput').classList.add('show');
            showToast('Text reversed!');
        }

        function reverseWords() {
            const input = document.getElementById('reverseInput').value;
            if (!input) return showToast('Please enter text', true);
            
            const result = input.split(' ').reverse().join(' ');
            document.getElementById('reverseText').textContent = result;
            document.getElementById('reverseOutput').classList.add('show');
            showToast('Words reversed!');
        }

        function reverseLetters() {
            const input = document.getElementById('reverseInput').value;
            if (!input) return showToast('Please enter text', true);
            
            const words = input.split(' ');
            const reversed = words.map(word => word.split('').reverse().join(''));
            const result = reversed.join(' ');
            
            document.getElementById('reverseText').textContent = result;
            document.getElementById('reverseOutput').classList.add('show');
            showToast('Letters reversed!');
        }

        function copyReverse() {
            const text = document.getElementById('reverseText').textContent;
            if (!text) return showToast('Nothing to copy', true);
            navigator.clipboard.writeText(text).then(() => showToast('Copied!'));
        }

        function clearReverse() {
            document.getElementById('reverseInput').value = '';
            document.getElementById('reverseText').textContent = '';
            document.getElementById('reverseOutput').classList.remove('show');
            showToast('Cleared');
        }

        // ===== CHARACTER FREQUENCY =====
        
        function analyzeFrequency() {
            const input = document.getElementById('frequencyInput').value;
            if (!input) return showToast('Please enter text', true);
            
            // Calculate statistics
            const totalChars = input.length;
            const letters = input.match(/[a-zA-Z]/g) || [];
            const digits = input.match(/\d/g) || [];
            const spaces = input.match(/ /g) || [];
            
            // Count frequency
            const frequency = {};
            for (const char of input) {
                frequency[char] = (frequency[char] || 0) + 1;
            }
            
            // Sort by frequency
            const sorted = Object.entries(frequency).sort((a, b) => b[1] - a[1]);
            
            // Update statistics
            document.getElementById('totalChars').textContent = totalChars;
            document.getElementById('totalLetters').textContent = letters.length;
            document.getElementById('totalDigits').textContent = digits.length;
            document.getElementById('totalSpaces').textContent = spaces.length;
            document.getElementById('uniqueChars').textContent = sorted.length;
            document.getElementById('statsContainer').style.display = 'block';
            
            // Create frequency table
            let tableHTML = '<table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">';
            tableHTML += '<thead><tr>';
            tableHTML += '<th style="background: var(--dark); color: var(--white); padding: 10px; border: 1px solid var(--border); text-align: left;">Character</th>';
            tableHTML += '<th style="background: var(--dark); color: var(--white); padding: 10px; border: 1px solid var(--border); text-align: left;">Count</th>';
            tableHTML += '<th style="background: var(--dark); color: var(--white); padding: 10px; border: 1px solid var(--border); text-align: left;">Percentage</th>';
            tableHTML += '<th style="background: var(--dark); color: var(--white); padding: 10px; border: 1px solid var(--border); text-align: left;">Bar</th>';
            tableHTML += '</tr></thead><tbody>';
            
            sorted.forEach(([char, count], index) => {
                const percentage = ((count / totalChars) * 100).toFixed(2);
                const barWidth = Math.min(percentage * 3, 100);
                const displayChar = char === ' ' ? '(space)' : char === '\n' ? '(newline)' : char === '\t' ? '(tab)' : char;
                
                tableHTML += '<tr>';
                tableHTML += `<td style="background: ${index % 2 === 0 ? 'var(--dark)' : '#1a1a1a'}; color: var(--white); padding: 8px; border: 1px solid var(--border); font-family: monospace;">${escapeHTML(displayChar)}</td>`;
                tableHTML += `<td style="background: ${index % 2 === 0 ? 'var(--dark)' : '#1a1a1a'}; color: var(--white); padding: 8px; border: 1px solid var(--border);">${count}</td>`;
                tableHTML += `<td style="background: ${index % 2 === 0 ? 'var(--dark)' : '#1a1a1a'}; color: var(--white); padding: 8px; border: 1px solid var(--border);">${percentage}%</td>`;
                tableHTML += `<td style="background: ${index % 2 === 0 ? 'var(--dark)' : '#1a1a1a'}; padding: 8px; border: 1px solid var(--border);">`;
                tableHTML += `<div style="background: var(--primary); height: 20px; width: ${barWidth}%; border-radius: 4px;"></div>`;
                tableHTML += '</td></tr>';
            });
            
            tableHTML += '</tbody></table>';
            
            document.getElementById('frequencyTable').innerHTML = tableHTML;
            document.getElementById('frequencyOutput').classList.add('show');
            showToast('Analysis complete!');
        }

        function escapeHTML(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }

        function clearFrequency() {
            document.getElementById('frequencyInput').value = '';
            document.getElementById('frequencyTable').innerHTML = '';
            document.getElementById('statsContainer').style.display = 'none';
            document.getElementById('frequencyOutput').classList.remove('show');
            showToast('Cleared');
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }