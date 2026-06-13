function updateCount() {
            const text = document.getElementById('inputText').value;
            
            // Basic counts
            const words = text.trim() === '' ? [] : text.trim().split(/\s+/);
            const wordCount = words.length;
            const charCount = text.length;
            const charCountNoSpace = text.replace(/\s/g, '').length;
            const lineCount = text === '' ? 0 : text.split('\n').length;
            
            // Sentences (split by . ! ?)
            const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
            const sentenceCount = sentences.length;
            
            // Paragraphs (split by double newline or single newline with content)
            const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
            const paragraphCount = paragraphs.length;
            
            // Reading time (200 words per minute)
            const readTime = Math.ceil(wordCount / 200);
            
            // Speaking time (130 words per minute)
            const speakTime = Math.ceil(wordCount / 130);
            
            // Average word length
            const totalChars = words.join('').length;
            const avgWordLength = wordCount > 0 ? (totalChars / wordCount).toFixed(1) : 0;
            
            // Longest word
            const longestWord = words.length > 0 
                ? words.reduce((a, b) => a.length > b.length ? a : b) 
                : '-';
            
            // Unique words
            const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
            
            // Average sentence length
            const avgSentence = sentenceCount > 0 ? Math.round(wordCount / sentenceCount) : 0;
            
            // Update main stats
            document.getElementById('wordCount').textContent = wordCount;
            document.getElementById('charCount').textContent = charCount;
            document.getElementById('charCountNoSpace').textContent = charCountNoSpace;
            document.getElementById('sentenceCount').textContent = sentenceCount;
            document.getElementById('paragraphCount').textContent = paragraphCount;
            document.getElementById('readTime').textContent = readTime;
            
            // Update detailed stats
            document.getElementById('lineCount').textContent = lineCount;
            document.getElementById('avgWordLength').textContent = avgWordLength;
            document.getElementById('longestWord').textContent = longestWord.length > 20 
                ? longestWord.substring(0, 20) + '...' 
                : longestWord;
            document.getElementById('uniqueWords').textContent = uniqueWords;
            document.getElementById('speakTime').textContent = speakTime + ' min';
            document.getElementById('avgSentence').textContent = avgSentence + ' words';
        }

        function clearText() {
            document.getElementById('inputText').value = '';
            updateCount();
            showToast('Text cleared');
        }

        function copyStats() {
            const stats = `
Word Count Statistics
--------------------
Words: ${document.getElementById('wordCount').textContent}
Characters: ${document.getElementById('charCount').textContent}
Characters (no spaces): ${document.getElementById('charCountNoSpace').textContent}
Sentences: ${document.getElementById('sentenceCount').textContent}
Paragraphs: ${document.getElementById('paragraphCount').textContent}
Lines: ${document.getElementById('lineCount').textContent}
Reading Time: ${document.getElementById('readTime').textContent} minutes
Speaking Time: ${document.getElementById('speakTime').textContent}
Average Word Length: ${document.getElementById('avgWordLength').textContent} characters
Unique Words: ${document.getElementById('uniqueWords').textContent}
            `.trim();
            
            navigator.clipboard.writeText(stats).then(() => {
                showToast('Statistics copied to clipboard!');
            });
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }

        // Initialize
        updateCount();