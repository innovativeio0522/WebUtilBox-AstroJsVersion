const cssTab = document.getElementById('cssTab');
        const jsTab = document.getElementById('jsTab');
        const inputCode = document.getElementById('inputCode');
        const outputCode = document.getElementById('outputCode');
        const minifyBtn = document.getElementById('minifyBtn');
        const copyBtn = document.getElementById('copyBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        const loadSampleBtn = document.getElementById('loadSampleBtn');
        const clearBtn = document.getElementById('clearBtn');

        let currentMode = 'css';

        // Tab switching
        requestIdleCallback(() => {
            cssTab.addEventListener('click', () => switchTab('css'));
            jsTab.addEventListener('click', () => switchTab('js'));
        }, { timeout: 2000 });

        function switchTab(mode) {
            currentMode = mode;
            
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.style.background = 'transparent';
            });
            
            if (mode === 'css') {
                cssTab.style.background = 'var(--primary)';
                inputCode.placeholder = 'Paste your CSS code here...';
            } else {
                jsTab.style.background = 'var(--primary)';
                inputCode.placeholder = 'Paste your JavaScript code here...';
            }
            
            inputCode.value = '';
            outputCode.value = '';
            updateStats();
        }

        // Update stats on input
        requestIdleCallback(() => {
            inputCode.addEventListener('input', updateStats);
        }, { timeout: 2000 });

        function updateStats() {
            const input = inputCode.value;
            const output = outputCode.value;
            
            const inputBytes = new Blob([input]).size;
            const outputBytes = new Blob([output]).size;
            const inputLines = input ? input.split('\n').length : 0;
            const outputLines = output ? output.split('\n').length : 0;
            
            document.getElementById('inputSize').textContent = formatBytes(inputBytes);
            document.getElementById('inputLines').textContent = inputLines;
            document.getElementById('inputChars').textContent = input.length;
            
            document.getElementById('outputSize').textContent = formatBytes(outputBytes);
            document.getElementById('outputLines').textContent = outputLines;
            document.getElementById('outputChars').textContent = output.length;
            
            if (output) {
                const reduced = inputBytes - outputBytes;
                const percent = inputBytes > 0 ? ((reduced / inputBytes) * 100).toFixed(1) : 0;
                document.getElementById('sizeReduced').textContent = formatBytes(reduced);
                document.getElementById('compressionPercent').textContent = percent + '%';
            } else {
                document.getElementById('sizeReduced').textContent = '0 B';
                document.getElementById('compressionPercent').textContent = '0%';
            }
        }

        function formatBytes(bytes) {
            if (bytes === 0) return '0 B';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        // Minify
        requestIdleCallback(() => { minifyBtn.addEventListener('click', minifyCode); }, { timeout: 2000 });

        function minifyCode() {
            const input = inputCode.value.trim();
            
            if (!input) {
                showToast('Please enter some code', true);
                return;
            }

            try {
                let minified;
                
                if (currentMode === 'css') {
                    minified = minifyCSS(input);
                } else {
                    minified = minifyJS(input);
                }
                
                outputCode.value = minified;
                updateStats();
                showToast('Code minified successfully!');
            } catch (error) {
                showToast('Error minifying code: ' + error.message, true);
            }
        }

        function minifyCSS(css) {
            return css
                .replace(/\/\*[\s\S]*?\*\//g, '')
                .replace(/\s+/g, ' ')
                .replace(/\s*{\s*/g, '{')
                .replace(/\s*}\s*/g, '}')
                .replace(/\s*:\s*/g, ':')
                .replace(/\s*;\s*/g, ';')
                .replace(/\s*,\s*/g, ',')
                .replace(/;\}/g, '}')
                .replace(/\s*>\s*/g, '>')
                .replace(/\s*\+\s*/g, '+')
                .replace(/\s*~\s*/g, '~')
                .trim();
        }

        function minifyJS(js) {
            return js
                .replace(/\/\*[\s\S]*?\*\//g, '')
                .replace(/\/\/.*/g, '')
                .replace(/\s+/g, ' ')
                .replace(/\s*{\s*/g, '{')
                .replace(/\s*}\s*/g, '}')
                .replace(/\s*\(\s*/g, '(')
                .replace(/\s*\)\s*/g, ')')
                .replace(/\s*;\s*/g, ';')
                .replace(/\s*,\s*/g, ',')
                .replace(/\s*=\s*/g, '=')
                .replace(/\s*:\s*/g, ':')
                .replace(/\s*\?\s*/g, '?')
                .replace(/\s*\|\|\s*/g, '||')
                .replace(/\s*&&\s*/g, '&&')
                .replace(/\s*\+\s*/g, '+')
                .replace(/\s*-\s*/g, '-')
                .replace(/\s*\*\s*/g, '*')
                .replace(/\s*\/\s*/g, '/')
                .replace(/\s*<\s*/g, '<')
                .replace(/\s*>\s*/g, '>')
                .replace(/\s*!\s*/g, '!')
                .trim();
        }

        // Copy
        requestIdleCallback(() => {
            copyBtn.addEventListener('click', () => {
                if (!outputCode.value) {
                    showToast('No output to copy', true);
                    return;
                }

                navigator.clipboard.writeText(outputCode.value).then(() => {
                    showToast('Copied to clipboard!');
                }).catch(() => {
                    showToast('Failed to copy', true);
                });
            });

            // Download
            downloadBtn.addEventListener('click', () => {
                if (!outputCode.value) {
                    showToast('No output to download', true);
                    return;
                }

                const extension = currentMode === 'css' ? '.min.css' : '.min.js';
                const mimeType = currentMode === 'css' ? 'text/css' : 'text/javascript';
                
                const blob = new Blob([outputCode.value], { type: mimeType });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'minified_' + Date.now() + extension;
                a.click();
                URL.revokeObjectURL(url);
                showToast('File downloaded!');
            });

            // Clear
            clearBtn.addEventListener('click', () => {
                inputCode.value = '';
                outputCode.value = '';
                updateStats();
                showToast('Cleared');
            });

            // Initialize
            updateStats();
        }, { timeout: 2000 });

        // Load sample
        requestIdleCallback(() => {
            loadSampleBtn.addEventListener('click', () => {
            if (currentMode === 'css') {
                inputCode.value = `/* Main Styles */
body {
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
    background-color: #f0f0f0;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.button {
    display: inline-block;
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.button:hover {
    background-color: #0056b3;
}`;
            } else {
                inputCode.value = `// Sample JavaScript
function calculateTotal(items) {
    let total = 0;
    
    for (let i = 0; i < items.length; i++) {
        total += items[i].price * items[i].quantity;
    }
    
    return total;
}

const cart = [
    { name: 'Product 1', price: 10, quantity: 2 },
    { name: 'Product 2', price: 15, quantity: 1 }
];

const total = calculateTotal(cart);
console.log('Total: $' + total);`;
            }
            updateStats();
            showToast('Sample loaded!');
            });
        }, { timeout: 2000 });

        // Clear
        requestIdleCallback(() => {
            clearBtn.addEventListener('click', () => {
                inputCode.value = '';
                outputCode.value = '';
                updateStats();
                showToast('Cleared');
            });

            // Initialize
            updateStats();
        }, { timeout: 2000 });

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }