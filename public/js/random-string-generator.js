function updateLength() {
            document.getElementById('lengthValue').textContent = document.getElementById('length').value;
            generate();
        }

        function generate() {
            const length = parseInt(document.getElementById('length').value);
            const useUpper = document.getElementById('uppercase').checked;
            const useLower = document.getElementById('lowercase').checked;
            const useNumbers = document.getElementById('numbers').checked;
            const useSymbols = document.getElementById('symbols').checked;

            let charset = '';
            if (useUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            if (useLower) charset += 'abcdefghijklmnopqrstuvwxyz';
            if (useNumbers) charset += '0123456789';
            if (useSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

            if (!charset) {
                showToast('Please select at least one character type', true);
                return;
            }

            const array = new Uint32Array(length);
            crypto.getRandomValues(array);
            const result = Array.from(array).map(x => charset[x % charset.length]).join('');

            document.getElementById('output').textContent = result;
        }

        function generateBatch() {
            const count = parseInt(document.getElementById('count').value);
            const results = [];

            for (let i = 0; i < count; i++) {
                const length = parseInt(document.getElementById('length').value);
                const useUpper = document.getElementById('uppercase').checked;
                const useLower = document.getElementById('lowercase').checked;
                const useNumbers = document.getElementById('numbers').checked;
                const useSymbols = document.getElementById('symbols').checked;

                let charset = '';
                if (useUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                if (useLower) charset += 'abcdefghijklmnopqrstuvwxyz';
                if (useNumbers) charset += '0123456789';
                if (useSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

                const array = new Uint32Array(length);
                crypto.getRandomValues(array);
                const result = Array.from(array).map(x => charset[x % charset.length]).join('');
                results.push(result);
            }

            document.getElementById('batchText').value = results.join('\n');
            document.getElementById('batchOutput').style.display = 'block';
            showToast(`Generated ${count} strings`);
        }

        function copy() {
            const text = document.getElementById('output').textContent;
            navigator.clipboard.writeText(text).then(() => showToast('Copied!'));
        }

        function copyBatch() {
            const text = document.getElementById('batchText').value;
            navigator.clipboard.writeText(text).then(() => showToast('All strings copied!'));
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }

        generate();