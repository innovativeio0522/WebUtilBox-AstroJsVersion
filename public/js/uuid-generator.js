let totalGenerated = 0;

        function generateUUID() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }

        function formatUUID(uuid, format) {
            switch(format) {
                case 'compact':
                    return uuid.replace(/-/g, '');
                case 'uppercase':
                    return uuid.toUpperCase();
                case 'braces':
                    return '{' + uuid + '}';
                default:
                    return uuid;
            }
        }

        function generateUUIDs() {
            const count = parseInt(document.getElementById('uuidCount').value) || 1;
            const format = document.getElementById('uuidFormat').value;
            
            if (count < 1 || count > 100) {
                showToast('Enter a number between 1 and 100', true);
                return;
            }
            
            const uuids = [];
            for (let i = 0; i < count; i++) {
                const uuid = generateUUID();
                uuids.push(formatUUID(uuid, format));
            }
            
            displayUUIDs(uuids);
            totalGenerated += count;
            document.getElementById('totalCount').textContent = totalGenerated;
            
            showToast(`Generated ${count} UUID${count !== 1 ? 's' : ''}`);
        }

        function displayUUIDs(uuids) {
            const list = document.getElementById('uuidList');
            
            if (list.querySelector('div[style*="color: var(--gray)"]')) {
                list.innerHTML = '';
            }
            
            uuids.forEach(uuid => {
                const item = document.createElement('div');
                item.style.cssText = 'padding: 8px 10px; margin-bottom: 6px; background: var(--light); border-radius: 6px; cursor: pointer; transition: all 0.2s; border: 1px solid var(--border); color: var(--white);';
                item.textContent = uuid;
                
                item.onmouseover = function() {
                    this.style.background = 'var(--border)';
                    this.style.borderColor = 'var(--primary)';
                };
                item.onmouseout = function() {
                    this.style.background = 'var(--light)';
                    this.style.borderColor = 'var(--border)';
                };
                item.onclick = function() {
                    navigator.clipboard.writeText(uuid).then(() => {
                        showToast('UUID copied!');
                    });
                };
                
                list.appendChild(item);
            });
            
            // Scroll to bottom
            list.scrollTop = list.scrollHeight;
        }

        function copyAll() {
            const list = document.getElementById('uuidList');
            const items = list.querySelectorAll('div[style*="padding"]');
            
            if (items.length === 0) {
                showToast('Generate UUIDs first', true);
                return;
            }
            
            const uuids = Array.from(items).map(item => item.textContent).join('\n');
            
            navigator.clipboard.writeText(uuids).then(() => {
                showToast(`Copied ${items.length} UUID${items.length !== 1 ? 's' : ''}!`);
            });
        }

        function clearAll() {
            const list = document.getElementById('uuidList');
            list.innerHTML = '<div style="color: var(--gray); text-align: center; padding: 50px 20px;">Click "Generate" to create UUIDs...</div>';
            showToast('Cleared');
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }

        // Generate one UUID on page load
        window.onload = function() {
            generateUUIDs();
        };