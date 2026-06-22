function loadScript(src) {
            return new Promise((resolve, reject) => {
                if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
                const s = document.createElement('script');
                s.src = src; s.onload = resolve; s.onerror = reject;
                document.head.appendChild(s);
            });
        }

        let currentMode = 'pdfToImages';
        let pdfDoc = null;
        let imageFiles = [];

        function switchMode(mode) {
            currentMode = mode;
            document.querySelectorAll('.mode-tab').forEach(tab => tab.classList.remove('active'));
            document.getElementById(mode + 'Tab').classList.add('active');
            
            if (mode === 'pdfToImages') {
                document.getElementById('pdfToImagesMode').style.display = 'block';
                document.getElementById('imagesToPdfMode').style.display = 'none';
            } else {
                document.getElementById('pdfToImagesMode').style.display = 'none';
                document.getElementById('imagesToPdfMode').style.display = 'block';
            }
        }

        // ===== PDF TO IMAGES =====

        async function loadPDFForConversion() {
            const file = document.getElementById('pdfFile').files[0];
            if (!file) return;

            try {
                if (!window.pdfjsLib) {
                    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
                    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                }
                const arrayBuffer = await file.arrayBuffer();
                pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

                document.getElementById('pdfPageCount').textContent = pdfDoc.numPages;
                document.getElementById('pdfFileName').textContent = file.name;
                document.getElementById('pdfOptions').style.display = 'block';

                showToast('PDF loaded successfully!');
            } catch (error) {
                showToast('Error loading PDF: ' + error.message, true);
            }
        }

        document.getElementById('imageQuality').addEventListener('input', (e) => {
            document.getElementById('qualityValue').textContent = Math.round(e.target.value * 100);
        });

        async function convertPDFToImages() {
            if (!pdfDoc) {
                showToast('Please select a PDF file first', true);
                return;
            }

            document.getElementById('progress').style.display = 'block';
            const format = document.getElementById('imageFormat').value;
            const quality = parseFloat(document.getElementById('imageQuality').value);

            try {
                const images = [];

                for (let i = 1; i <= pdfDoc.numPages; i++) {
                    document.getElementById('progressText').textContent = 
                        `Converting page ${i} of ${pdfDoc.numPages}...`;

                    const page = await pdfDoc.getPage(i);
                    const viewport = page.getViewport({ scale: 2 });
                    
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;

                    await page.render({ canvasContext: context, viewport: viewport }).promise;

                    const blob = await new Promise(resolve => {
                        canvas.toBlob(resolve, `image/${format}`, quality);
                    });

                    images.push({ blob, pageNum: i });
                }

                document.getElementById('progressText').textContent = 'Preparing downloads...';

                // Download all images
                for (const img of images) {
                    const url = URL.createObjectURL(img.blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `page_${img.pageNum}.${format === 'jpeg' ? 'jpg' : 'png'}`;
                    a.click();
                    URL.revokeObjectURL(url);
                }

                document.getElementById('progress').style.display = 'none';
                showToast(`Converted ${images.length} pages to images!`);
            } catch (error) {
                document.getElementById('progress').style.display = 'none';
                showToast('Error converting PDF: ' + error.message, true);
            }
        }

        // ===== IMAGES TO PDF =====

        async function loadImages() {
            const files = Array.from(document.getElementById('imageFiles').files);
            
            for (const file of files) {
                if (file.type.startsWith('image/')) {
                    const url = URL.createObjectURL(file);
                    imageFiles.push({ file, url, name: file.name });
                }
            }

            if (imageFiles.length > 0) {
                displayImages();
                document.getElementById('imageList').style.display = 'block';
                showToast(`${files.length} image(s) loaded`);
            }
        }

        function displayImages() {
            const container = document.getElementById('imageItems');
            container.innerHTML = '';

            imageFiles.forEach((img, index) => {
                const item = document.createElement('div');
                item.className = 'image-item';
                item.draggable = true;
                item.dataset.index = index;

                item.innerHTML = `
                    <div style="font-size: 1.5rem; cursor: grab; color: var(--gray);">?</div>
                    <img src="${img.url}" class="image-preview" alt="${img.name}">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; margin-bottom: 4px;">${img.name}</div>
                        <div style="font-size: 0.85rem; color: var(--gray);">Page ${index + 1}</div>
                    </div>
                    <button onclick="removeImage(${index})" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 1.2rem;">?</button>
                `;

                item.addEventListener('dragstart', handleImageDragStart);
                item.addEventListener('dragover', handleImageDragOver);
                item.addEventListener('drop', handleImageDrop);

                container.appendChild(item);
            });

            document.getElementById('imageCount').textContent = imageFiles.length;
        }

        let draggedImageIndex = null;

        function handleImageDragStart(e) {
            draggedImageIndex = parseInt(e.target.dataset.index);
        }

        function handleImageDragOver(e) {
            e.preventDefault();
        }

        function handleImageDrop(e) {
            e.preventDefault();
            const closestItem = e.target.closest('.image-item');
            if (!closestItem) return;
            const dropIndex = parseInt(closestItem.dataset.index);
            
            if (draggedImageIndex !== null && draggedImageIndex !== dropIndex) {
                const draggedItem = imageFiles[draggedImageIndex];
                imageFiles.splice(draggedImageIndex, 1);
                imageFiles.splice(dropIndex, 0, draggedItem);
                displayImages();
            }
        }

        function removeImage(index) {
            URL.revokeObjectURL(imageFiles[index].url);
            imageFiles.splice(index, 1);
            if (imageFiles.length === 0) {
                document.getElementById('imageList').style.display = 'none';
            }
            displayImages();
        }

        function clearImages() {
            imageFiles.forEach(img => URL.revokeObjectURL(img.url));
            imageFiles = [];
            document.getElementById('imageList').style.display = 'none';
            document.getElementById('imageFiles').value = '';
            showToast('All images cleared');
        }

        async function convertImagesToPDF() {
            if (imageFiles.length === 0) {
                showToast('Please select at least one image', true);
                return;
            }

            document.getElementById('progress').style.display = 'block';

            try {
                if (!window.PDFLib) {
                    document.getElementById('progressText').textContent = 'Loading library...';
                    await loadScript('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');
                }
                const { PDFDocument } = PDFLib;
                const pdfDoc = await PDFDocument.create();
                const pageSize = document.getElementById('pageSize').value;
                const imageFit = document.getElementById('imageFit').value;

                for (let i = 0; i < imageFiles.length; i++) {
                    document.getElementById('progressText').textContent = 
                        `Adding image ${i + 1} of ${imageFiles.length}...`;

                    const imageBytes = await imageFiles[i].file.arrayBuffer();
                    let image;

                    if (imageFiles[i].file.type === 'image/png') {
                        image = await pdfDoc.embedPng(imageBytes);
                    } else {
                        image = await pdfDoc.embedJpg(imageBytes);
                    }

                    let pageWidth, pageHeight;

                    if (pageSize === 'auto') {
                        pageWidth = image.width;
                        pageHeight = image.height;
                    } else if (pageSize === 'a4') {
                        pageWidth = 595;
                        pageHeight = 842;
                    } else if (pageSize === 'letter') {
                        pageWidth = 612;
                        pageHeight = 792;
                    } else if (pageSize === 'a3') {
                        pageWidth = 842;
                        pageHeight = 1191;
                    }

                    const page = pdfDoc.addPage([pageWidth, pageHeight]);

                    if (imageFit === 'contain') {
                        const scale = Math.min(pageWidth / image.width, pageHeight / image.height);
                        const scaledWidth = image.width * scale;
                        const scaledHeight = image.height * scale;
                        const x = (pageWidth - scaledWidth) / 2;
                        const y = (pageHeight - scaledHeight) / 2;
                        page.drawImage(image, { x, y, width: scaledWidth, height: scaledHeight });
                    } else if (imageFit === 'cover') {
                        const scale = Math.max(pageWidth / image.width, pageHeight / image.height);
                        const scaledWidth = image.width * scale;
                        const scaledHeight = image.height * scale;
                        const x = (pageWidth - scaledWidth) / 2;
                        const y = (pageHeight - scaledHeight) / 2;
                        page.drawImage(image, { x, y, width: scaledWidth, height: scaledHeight });
                    } else {
                        page.drawImage(image, { x: 0, y: 0, width: pageWidth, height: pageHeight });
                    }
                }

                document.getElementById('progressText').textContent = 'Generating PDF...';

                const pdfBytes = await pdfDoc.save();
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.href = url;
                a.download = `images_to_pdf_${Date.now()}.pdf`;
                a.click();
                URL.revokeObjectURL(url);

                document.getElementById('progress').style.display = 'none';
                showToast('PDF created successfully!');
            } catch (error) {
                document.getElementById('progress').style.display = 'none';
                showToast('Error creating PDF: ' + error.message, true);
            }
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }