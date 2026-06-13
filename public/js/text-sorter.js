const inputText = document.getElementById('inputText');
        const outputText = document.getElementById('outputText');
        const sortBtn = document.getElementById('sortBtn');
        const copyBtn = document.getElementById('copyBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        const loadSampleBtn = document.getElementById('loadSampleBtn');
        const clearBtn = document.getElementById('clearBtn');

        // Update stats on input
        inputText.addEventListener('input', updateInputStats);

        sortBtn.addEventListener('click', sortText);
        copyBtn.addEventListener('click', copyOutput);
        downloadBtn.addEventListener('click', downloadOutput);
        loadSampleBtn.addEventListener('click', loadSample);
        clearBtn.addEventListener('click', () => {
            inputText.value = '';
            outputText.value = '';
            updateInputStats();
            updateOutputStats();
            showToast('Cleared');
        });

        function updateInputStats() {
            const text = inputText.value;
            const lines = text ? text.split('\n').length : 0;
            const chars = text.length;
            
            document.getElementById('lineCount').textContent = lines;
            document.getElementById('charCount').textContent = chars;
        }

        function updateOutputStats() {
            const text = outputText.value;
            const lines = text ? text.split('\n').length : 0;
            const chars = text.length;
            
            document.getElementById('outputLineCount').textContent = lines;
            document.getElementById('outputCharCount').textContent = chars;
        }

        function sortText() {
            const input = inputText.value;
            
            if (!input.trim()) {
                showToast('Please enter some text', true);
                return;
            }

            let lines = input.split('\n');
            const originalCount = lines.length;

            // Remove empty lines if checked
            if (document.getElementById('removeEmpty').checked) {
                lines = lines.filter(line => line.trim() !== '');
            }

            const sortType = document.getElementById('sortType').value;
            const sortOrder = document.getElementById('sortOrder').value;
            const caseSensitive = document.getElementById('caseSensitive').checked;
            const removeDuplicates = document.getElementById('removeDuplicates').checked;

            // Count duplicates before removal
            const uniqueLines = new Set(caseSensitive ? lines : lines.map(l => l.toLowerCase()));
            const duplicateCount = lines.length - uniqueLines.size;

            // Remove duplicates if checked
            if (removeDuplicates) {
                if (caseSensitive) {
                    lines = [...new Set(lines)];
                } else {
                    const seen = new Set();
                    lines = lines.filter(line => {
                        const lower = line.toLowerCase();
                        if (seen.has(lower)) return false;
                        seen.add(lower);
                        return true;
                    });
                }
            }

            // Sort based on type
            switch(sortType) {
                case 'alpha':
                    lines.sort((a, b) => {
                        const strA = caseSensitive ? a : a.toLowerCase();
                        const strB = caseSensitive ? b : b.toLowerCase();
                        return strA.localeCompare(strB);
                    });
                    break;
                
                case 'numeric':
                    lines.sort((a, b) => {
                        const numA = parseFloat(a) || 0;
                        const numB = parseFloat(b) || 0;
                        return numA - numB;
                    });
                    break;
                
                case 'length':
                    lines.sort((a, b) => a.length - b.length);
                    break;
            }

            // Reverse if descending
            if (sortOrder === 'desc') {
                lines.reverse();
            }

            outputText.value = lines.join('\n');
            updateOutputStats();

            // Update stats
            document.getElementById('statsOriginal').textContent = originalCount;
            document.getElementById('statsSorted').textContent = lines.length;
            document.getElementById('statsRemoved').textContent = originalCount - lines.length;
            document.getElementById('statsDuplicates').textContent = duplicateCount;

            showToast('Text sorted successfully!');
        }

        function copyOutput() {
            if (!outputText.value) {
                showToast('No output to copy', true);
                return;
            }

            navigator.clipboard.writeText(outputText.value).then(() => {
                showToast('Copied to clipboard!');
            }).catch(() => {
                showToast('Failed to copy', true);
            });
        }

        function downloadOutput() {
            if (!outputText.value) {
                showToast('No output to download', true);
                return;
            }

            const blob = new Blob([outputText.value], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'sorted_text_' + Date.now() + '.txt';
            a.click();
            URL.revokeObjectURL(url);
            showToast('File downloaded!');
        }

        function loadSample() {
            const sample = `Zebra
Apple
Mango
Banana
Cherry
Date
Elderberry
Fig
Grape
Kiwi
Apple
Banana`;
            inputText.value = sample;
            updateInputStats();
            showToast('Sample loaded!');
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }

        // Initialize
        updateInputStats();
        updateOutputStats();