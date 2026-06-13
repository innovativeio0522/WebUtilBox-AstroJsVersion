function loadScript(src) {
            return new Promise((resolve, reject) => {
                if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
                const s = document.createElement('script');
                s.src = src; s.onload = resolve; s.onerror = reject;
                document.head.appendChild(s);
            });
        }

        let pdfDoc = null;
        let pdfBytes = null;
        let originalFileName = '';

        async function loadPDF() {
            const file = document.getElementById('pdfFile').files[0];
            if (!file) return;

            try {
                if (!window.PDFLib) {
                    await loadScript('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');
                }
                const { PDFDocument } = PDFLib;
                window._PDFDocument = PDFDocument;
                originalFileName = file.name.replace('.pdf', '');
                pdfBytes = await file.arrayBuffer();
                pdfDoc = await PDFDocument.load(pdfBytes);

                const pageCount = pdfDoc.getPageCount();

                document.getElementById('fileName').textContent = file.name;
                document.getElementById('totalPages').textContent = pageCount;
                document.getElementById('fileSize').textContent = formatFileSize(file.size);
                document.getElementById('startPage').max = pageCount;
                document.getElementById('endPage').max = pageCount;
                document.getElementById('endPage').value = pageCount;

                document.getElementById('pdfOptions').style.display = 'block';
                showToast('PDF loaded successfully!');
            } catch (error) {
                showToast('Error loading PDF: ' + error.message, true);
            }
        }

        function updateMode() {
            const mode = document.getElementById('splitMode').value;
            document.getElementById('rangeInput').style.display = mode === 'range' ? 'block' : 'none';
            document.getElementById('customInput').style.display = mode === 'custom' ? 'block' : 'none';
        }

        async function splitPDF() {
            if (!pdfDoc) {
                showToast('Please select a PDF file first', true);
                return;
            }

            const mode = document.getElementById('splitMode').value;
            const totalPages = pdfDoc.getPageCount();

            document.getElementById('progress').style.display = 'block';

            try {
                // PDFLib is guaranteed loaded since pdfDoc was created with it
                if (mode === 'all') {
                    await splitAllPages(totalPages);
                } else if (mode === 'range') {
                    await splitRange();
                } else if (mode === 'custom') {
                    await splitCustom();
                }

                document.getElementById('progress').style.display = 'none';
                showToast('PDF split successfully!');
            } catch (error) {
                document.getElementById('progress').style.display = 'none';
                showToast('Error splitting PDF: ' + error.message, true);
            }
        }

        async function splitAllPages(totalPages) {
            for (let i = 0; i < totalPages; i++) {
                document.getElementById('progressText').textContent = 
                    `Extracting page ${i + 1} of ${totalPages}...`;

                const newPdf = await window._PDFDocument.create();
                const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
                newPdf.addPage(copiedPage);

                const pdfBytes = await newPdf.save();
                downloadPDF(pdfBytes, `${originalFileName}_page_${i + 1}.pdf`);
            }
        }

        async function splitRange() {
            const start = parseInt(document.getElementById('startPage').value) - 1;
            const end = parseInt(document.getElementById('endPage').value) - 1;

            if (isNaN(start) || isNaN(end) || start < 0 || end >= pdfDoc.getPageCount() || start > end) {
                throw new Error('Invalid page range');
            }

            document.getElementById('progressText').textContent = 
                `Extracting pages ${start + 1} to ${end + 1}...`;

            const newPdf = await window._PDFDocument.create();
            const pageIndices = [];
            for (let i = start; i <= end; i++) {
                pageIndices.push(i);
            }

            const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
            copiedPages.forEach(page => newPdf.addPage(page));

            const pdfBytes = await newPdf.save();
            downloadPDF(pdfBytes, `${originalFileName}_pages_${start + 1}-${end + 1}.pdf`);
        }

        async function splitCustom() {
            const input = document.getElementById('customPages').value.trim();
            if (!input) {
                throw new Error('Please enter page numbers');
            }

            const pageIndices = parsePageNumbers(input, pdfDoc.getPageCount());
            if (pageIndices.length === 0) {
                throw new Error('No valid page numbers found');
            }

            document.getElementById('progressText').textContent = 
                `Extracting ${pageIndices.length} page(s)...`;

            const newPdf = await window._PDFDocument.create();
            const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
            copiedPages.forEach(page => newPdf.addPage(page));

            const pdfBytes = await newPdf.save();
            downloadPDF(pdfBytes, `${originalFileName}_custom.pdf`);
        }

        function parsePageNumbers(input, maxPages) {
            const pages = new Set();
            const parts = input.split(',');

            for (const part of parts) {
                const trimmed = part.trim();
                if (trimmed.includes('-')) {
                    const [start, end] = trimmed.split('-').map(n => parseInt(n.trim()));
                    if (!isNaN(start) && !isNaN(end) && start > 0 && end <= maxPages && start <= end) {
                        for (let i = start; i <= end; i++) {
                            pages.add(i - 1);
                        }
                    }
                } else {
                    const num = parseInt(trimmed);
                    if (!isNaN(num) && num > 0 && num <= maxPages) {
                        pages.add(num - 1);
                    }
                }
            }

            return Array.from(pages).sort((a, b) => a - b);
        }

        function downloadPDF(pdfBytes, filename) {
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        }

        function formatFileSize(bytes) {
            if (bytes < 1024) return bytes + ' B';
            if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
            return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }