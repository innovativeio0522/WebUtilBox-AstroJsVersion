const conversions = {};

        function convertAllCases() {
            const input = document.getElementById('inputText').value;
            
            if (!input) {
                // Reset all to placeholder
                const cases = ['upper', 'lower', 'title', 'sentence', 'camel', 'pascal', 'snake', 'kebab', 'constant'];
                cases.forEach(c => {
                    const elem = document.getElementById(c + 'Case');
                    elem.textContent = 'Enter text to see conversions...';
                    elem.style.color = 'var(--gray)';
                });
                document.getElementById('statsBar').style.display = 'none';
                return;
            }

            // Show stats
            updateStats(input);
            document.getElementById('statsBar').style.display = 'flex';
            
            // UPPERCASE
            conversions.upper = input.toUpperCase();
            showCase('upper', conversions.upper);
            
            // lowercase
            conversions.lower = input.toLowerCase();
            showCase('lower', conversions.lower);
            
            // Title Case
            conversions.title = input.toLowerCase().replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase());
            showCase('title', conversions.title);
            
            // Sentence case
            conversions.sentence = input.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, match => match.toUpperCase());
            showCase('sentence', conversions.sentence);
            
            // camelCase
            conversions.camel = input
                .toLowerCase()
                .replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase())
                .replace(/^[A-Z]/, match => match.toLowerCase());
            showCase('camel', conversions.camel);
            
            // PascalCase
            conversions.pascal = input
                .toLowerCase()
                .replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase())
                .replace(/^[a-z]/, match => match.toUpperCase());
            showCase('pascal', conversions.pascal);
            
            // snake_case
            conversions.snake = input
                .replace(/([a-z])([A-Z])/g, '$1_$2')
                .replace(/[\s-]+/g, '_')
                .replace(/[^a-zA-Z0-9_]/g, '')
                .toLowerCase();
            showCase('snake', conversions.snake);
            
            // kebab-case
            conversions.kebab = input
                .replace(/([a-z])([A-Z])/g, '$1-$2')
                .replace(/[\s_]+/g, '-')
                .replace(/[^a-zA-Z0-9-]/g, '')
                .toLowerCase();
            showCase('kebab', conversions.kebab);
            
            // CONSTANT_CASE
            conversions.constant = input
                .replace(/([a-z])([A-Z])/g, '$1_$2')
                .replace(/[\s-]+/g, '_')
                .replace(/[^a-zA-Z0-9_]/g, '')
                .toUpperCase();
            showCase('constant', conversions.constant);
        }

        function showCase(type, text) {
            const elem = document.getElementById(type + 'Case');
            elem.textContent = text;
            elem.style.color = 'var(--white)';
        }

        function updateStats(text) {
            const chars = text.length;
            const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
            const lines = text === '' ? 0 : text.split('\n').length;
            
            document.getElementById('charCount').textContent = chars;
            document.getElementById('wordCount').textContent = words;
            document.getElementById('lineCount').textContent = lines;
        }

        function copyCase(type) {
            const text = conversions[type];
            if (!text) return showToast('Enter text first', true);
            
            navigator.clipboard.writeText(text).then(() => {
                showToast('Copied to clipboard!');
            });
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }