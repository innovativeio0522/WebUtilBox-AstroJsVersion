function convertAll() {
            const input = document.getElementById('inputNumber').value.trim();
            const base = parseInt(document.getElementById('inputBase').value);
            
            if (!input) {
                clearAll();
                return;
            }
            
            try {
                const decimal = parseInt(input, base);
                
                if (isNaN(decimal)) {
                    clearAll();
                    return;
                }
                
                document.getElementById('binary').textContent = decimal.toString(2);
                document.getElementById('octal').textContent = decimal.toString(8);
                document.getElementById('decimal').textContent = decimal.toString(10);
                document.getElementById('hex').textContent = decimal.toString(16).toUpperCase();
            } catch (e) {
                clearAll();
            }
        }

        function clearAll() {
            document.getElementById('binary').textContent = '-';
            document.getElementById('octal').textContent = '-';
            document.getElementById('decimal').textContent = '-';
            document.getElementById('hex').textContent = '-';
        }

        function copy(type) {
            const text = document.getElementById(type).textContent;
            if (text === '-') return;
            
            navigator.clipboard.writeText(text).then(() => {
                showToast(`${type.toUpperCase()} copied!`);
            });
        }

        function showToast(message) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show';
            setTimeout(() => toast.classList.remove('show'), 3000);
        }