const title = document.getElementById('title');
        const description = document.getElementById('description');
        const keywords = document.getElementById('keywords');
        const author = document.getElementById('author');
        const canonical = document.getElementById('canonical');
        const ogTitle = document.getElementById('ogTitle');
        const ogDescription = document.getElementById('ogDescription');
        const ogImage = document.getElementById('ogImage');
        const ogType = document.getElementById('ogType');
        const ogUrl = document.getElementById('ogUrl');
        const twitterCard = document.getElementById('twitterCard');
        const twitterSite = document.getElementById('twitterSite');
        const twitterCreator = document.getElementById('twitterCreator');
        const output = document.getElementById('output');
        const generateBtn = document.getElementById('generateBtn');
        const copyBtn = document.getElementById('copyBtn');

        // Character counters
        title.addEventListener('input', () => {
            document.getElementById('titleCount').textContent = title.value.length;
            updatePreview();
        });

        description.addEventListener('input', () => {
            document.getElementById('descCount').textContent = description.value.length;
            updatePreview();
        });

        // Update preview on OG changes
        ogTitle.addEventListener('input', updatePreview);
        ogDescription.addEventListener('input', updatePreview);
        ogImage.addEventListener('input', updatePreview);

        function updatePreview() {
            const titleText = title.value || 'Your Page Title';
            const descText = description.value || 'Your page description will appear here...';
            const ogTitleText = ogTitle.value || titleText;
            const ogDescText = ogDescription.value || descText;

            document.getElementById('previewTitle').textContent = titleText;
            document.getElementById('previewDesc').textContent = descText;
            document.getElementById('previewOgTitle').textContent = ogTitleText;
            document.getElementById('previewOgDesc').textContent = ogDescText;

            if (ogImage.value) {
                document.getElementById('previewImage').innerHTML = '<img src="' + escapeHtml(ogImage.value) + '" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;" onerror="this.style.display=\'none\'">';
            } else {
                document.getElementById('previewImage').innerHTML = '1200 x 630';
            }
        }

        generateBtn.addEventListener('click', generateMetaTags);

        function generateMetaTags() {
            if (!title.value.trim()) {
                showToast('Please enter a page title', true);
                return;
            }

            let html = '<!-- Basic Meta Tags -->\n';
            html += '<meta charset="UTF-8">\n';
            html += '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<link rel="icon" type="image/svg+xml" href="../favicon.svg">\n';
            html += '<title>' + escapeHtml(title.value) + '</title>\n';

            if (description.value) {
                html += '<meta name="description" content="' + escapeHtml(description.value) + '">\n';
            }

            if (keywords.value) {
                html += '<meta name="keywords" content="' + escapeHtml(keywords.value) + '">\n';
            }

            if (author.value) {
                html += '<meta name="author" content="' + escapeHtml(author.value) + '">\n';
            }

            if (canonical.value) {
                html += '<link rel="canonical" href="' + escapeHtml(canonical.value) + '">\n';
            }

            // Open Graph
            html += '\n<!-- Open Graph Meta Tags -->\n';
            html += '<meta property="og:title" content="' + escapeHtml(ogTitle.value || title.value) + '">\n';
            
            if (ogDescription.value || description.value) {
                html += '<meta property="og:description" content="' + escapeHtml(ogDescription.value || description.value) + '">\n';
            }

            html += '<meta property="og:type" content="' + escapeHtml(ogType.value) + '">\n';

            if (ogUrl.value || canonical.value) {
                html += '<meta property="og:url" content="' + escapeHtml(ogUrl.value || canonical.value) + '">\n';
            }

            if (ogImage.value) {
                html += '<meta property="og:image" content="' + escapeHtml(ogImage.value) + '">\n';
                html += '<meta property="og:image:width" content="1200">\n';
                html += '<meta property="og:image:height" content="630">\n';
            }

            // Twitter Card
            html += '\n<!-- Twitter Card Meta Tags -->\n';
            html += '<meta name="twitter:card" content="' + escapeHtml(twitterCard.value) + '">\n';
            html += '<meta name="twitter:title" content="' + escapeHtml(ogTitle.value || title.value) + '">\n';

            if (ogDescription.value || description.value) {
                html += '<meta name="twitter:description" content="' + escapeHtml(ogDescription.value || description.value) + '">\n';
            }

            if (ogImage.value) {
                html += '<meta name="twitter:image" content="' + escapeHtml(ogImage.value) + '">\n';
            }

            if (twitterSite.value) {
                html += '<meta name="twitter:site" content="' + escapeHtml(twitterSite.value) + '">\n';
            }

            if (twitterCreator.value) {
                html += '<meta name="twitter:creator" content="' + escapeHtml(twitterCreator.value) + '">\n';
            }

            // Additional SEO tags
            html += '\n<!-- Additional SEO Tags -->\n';
            html += '<meta name="robots" content="index, follow">\n';
            html += '<meta name="language" content="English">\n';
            html += '<meta name="revisit-after" content="7 days">\n';

            output.value = html;
            showToast('Meta tags generated!');
        }

        copyBtn.addEventListener('click', () => {
            if (!output.value) {
                showToast('Generate meta tags first', true);
                return;
            }

            navigator.clipboard.writeText(output.value).then(() => {
                showToast('Copied to clipboard!');
            }).catch(() => {
                showToast('Failed to copy', true);
            });
        });

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

        // Initialize
        updatePreview();