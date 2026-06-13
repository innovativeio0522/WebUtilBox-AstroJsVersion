function loadScript(src) {
            return new Promise((resolve, reject) => {
                if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
                const s = document.createElement('script');
                s.src = src; s.onload = resolve; s.onerror = reject;
                document.head.appendChild(s);
            });
        }

        let pdfFiles = [];

        async function loadPDFs() {
            const files = Array.from(document.getElementById('pdfFiles').files);
            
            for (const file of files) {
                if (file.type === 'application/pdf') {
                    const arrayBuffer = await file.arrayBuffer();
                    pdfFiles.push({
                        name: file.name,
                        size: file.size,
                        data: arrayBuffer
                    });
                }
            }

            if (pdfFiles.length > 0) {
                displayPDFs();
                document.getElementById('pdfList').style.display = 'block';
                showToast(`${files.length} PDF(s) loaded`);
            }
        }

        function displayPDFs() {
            const container = document.getElementById('pdfItems');
            container.innerHTML = '';

            pdfFiles.forEach((pdf, index) => {
                const item = document.createElement('div');
                item.className = 'pdf-item';
                item.draggable = true;
                item.dataset.index = index;

                item.innerHTML = `
                    <div class="drag-handle">?</div>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; margin-bottom: 4px;">${pdf.name}</div>
                        <div style="font-size: 0.85rem; color: var(--gray);">${formatFileSize(pdf.size)}</div>
                    </div>
                    <button onclick="removePDF(${index})" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 1.2rem;">?</button>
                `;

                item.addEventListener('dragstart', handleDragStart);
                item.addEventListener('dragover', handleDragOver);
                item.addEventListener('drop', handleDrop);
                item.addEventListener('dragend', handleDragEnd);

                container.appendChild(item);
            });

            document.getElementById('pdfCount').textContent = pdfFiles.length;
        }

        let draggedIndex = null;

        function handleDragStart(e) {
            draggedIndex = parseInt(e.target.dataset.index);
            e.target.classList.add('dragging');
        }

        function handleDragOver(e) {
            e.preventDefault();
        }

        function handleDrop(e) {
            e.preventDefault();
            const dropIndex = parseInt(e.target.closest('.pdf-item').dataset.index);
            
            if (draggedIndex !== null && draggedIndex !== dropIndex) {
                const draggedItem = pdfFiles[draggedIndex];
                pdfFiles.splice(draggedIndex, 1);
                pdfFiles.splice(dropIndex, 0, draggedItem);
                displayPDFs();
            }
        }

        function handleDragEnd(e) {
            e.target.classList.remove('dragging');
            draggedIndex = null;
        }

        function removePDF(index) {
            pdfFiles.splice(index, 1);
            if (pdfFiles.length === 0) {
                document.getElementById('pdfList').style.display = 'none';
            }
            displayPDFs();
            showToast('PDF removed');
        }

        function clearAll() {
            pdfFiles = [];
            document.getElementById('pdfList').style.display = 'none';
            document.getElementById('pdfFiles').value = '';
            showToast('All PDFs cleared');
        }

        async function mergePDFs() {
            if (pdfFiles.length < 2) {
                showToast('Please select at least 2 PDFs to merge', true);
                return;
            }

            document.getElementById('progress').style.display = 'block';
            document.getElementById('progressText').textContent = 'Loading library...';

            try {
                if (!window.PDFLib) {
                    await loadScript('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');
                }
                const { PDFDocument } = PDFLib;
                document.getElementById('progressText').textContent = 'Merging PDFs...';
                const mergedPdf = await PDFDocument.create();

                for (let i = 0; i < pdfFiles.length; i++) {
                    document.getElementById('progressText').textContent = 
                        `Processing ${i + 1} of ${pdfFiles.length}...`;

                    const pdf = await PDFDocument.load(pdfFiles[i].data);
                    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                    copiedPages.forEach((page) => mergedPdf.addPage(page));
                }

                document.getElementById('progressText').textContent = 'Generating merged PDF...';

                const mergedPdfBytes = await mergedPdf.save();
                const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.href = url;
                a.download = `merged_${Date.now()}.pdf`;
                a.click();

                document.getElementById('progress').style.display = 'none';
                showToast('PDFs merged successfully!');
            } catch (error) {
                document.getElementById('progress').style.display = 'none';
                showToast('Error merging PDFs: ' + error.message, true);
            }
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