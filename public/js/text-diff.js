function compareDiff() {
            const text1 = document.getElementById('text1').value;
            const text2 = document.getElementById('text2').value;
            
            if (!text1 && !text2) {
                document.getElementById('diffOutput').style.display = 'none';
                document.getElementById('statsBar').style.display = 'none';
                return;
            }
            
            const lines1 = text1.split('\n');
            const lines2 = text2.split('\n');
            
            const diff = computeDiff(lines1, lines2);
            displayDiff(diff);
            
            // Calculate stats
            let added = 0, removed = 0, changed = 0, identical = 0;
            diff.forEach(item => {
                if (item.type === 'added') added++;
                else if (item.type === 'removed') removed++;
                else if (item.type === 'changed') changed++;
                else identical++;
            });
            
            document.getElementById('addedCount').textContent = added;
            document.getElementById('removedCount').textContent = removed;
            document.getElementById('changedCount').textContent = changed;
            document.getElementById('identicalCount').textContent = identical;
            document.getElementById('statsBar').style.display = 'flex';
            document.getElementById('diffOutput').style.display = 'block';
        }
        
        function computeDiff(lines1, lines2) {
            const result = [];
            const maxLen = Math.max(lines1.length, lines2.length);
            
            for (let i = 0; i < maxLen; i++) {
                const line1 = lines1[i];
                const line2 = lines2[i];
                
                if (line1 === undefined) {
                    result.push({ type: 'added', line: line2, num: i + 1 });
                } else if (line2 === undefined) {
                    result.push({ type: 'removed', line: line1, num: i + 1 });
                } else if (line1 === line2) {
                    result.push({ type: 'identical', line: line1, num: i + 1 });
                } else {
                    result.push({ type: 'changed', line1: line1, line2: line2, num: i + 1 });
                }
            }
            
            return result;
        }
        
        function displayDiff(diff) {
            const content = document.getElementById('diffContent');
            let html = '';
            
            diff.forEach(item => {
                if (item.type === 'added') {
                    html += `<div style="background: rgba(52, 211, 153, 0.15); padding: 4px 8px; margin: 2px 0; border-left: 3px solid #34d399;">
                        <span style="color: #34d399; font-weight: bold; margin-right: 10px;">+</span>
                        <span style="color: #34d399;">${escapeHtml(item.line)}</span>
                    </div>`;
                } else if (item.type === 'removed') {
                    html += `<div style="background: rgba(248, 113, 113, 0.15); padding: 4px 8px; margin: 2px 0; border-left: 3px solid #f87171;">
                        <span style="color: #f87171; font-weight: bold; margin-right: 10px;">-</span>
                        <span style="color: #f87171;">${escapeHtml(item.line)}</span>
                    </div>`;
                } else if (item.type === 'changed') {
                    html += `<div style="background: rgba(248, 113, 113, 0.15); padding: 4px 8px; margin: 2px 0; border-left: 3px solid #f87171;">
                        <span style="color: #f87171; font-weight: bold; margin-right: 10px;">-</span>
                        <span style="color: #f87171;">${escapeHtml(item.line1)}</span>
                    </div>`;
                    html += `<div style="background: rgba(52, 211, 153, 0.15); padding: 4px 8px; margin: 2px 0; border-left: 3px solid #34d399;">
                        <span style="color: #34d399; font-weight: bold; margin-right: 10px;">+</span>
                        <span style="color: #34d399;">${escapeHtml(item.line2)}</span>
                    </div>`;
                } else {
                    html += `<div style="padding: 4px 8px; margin: 2px 0; color: var(--gray);">
                        <span style="margin-right: 10px; opacity: 0.5;"> </span>
                        ${escapeHtml(item.line)}
                    </div>`;
                }
            });
            
            content.innerHTML = html || '<div style="color: var(--gray);">No differences found</div>';
        }
        
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        function swapTexts() {
            const text1 = document.getElementById('text1').value;
            const text2 = document.getElementById('text2').value;
            
            document.getElementById('text1').value = text2;
            document.getElementById('text2').value = text1;
            
            compareDiff();
            showToast('Texts swapped');
        }
        
        function clearAll() {
            document.getElementById('text1').value = '';
            document.getElementById('text2').value = '';
            document.getElementById('diffOutput').style.display = 'none';
            document.getElementById('statsBar').style.display = 'none';
            showToast('Cleared');
        }
        
        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }