const inputCode = document.getElementById('inputCode');
        const outputCode = document.getElementById('outputCode');
        const obfuscateBtn = document.getElementById('obfuscateBtn');
        const copyBtn = document.getElementById('copyBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        const loadSampleBtn = document.getElementById('loadSampleBtn');
        const clearBtn = document.getElementById('clearBtn');

        let varsRenamed = 0;
        let stringsEncoded = 0;

        requestIdleCallback(() => {
            // Update stats on input
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
            
            document.getElementById('outputSize').textContent = formatBytes(outputBytes);
            document.getElementById('outputLines').textContent = outputLines;
            
            if (output) {
                const change = outputBytes - inputBytes;
                const sign = change >= 0 ? '+' : '';
                document.getElementById('sizeChange').textContent = sign + formatBytes(Math.abs(change));
                document.getElementById('varsRenamed').textContent = varsRenamed;
                document.getElementById('stringsEncoded').textContent = stringsEncoded;
            } else {
                document.getElementById('sizeChange').textContent = '0 B';
                document.getElementById('varsRenamed').textContent = '0';
                document.getElementById('stringsEncoded').textContent = '0';
            }
        }

        function formatBytes(bytes) {
            if (bytes === 0) return '0 B';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        // Obfuscate
        requestIdleCallback(() => { obfuscateBtn.addEventListener('click', obfuscateCode); }, { timeout: 2000 });

        function obfuscateCode() {
            const input = inputCode.value.trim();
            
            if (!input) {
                showToast('Please enter some code', true);
                return;
            }

            try {
                let code = input;
                varsRenamed = 0;
                stringsEncoded = 0;

                const renameVars = document.getElementById('renameVars').checked;
                const encodeStrings = document.getElementById('encodeStrings').checked;
                const removeComments = document.getElementById('removeComments').checked;
                const removeWhitespace = document.getElementById('removeWhitespace').checked;
                const shuffleArrays = document.getElementById('shuffleArrays').checked;
                const wrapCode = document.getElementById('wrapCode').checked;

                // Remove comments
                if (removeComments) {
                    code = code.replace(/\/\*[\s\S]*?\*\//g, '');
                    code = code.replace(/\/\/.*/g, '');
                }

                // Encode strings
                if (encodeStrings) {
                    code = code.replace(/'([^']*)'/g, (match, str) => {
                        stringsEncoded++;
                        return encodeString(str);
                    });
                    code = code.replace(/"([^"]*)"/g, (match, str) => {
                        stringsEncoded++;
                        return encodeString(str);
                    });
                }

                // Rename variables
                if (renameVars) {
                    const varMap = new Map();
                    let varCounter = 0;
                    
                    // Find variable declarations
                    const varPattern = /\b(var|let|const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
                    let match;
                    
                    while ((match = varPattern.exec(code)) !== null) {
                        const varName = match[2];
                        if (!varMap.has(varName) && !isReservedWord(varName)) {
                            varMap.set(varName, '_0x' + varCounter.toString(16));
                            varCounter++;
                        }
                    }
                    
                    // Replace variables
                    varMap.forEach((newName, oldName) => {
                        const regex = new RegExp('\\b' + oldName + '\\b', 'g');
                        code = code.replace(regex, newName);
                        varsRenamed++;
                    });
                }

                // Shuffle array elements (simple implementation)
                if (shuffleArrays) {
                    code = code.replace(/\[([^\]]+)\]/g, (match, content) => {
                        const items = content.split(',').map(s => s.trim());
                        if (items.length > 1 && items.every(item => /^['"]/.test(item) || /^\d+$/.test(item))) {
                            return '[' + shuffleArray(items).join(',') + ']';
                        }
                        return match;
                    });
                }

                // Remove whitespace
                if (removeWhitespace) {
                    code = code
                        .replace(/\s+/g, ' ')
                        .replace(/\s*{\s*/g, '{')
                        .replace(/\s*}\s*/g, '}')
                        .replace(/\s*\(\s*/g, '(')
                        .replace(/\s*\)\s*/g, ')')
                        .replace(/\s*;\s*/g, ';')
                        .replace(/\s*,\s*/g, ',')
                        .replace(/\s*=\s*/g, '=')
                        .trim();
                }

                // Wrap in self-executing function
                if (wrapCode) {
                    code = '(function(){' + code + '})();';
                }

                outputCode.value = code;
                updateStats();
                showToast('Code obfuscated successfully!');
            } catch (error) {
                showToast('Error obfuscating code: ' + error.message, true);
            }
        }

        function encodeString(str) {
            // Convert to hex encoding
            let encoded = '';
            for (let i = 0; i < str.length; i++) {
                encoded += '\\x' + str.charCodeAt(i).toString(16).padStart(2, '0');
            }
            return '"' + encoded + '"';
        }

        function isReservedWord(word) {
            const reserved = [
                'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default',
                'delete', 'do', 'else', 'export', 'extends', 'finally', 'for', 'function',
                'if', 'import', 'in', 'instanceof', 'let', 'new', 'return', 'super', 'switch',
                'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield',
                'console', 'document', 'window', 'alert', 'prompt', 'confirm'
            ];
            return reserved.includes(word);
        }

        function shuffleArray(array) {
            const arr = [...array];
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
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

                const blob = new Blob([outputCode.value], { type: 'text/javascript' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'obfuscated_' + Date.now() + '.js';
                a.click();
                URL.revokeObjectURL(url);
                showToast('File downloaded!');
            });

            // Clear
            clearBtn.addEventListener('click', () => {
                inputCode.value = '';
                outputCode.value = '';
                varsRenamed = 0;
                stringsEncoded = 0;
                updateStats();
                showToast('Cleared');
            });
        }, { timeout: 2000 });

        // Load sample
        requestIdleCallback(() => {
            loadSampleBtn.addEventListener('click', () => {
                inputCode.value = `// User authentication function
function authenticateUser(username, password) {
    const apiKey = "sk_live_12345abcdef";
    const secretToken = "my_secret_token_2024";
    
    if (username === "admin" && password === "password123") {
        console.log("Login successful!");
        return true;
    }
    
    return false;
}

// Calculate discount
function calculateDiscount(price, discountPercent) {
    const discount = price * (discountPercent / 100);
    const finalPrice = price - discount;
    return finalPrice;
}

const userLoggedIn = authenticateUser("admin", "password123");
const finalAmount = calculateDiscount(100, 20);
console.log("Final amount: $" + finalAmount);`;
                updateStats();
                showToast('Sample loaded!');
            });
        }, { timeout: 2000 });

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }

        // Initialize
        requestIdleCallback(() => { updateStats(); }, { timeout: 2000 });