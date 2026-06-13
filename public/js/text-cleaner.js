let currentMode = 'duplicates';

        function switchMode(mode) {
            currentMode = mode;
            document.querySelectorAll('.mode-tab').forEach(tab => tab.classList.remove('active'));
            document.getElementById(mode + 'Tab').classList.add('active');
            
            document.getElementById('duplicatesMode').style.display = mode === 'duplicates' ? 'block' : 'none';
            document.getElementById('lineNumbersMode').style.display = mode === 'lineNumbers' ? 'block' : 'none';
            document.getElementById('whitespaceMode').style.display = mode === 'whitespace' ? 'block' : 'none';
        }

        // ===== REMOVE DUPLICATES =====
        
        function removeDuplicates() {
            const input = document.getElementById('duplicatesInput').value;
            if (!input.trim()) return showToast('Please enter text', true);
            
            const caseSensitive = document.getElementById('caseSensitive').checked;
            const trimLines = document.getElementById('trimLines').checked;
            const sortLines = document.getElementById('sortLines').checked;
            
            let lines = input.split('\n');
            const originalCount = lines.length;
            
            if (trimLines) {
                lines = lines.map(line => line.trim());
            }
            
            const seen = new Set();
            const unique = [];
            
            lines.forEach(line => {
                const key = caseSensitive ? line : line.toLowerCase();
                if (!seen.has(key) && line !== '') {
                    seen.add(key);
                    unique.push(line);
                }
            });
            
            if (sortLines) {
                unique.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: caseSensitive ? 'case' : 'base' }));
            }
            
            const result = unique.join('\n');
            const removed = originalCount - unique.length;
            
            document.getElementById('duplicatesText').textContent = result;
            document.getElementById('duplicatesStats').textContent = `(${unique.length} unique, ${removed} duplicates removed)`;
            document.getElementById('duplicatesOutput').classList.add('show');
            showToast('Duplicates removed!');
        }

        function copyDuplicates() {
            const text = document.getElementById('duplicatesText').textContent;
            if (!text) return showToast('Nothing to copy', true);
            navigator.clipboard.writeText(text).then(() => showToast('Copied!'));
        }

        function clearDuplicates() {
            document.getElementById('duplicatesInput').value = '';
            document.getElementById('duplicatesText').textContent = '';
            document.getElementById('duplicatesOutput').classList.remove('show');
            showToast('Cleared');
        }

        // ===== LINE NUMBERS =====
        
        function addLineNumbers() {
            const input = document.getElementById('lineNumbersInput').value;
            if (!input.trim()) return showToast('Please enter text', true);
            
            const startNum = parseInt(document.getElementById('startNumber').value) || 1;
            const separator = document.getElementById('separator').value;
            
            const lines = input.split('\n');
            const numbered = lines.map((line, index) => `${startNum + index}${separator}${line}`);
            
            document.getElementById('lineNumbersText').textContent = numbered.join('\n');
            document.getElementById('lineNumbersOutput').classList.add('show');
            showToast('Line numbers added!');
        }

        function removeLineNumbers() {
            const input = document.getElementById('lineNumbersInput').value;
            if (!input.trim()) return showToast('Please enter text', true);
            
            const lines = input.split('\n');
            const cleaned = lines.map(line => line.replace(/^\d+[\.\)\:\-\s]+/, ''));
            
            document.getElementById('lineNumbersText').textContent = cleaned.join('\n');
            document.getElementById('lineNumbersOutput').classList.add('show');
            showToast('Line numbers removed!');
        }

        function copyLineNumbers() {
            const text = document.getElementById('lineNumbersText').textContent;
            if (!text) return showToast('Nothing to copy', true);
            navigator.clipboard.writeText(text).then(() => showToast('Copied!'));
        }

        function clearLineNumbers() {
            document.getElementById('lineNumbersInput').value = '';
            document.getElementById('lineNumbersText').textContent = '';
            document.getElementById('lineNumbersOutput').classList.remove('show');
            showToast('Cleared');
        }

        // ===== WHITESPACE =====
        
        function removeExtraSpaces() {
            const input = document.getElementById('whitespaceInput').value;
            if (!input) return showToast('Please enter text', true);
            
            const result = input.replace(/  +/g, ' ');
            document.getElementById('whitespaceText').textContent = result;
            document.getElementById('whitespaceOutput').classList.add('show');
            showToast('Extra spaces removed!');
        }

        function removeAllSpaces() {
            const input = document.getElementById('whitespaceInput').value;
            if (!input) return showToast('Please enter text', true);
            
            const result = input.replace(/ /g, '');
            document.getElementById('whitespaceText').textContent = result;
            document.getElementById('whitespaceOutput').classList.add('show');
            showToast('All spaces removed!');
        }

        function removeEmptyLines() {
            const input = document.getElementById('whitespaceInput').value;
            if (!input) return showToast('Please enter text', true);
            
            const lines = input.split('\n').filter(line => line.trim() !== '');
            document.getElementById('whitespaceText').textContent = lines.join('\n');
            document.getElementById('whitespaceOutput').classList.add('show');
            showToast('Empty lines removed!');
        }

        function trimAllLines() {
            const input = document.getElementById('whitespaceInput').value;
            if (!input) return showToast('Please enter text', true);
            
            const lines = input.split('\n').map(line => line.trim());
            document.getElementById('whitespaceText').textContent = lines.join('\n');
            document.getElementById('whitespaceOutput').classList.add('show');
            showToast('Lines trimmed!');
        }

        function copyWhitespace() {
            const text = document.getElementById('whitespaceText').textContent;
            if (!text) return showToast('Nothing to copy', true);
            navigator.clipboard.writeText(text).then(() => showToast('Copied!'));
        }

        function clearWhitespace() {
            document.getElementById('whitespaceInput').value = '';
            document.getElementById('whitespaceText').textContent = '';
            document.getElementById('whitespaceOutput').classList.remove('show');
            showToast('Cleared');
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }