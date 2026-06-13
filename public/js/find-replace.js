function findMatches() {
            const text = document.getElementById('inputText').value;
            const find = document.getElementById('findText').value;
            
            if (!text || !find) {
                showToast('Enter text and search term', true);
                return;
            }
            
            try {
                const regex = buildRegex(find);
                const matches = text.match(regex);
                const count = matches ? matches.length : 0;
                
                document.getElementById('matchCount').textContent = count;
                document.getElementById('matchStats').style.display = 'block';
                
                if (count > 0) {
                    // Highlight matches
                    let highlighted = text.replace(regex, (match) => `?${match}?`);
                    document.getElementById('outputText').textContent = highlighted;
                    document.getElementById('outputContainer').style.display = 'block';
                    showToast(`Found ${count} match${count !== 1 ? 'es' : ''}`);
                } else {
                    document.getElementById('outputText').textContent = 'No matches found';
                    document.getElementById('outputContainer').style.display = 'block';
                    showToast('No matches found', true);
                }
            } catch (e) {
                showToast('Invalid regex pattern', true);
            }
        }
        
        function replaceAll() {
            const text = document.getElementById('inputText').value;
            const find = document.getElementById('findText').value;
            const replace = document.getElementById('replaceText').value;
            
            if (!text || !find) {
                showToast('Enter text and search term', true);
                return;
            }
            
            try {
                const regex = buildRegex(find);
                const matches = text.match(regex);
                const count = matches ? matches.length : 0;
                
                if (count === 0) {
                    showToast('No matches to replace', true);
                    return;
                }
                
                const result = text.replace(regex, replace);
                
                document.getElementById('outputText').textContent = result;
                document.getElementById('outputContainer').style.display = 'block';
                document.getElementById('matchCount').textContent = count;
                document.getElementById('matchStats').style.display = 'block';
                
                showToast(`Replaced ${count} occurrence${count !== 1 ? 's' : ''}`);
            } catch (e) {
                showToast('Invalid regex pattern', true);
            }
        }
        
        function buildRegex(pattern) {
            const caseSensitive = document.getElementById('caseSensitive').checked;
            const wholeWord = document.getElementById('wholeWord').checked;
            const useRegex = document.getElementById('useRegex').checked;
            
            let regexPattern = pattern;
            
            if (!useRegex) {
                // Escape special regex characters
                regexPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            }
            
            if (wholeWord) {
                regexPattern = `\\b${regexPattern}\\b`;
            }
            
            const flags = caseSensitive ? 'g' : 'gi';
            return new RegExp(regexPattern, flags);
        }
        
        function copyResult() {
            const result = document.getElementById('outputText').textContent;
            
            if (!result || result === 'No matches found') {
                showToast('Nothing to copy', true);
                return;
            }
            
            navigator.clipboard.writeText(result).then(() => {
                showToast('Result copied to clipboard!');
            });
        }
        
        function clearAll() {
            document.getElementById('inputText').value = '';
            document.getElementById('findText').value = '';
            document.getElementById('replaceText').value = '';
            document.getElementById('outputContainer').style.display = 'none';
            document.getElementById('matchStats').style.display = 'none';
            showToast('Cleared');
        }
        
        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }