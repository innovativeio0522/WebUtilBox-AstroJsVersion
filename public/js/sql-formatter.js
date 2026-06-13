const inputSQL = document.getElementById('inputSQL');
        const outputSQL = document.getElementById('outputSQL');
        const formatBtn = document.getElementById('formatBtn');
        const copyBtn = document.getElementById('copyBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        const minifyBtn = document.getElementById('minifyBtn');
        const loadSampleBtn = document.getElementById('loadSampleBtn');
        const clearBtn = document.getElementById('clearBtn');
        const validateBtn = document.getElementById('validateBtn');
        const countBtn = document.getElementById('countBtn');
        const infoBox = document.getElementById('infoBox');
        const infoContent = document.getElementById('infoContent');

        const SQL_KEYWORDS = [
            'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER', 'FULL',
            'ON', 'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE', 'IS', 'NULL',
            'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET',
            'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
            'CREATE', 'TABLE', 'ALTER', 'DROP', 'INDEX', 'VIEW',
            'AS', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN',
            'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
            'UNION', 'ALL', 'EXISTS', 'ANY', 'SOME'
        ];

        // Update stats on input
        requestIdleCallback(() => {
            inputSQL.addEventListener('input', updateInputStats);
        }, { timeout: 2000 });

        function updateInputStats() {
            const text = inputSQL.value;
            const lines = text ? text.split('\n').length : 0;
            const chars = text.length;
            
            document.getElementById('inputLines').textContent = lines;
            document.getElementById('inputChars').textContent = chars;
        }

        function updateOutputStats() {
            const text = outputSQL.value;
            const lines = text ? text.split('\n').length : 0;
            const chars = text.length;
            
            document.getElementById('outputLines').textContent = lines;
            document.getElementById('outputChars').textContent = chars;
        }

        // Format SQL
        requestIdleCallback(() => { formatBtn.addEventListener('click', formatSQL); }, { timeout: 2000 });

        function formatSQL() {
            const input = inputSQL.value.trim();
            
            if (!input) {
                showToast('Please enter SQL query', true);
                return;
            }

            try {
                let sql = input;
                
                // Remove comments if option is checked
                if (document.getElementById('removeComments').checked) {
                    sql = sql.replace(/--.*$/gm, '');
                    sql = sql.replace(/\/\*[\s\S]*?\*\//g, '');
                }

                // Get options
                const uppercase = document.getElementById('uppercase').checked;
                const newlineBeforeKeyword = document.getElementById('newlineBeforeKeyword').checked;
                const commaNewline = document.getElementById('commaNewline').checked;
                const indentSize = document.getElementById('indentSize').value;
                const indent = indentSize === 'tab' ? '\t' : ' '.repeat(parseInt(indentSize));

                // Normalize whitespace
                sql = sql.replace(/\s+/g, ' ').trim();

                // Uppercase keywords
                if (uppercase) {
                    SQL_KEYWORDS.forEach(keyword => {
                        const regex = new RegExp('\\b' + keyword + '\\b', 'gi');
                        sql = sql.replace(regex, keyword.toUpperCase());
                    });
                }

                // Add newlines before major keywords
                if (newlineBeforeKeyword) {
                    const majorKeywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 
                                          'RIGHT JOIN', 'ORDER BY', 'GROUP BY', 'HAVING', 'UNION', 
                                          'INSERT INTO', 'UPDATE', 'DELETE FROM', 'CREATE', 'ALTER', 'DROP'];
                    
                    majorKeywords.forEach(keyword => {
                        const regex = new RegExp('\\b' + keyword + '\\b', 'gi');
                        sql = sql.replace(regex, '\n' + keyword);
                    });
                }

                // Handle commas
                if (commaNewline) {
                    sql = sql.replace(/,\s*/g, ',\n' + indent);
                } else {
                    sql = sql.replace(/,\s*/g, ', ');
                }

                // Add indentation
                const lines = sql.split('\n');
                let indentLevel = 0;
                const formatted = [];

                lines.forEach(line => {
                    line = line.trim();
                    if (!line) return;

                    // Decrease indent for closing keywords
                    if (/^\)/i.test(line)) {
                        indentLevel = Math.max(0, indentLevel - 1);
                    }

                    // Add indented line
                    formatted.push(indent.repeat(indentLevel) + line);

                    // Increase indent for opening keywords
                    if (/\($/.test(line) || /\bCASE\b/i.test(line)) {
                        indentLevel++;
                    }
                    
                    // Decrease indent after END
                    if (/\bEND\b/i.test(line)) {
                        indentLevel = Math.max(0, indentLevel - 1);
                    }
                });

                outputSQL.value = formatted.join('\n');
                updateOutputStats();
                infoBox.style.display = 'none';
                showToast('SQL formatted successfully!');
            } catch (error) {
                showToast('Error formatting SQL: ' + error.message, true);
            }
        }

        // Minify SQL
        requestIdleCallback(() => {
            minifyBtn.addEventListener('click', () => {
                const input = inputSQL.value.trim();
                
                if (!input) {
                    showToast('Please enter SQL query', true);
                    return;
                }

                let sql = input;
                sql = sql.replace(/--.*$/gm, '');
                sql = sql.replace(/\/\*[\s\S]*?\*\//g, '');
                sql = sql.replace(/\s+/g, ' ').trim();
                
                outputSQL.value = sql;
                updateOutputStats();
                infoBox.style.display = 'none';
                showToast('SQL minified!');
            });

            // Validate SQL
            validateBtn.addEventListener('click', () => {
                const input = inputSQL.value.trim();
                
                if (!input) {
                    showToast('Please enter SQL query', true);
                    return;
                }

                const issues = [];
                
                const openParens = (input.match(/\(/g) || []).length;
                const closeParens = (input.match(/\)/g) || []).length;
                
                if (openParens !== closeParens) {
                    issues.push('?? Unmatched parentheses: ' + openParens + ' open, ' + closeParens + ' close');
                }

                const hasSelect = /\bSELECT\b/i.test(input);
                const hasFrom = /\bFROM\b/i.test(input);
                
                if (hasSelect && !hasFrom) {
                    issues.push('?? SELECT statement without FROM clause');
                }

                const singleQuotes = (input.match(/'/g) || []).length;
                if (singleQuotes % 2 !== 0) {
                    issues.push('?? Unmatched single quotes');
                }

                if (issues.length === 0) {
                    infoContent.innerHTML = '? No obvious syntax issues found<br><small>Note: This is a basic validation. Test in your database for complete validation.</small>';
                } else {
                    infoContent.innerHTML = issues.join('<br>');
                }

                infoBox.style.display = 'block';
            });

            // Count keywords
            countBtn.addEventListener('click', () => {
                const input = inputSQL.value.trim();
                
                if (!input) {
                    showToast('Please enter SQL query', true);
                    return;
                }

                const counts = {};
                SQL_KEYWORDS.forEach(keyword => {
                    const regex = new RegExp('\\b' + keyword + '\\b', 'gi');
                    const matches = input.match(regex);
                    if (matches) {
                        counts[keyword] = matches.length;
                    }
                });

                let html = '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">';
                Object.entries(counts).forEach(([keyword, count]) => {
                    html += '<div>' + keyword + ': <span style="color: var(--primary);">' + count + '</span></div>';
                });
                html += '</div>';

                infoContent.innerHTML = html;
                infoBox.style.display = 'block';
            });

            // Copy
            copyBtn.addEventListener('click', () => {
                if (!outputSQL.value) {
                    showToast('No output to copy', true);
                    return;
                }

                navigator.clipboard.writeText(outputSQL.value).then(() => {
                    showToast('Copied to clipboard!');
                }).catch(() => {
                    showToast('Failed to copy', true);
                });
            });

            // Download
            downloadBtn.addEventListener('click', () => {
                if (!outputSQL.value) {
                    showToast('No output to download', true);
                    return;
                }

                const blob = new Blob([outputSQL.value], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'formatted_query_' + Date.now() + '.sql';
                a.click();
                URL.revokeObjectURL(url);
                showToast('File downloaded!');
            });

            // Load sample
            loadSampleBtn.addEventListener('click', () => {
                inputSQL.value = `SELECT u.id, u.username, u.email, COUNT(o.id) as order_count, SUM(o.total) as total_spent FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.status = 'active' AND u.created_at >= '2024-01-01' GROUP BY u.id, u.username, u.email HAVING COUNT(o.id) > 0 ORDER BY total_spent DESC LIMIT 10;`;
                updateInputStats();
                showToast('Sample loaded!');
            });

            // Clear
            clearBtn.addEventListener('click', () => {
                inputSQL.value = '';
                outputSQL.value = '';
                updateInputStats();
                updateOutputStats();
                infoBox.style.display = 'none';
                showToast('Cleared');
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
        requestIdleCallback(() => {
            updateInputStats();
            updateOutputStats();
        }, { timeout: 2000 });