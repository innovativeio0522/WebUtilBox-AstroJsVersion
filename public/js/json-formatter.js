let currentFormat = 'json';

        function switchFormat(format) {
            currentFormat = format;
            
            // Update tabs
            document.querySelectorAll('.format-tab').forEach(tab => tab.classList.remove('active'));
            document.getElementById(format + 'Tab').classList.add('active');
            
            // Update labels and placeholders
            const inputLabel = document.getElementById('inputLabel');
            const inputText = document.getElementById('inputText');
            
            if (format === 'json') {
                inputLabel.textContent = 'JSON Input';
                inputText.placeholder = '{"example": "value", "nested": {"key": "data"}}';
            } else if (format === 'yaml') {
                inputLabel.textContent = 'YAML Input';
                inputText.placeholder = 'example: value\nnested:\n  key: data';
            } else if (format === 'xml') {
                inputLabel.textContent = 'XML Input';
                inputText.placeholder = '<root>\n  <example>value</example>\n  <nested>\n    <key>data</key>\n  </nested>\n</root>';
            }
        }

        function formatData() {
            const input = document.getElementById('inputText').value;
            
            try {
                if (currentFormat === 'json') {
                    const parsed = JSON.parse(input);
                    showOutput(JSON.stringify(parsed, null, 2));
                    showToast('JSON formatted successfully!');
                } else if (currentFormat === 'yaml') {
                    const parsed = jsyaml.load(input);
                    showOutput(jsyaml.dump(parsed, { indent: 2, lineWidth: -1 }));
                    showToast('YAML formatted successfully!');
                } else if (currentFormat === 'xml') {
                    const formatted = formatXML(input);
                    showOutput(formatted);
                    showToast('XML formatted successfully!');
                }
            } catch (e) {
                showOutput('❌ Invalid ' + currentFormat.toUpperCase() + ': ' + e.message, true);
                showToast('Invalid ' + currentFormat.toUpperCase(), true);
            }
        }

        function minifyData() {
            const input = document.getElementById('inputText').value;
            
            try {
                if (currentFormat === 'json') {
                    const parsed = JSON.parse(input);
                    showOutput(JSON.stringify(parsed));
                    showToast('JSON minified successfully!');
                } else if (currentFormat === 'yaml') {
                    const parsed = jsyaml.load(input);
                    showOutput(jsyaml.dump(parsed, { flowLevel: 0 }));
                    showToast('YAML minified successfully!');
                } else if (currentFormat === 'xml') {
                    const minified = input.replace(/>\s+</g, '><').trim();
                    showOutput(minified);
                    showToast('XML minified successfully!');
                }
            } catch (e) {
                showOutput('❌ Invalid ' + currentFormat.toUpperCase() + ': ' + e.message, true);
                showToast('Invalid ' + currentFormat.toUpperCase(), true);
            }
        }

        function validateData() {
            const input = document.getElementById('inputText').value;
            
            try {
                if (currentFormat === 'json') {
                    JSON.parse(input);
                    showOutput('✅ Valid JSON!');
                    showToast('Valid JSON!');
                } else if (currentFormat === 'yaml') {
                    jsyaml.load(input);
                    showOutput('✅ Valid YAML!');
                    showToast('Valid YAML!');
                } else if (currentFormat === 'xml') {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(input, 'text/xml');
                    const error = doc.querySelector('parsererror');
                    if (error) {
                        throw new Error(error.textContent);
                    }
                    showOutput('✅ Valid XML!');
                    showToast('Valid XML!');
                }
            } catch (e) {
                showOutput('❌ Invalid: ' + e.message, true);
                showToast('Invalid ' + currentFormat.toUpperCase(), true);
            }
        }

        function formatXML(xml) {
            const PADDING = '  ';
            const reg = /(>)(<)(\/*)/g;
            let formatted = '';
            let pad = 0;

            xml = xml.replace(reg, '$1\n$2$3');
            
            xml.split('\n').forEach((node) => {
                let indent = 0;
                if (node.match(/.+<\/\w[^>]*>$/)) {
                    indent = 0;
                } else if (node.match(/^<\/\w/) && pad > 0) {
                    pad -= 1;
                } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
                    indent = 1;
                } else {
                    indent = 0;
                }

                formatted += PADDING.repeat(pad) + node + '\n';
                pad += indent;
            });

            return formatted.trim();
        }

        function showOutput(text, isError = false) {
            const container = document.getElementById('outputContainer');
            const content = document.getElementById('outputText');
            content.textContent = text;
            container.classList.add('show');
            container.style.borderLeftColor = isError ? 'var(--danger)' : 'var(--secondary)';
        }

        function copyOutput() {
            const text = document.getElementById('outputText')?.textContent;
            if (!text) return showToast('Nothing to copy', true);
            navigator.clipboard.writeText(text).then(() => {
                showToast('Copied to clipboard!');
            });
        }

        function toggleFaq(btn) {
            btn.classList.toggle('open');
            btn.nextElementSibling.classList.toggle('open');
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }