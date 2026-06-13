function parseURL() {
            const input = document.getElementById('urlInput').value.trim();
            if (!input) {
                document.getElementById('output').style.display = 'none';
                return;
            }

            try {
                const url = new URL(input);
                
                document.getElementById('fullUrl').textContent = url.href;
                document.getElementById('protocol').textContent = url.protocol;
                document.getElementById('host').textContent = url.host;
                document.getElementById('hostname').textContent = url.hostname;
                document.getElementById('port').textContent = url.port || '(default)';
                document.getElementById('pathname').textContent = url.pathname;
                document.getElementById('search').textContent = url.search || '(none)';
                document.getElementById('hash').textContent = url.hash || '(none)';
                document.getElementById('origin').textContent = url.origin;

                // Parse query parameters
                const params = new URLSearchParams(url.search);
                const paramsBody = document.getElementById('paramsBody');
                paramsBody.innerHTML = '';

                if (params.toString()) {
                    params.forEach((value, key) => {
                        const row = paramsBody.insertRow();
                        row.innerHTML = `
                            <td style="padding: 8px; font-family: monospace;">${escapeHTML(key)}</td>
                            <td style="padding: 8px; font-family: monospace; color: var(--gray);">${escapeHTML(value)}</td>
                            <td style="padding: 8px; font-family: monospace; color: var(--primary);">${escapeHTML(decodeURIComponent(value))}</td>
                        `;
                    });
                    document.getElementById('paramsSection').style.display = 'block';
                } else {
                    document.getElementById('paramsSection').style.display = 'none';
                }

                document.getElementById('output').style.display = 'block';
                
            } catch (e) {
                showToast('Invalid URL format', true);
                document.getElementById('output').style.display = 'none';
            }
        }

        function loadSample() {
            document.getElementById('urlInput').value = 'https://example.com:8080/path/to/page?name=John%20Doe&age=30&city=New%20York#section-1';
            parseURL();
            showToast('Sample URL loaded');
        }

        function escapeHTML(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }