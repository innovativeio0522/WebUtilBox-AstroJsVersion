function generateSlug() {
            const text = document.getElementById('inputText').value;
            
            if (!text) {
                document.getElementById('outputText').textContent = 'Type above to generate slug...';
                document.getElementById('outputText').style.color = 'var(--gray)';
                document.getElementById('statsBar').style.display = 'none';
                return;
            }
            
            // Generate slug
            const slug = text.toString().toLowerCase()
                .trim()
                .replace(/\s+/g, '-')           // Replace spaces with -
                .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
                .replace(/\-\-+/g, '-')         // Replace multiple - with single -
                .replace(/^-+/, '')             // Trim - from start
                .replace(/-+$/, '');            // Trim - from end
            
            // Display slug
            document.getElementById('outputText').textContent = slug || 'invalid-slug';
            document.getElementById('outputText').style.color = slug ? 'var(--primary)' : 'var(--danger)';
            
            // Update stats
            document.getElementById('slugLength').textContent = slug.length;
            document.getElementById('originalLength').textContent = text.length;
            document.getElementById('statsBar').style.display = 'flex';
        }

        function copySlug() {
            const slug = document.getElementById('outputText').textContent;
            if (!slug || slug === 'Type above to generate slug...') {
                return showToast('Enter text first', true);
            }
            
            navigator.clipboard.writeText(slug).then(() => {
                showToast('Slug copied to clipboard!');
            });
        }

        function clearAll() {
            document.getElementById('inputText').value = '';
            generateSlug();
            showToast('Cleared');
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }