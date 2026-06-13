const input = document.getElementById('markdownInput');
        const previewDiv = document.getElementById('previewDiv');
        const htmlOutput = document.getElementById('htmlOutput');
        const previewTab = document.getElementById('previewTab');
        const htmlTab = document.getElementById('htmlTab');
        const copyBtn = document.getElementById('copyBtn');
        const loadBtn = document.getElementById('loadBtn');

        let currentTab = 'preview';

        if (typeof marked !== 'undefined') {
            marked.setOptions({ breaks: true, gfm: true });
        }

        input.addEventListener('input', convert);

        function convert() {
            const md = input.value;
            if (!md.trim()) {
                previewDiv.innerHTML = '<div style="color: #666; text-align: center; padding: 40px;">Enter Markdown to see preview...</div>';
                htmlOutput.value = '';
                return;
            }
            try {
                const html = marked.parse(md);
                previewDiv.innerHTML = html;
                htmlOutput.value = html;
            } catch (e) {
                previewDiv.innerHTML = '<div style="color: red;">Error: ' + e.message + '</div>';
            }
        }

        previewTab.addEventListener('click', () => {
            currentTab = 'preview';
            previewTab.style.background = 'var(--primary)';
            previewTab.style.border = 'none';
            htmlTab.style.background = 'var(--dark)';
            htmlTab.style.border = '1px solid var(--border)';
            previewDiv.style.display = 'block';
            htmlOutput.style.display = 'none';
        });

        htmlTab.addEventListener('click', () => {
            currentTab = 'html';
            htmlTab.style.background = 'var(--primary)';
            htmlTab.style.border = 'none';
            previewTab.style.background = 'var(--dark)';
            previewTab.style.border = '1px solid var(--border)';
            previewDiv.style.display = 'none';
            htmlOutput.style.display = 'block';
        });

        copyBtn.addEventListener('click', () => {
            if (!htmlOutput.value) {
                showToast('No HTML to copy', true);
                return;
            }
            navigator.clipboard.writeText(htmlOutput.value).then(() => {
                showToast('HTML copied!');
            });
        });

        loadBtn.addEventListener('click', () => {
            input.value = '# Markdown to HTML\n\n## Features\n\n- **Bold** and *italic*\n- [Links](https://example.com)\n- `Code`\n\n```javascript\nfunction hello() {\n  return "world";\n}\n```';
            convert();
            showToast('Sample loaded!');
        });

        function showToast(msg, isError) {
            const toast = document.getElementById('toast');
            const toastMsg = document.getElementById('toastMessage');
            toastMsg.textContent = msg;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }

        const style = document.createElement('style');
        style.textContent = '#previewDiv h1, #previewDiv h2 { border-bottom: 1px solid #eee; padding-bottom: 8px; } #previewDiv code { background: #f6f8fa; padding: 2px 6px; border-radius: 3px; } #previewDiv pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow-x: auto; }';
        document.head.appendChild(style);