function updateFlags() {
            let flags = '';
            if (document.getElementById('flagG').checked) flags += 'g';
            if (document.getElementById('flagI').checked) flags += 'i';
            if (document.getElementById('flagM').checked) flags += 'm';
            if (document.getElementById('flagS').checked) flags += 's';
            document.getElementById('regexFlags').value = flags;
            testRegex();
        }

        function testRegex() {
            const pattern = document.getElementById('regexPattern').value;
            const flags = document.getElementById('regexFlags').value;
            const testStr = document.getElementById('testString').value;
            
            if (!pattern) {
                document.getElementById('statsBar').style.display = 'none';
                document.getElementById('highlightOutput').style.display = 'none';
                document.getElementById('matchDetails').style.display = 'none';
                return;
            }
            
            try {
                const regex = new RegExp(pattern, flags);
                const matches = [...testStr.matchAll(new RegExp(pattern, flags.includes('g') ? flags : flags + 'g'))];
                
                // Update stats
                document.getElementById('matchCount').textContent = matches.length;
                document.getElementById('groupCount').textContent = matches.length > 0 ? matches[0].length - 1 : 0;
                document.getElementById('validStatus').innerHTML = '<span style="color: var(--secondary);">? Valid Pattern</span>';
                document.getElementById('statsBar').style.display = 'flex';
                
                if (testStr && matches.length > 0) {
                    // Highlight matches
                    highlightMatches(testStr, matches);
                    
                    // Show match details
                    showMatchDetails(matches);
                    
                    document.getElementById('highlightOutput').style.display = 'block';
                    document.getElementById('matchDetails').style.display = 'block';
                } else if (testStr) {
                    document.getElementById('highlightedText').textContent = testStr;
                    document.getElementById('highlightOutput').style.display = 'block';
                    document.getElementById('matchDetails').style.display = 'none';
                } else {
                    document.getElementById('highlightOutput').style.display = 'none';
                    document.getElementById('matchDetails').style.display = 'none';
                }
                
            } catch (e) {
                document.getElementById('validStatus').innerHTML = '<span style="color: var(--danger);">? Invalid Pattern</span>';
                document.getElementById('matchCount').textContent = '0';
                document.getElementById('groupCount').textContent = '0';
                document.getElementById('statsBar').style.display = 'flex';
                document.getElementById('highlightOutput').style.display = 'none';
                document.getElementById('matchDetails').style.display = 'none';
            }
        }

        function highlightMatches(text, matches) {
            const highlighted = document.getElementById('highlightedText');
            let result = '';
            let lastIndex = 0;
            
            matches.forEach(match => {
                const matchStart = match.index;
                const matchEnd = matchStart + match[0].length;
                
                // Add text before match
                result += escapeHtml(text.substring(lastIndex, matchStart));
                
                // Add highlighted match
                result += `<span style="background: rgba(249, 115, 22, 0.3); color: var(--primary); font-weight: bold; padding: 2px 4px; border-radius: 3px;">${escapeHtml(match[0])}</span>`;
                
                lastIndex = matchEnd;
            });
            
            // Add remaining text
            result += escapeHtml(text.substring(lastIndex));
            
            highlighted.innerHTML = result;
        }

        function showMatchDetails(matches) {
            const list = document.getElementById('matchList');
            let html = '';
            
            matches.forEach((match, i) => {
                html += `<div style="margin-bottom: 15px; padding: 12px; background: var(--light); border-radius: 6px; border-left: 3px solid var(--primary);">`;
                html += `<div style="color: var(--primary); font-weight: bold; margin-bottom: 8px;">Match ${i + 1} (index ${match.index})</div>`;
                html += `<div style="margin-bottom: 6px;"><span style="color: var(--gray);">Full match:</span> <code style="background: var(--input-bg); padding: 2px 6px; border-radius: 3px; color: var(--white);">${escapeHtml(match[0])}</code></div>`;
                
                if (match.length > 1) {
                    html += `<div style="color: var(--gray); margin-top: 8px; margin-bottom: 4px;">Capture Groups:</div>`;
                    for (let j = 1; j < match.length; j++) {
                        html += `<div style="margin-left: 15px; margin-bottom: 4px;"><span style="color: var(--gray);">Group ${j}:</span> <code style="background: var(--input-bg); padding: 2px 6px; border-radius: 3px; color: var(--secondary);">${escapeHtml(match[j] || '(empty)')}</code></div>`;
                    }
                }
                
                html += `</div>`;
            });
            
            list.innerHTML = html;
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }