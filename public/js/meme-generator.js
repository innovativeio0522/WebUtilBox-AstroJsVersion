let originalImage = null;
        let canvas, ctx;
        let currentFilter = 'none';
        let textAlignment = 'center';
        let emojis = []; // Array to store emoji objects {emoji, x, y, size}
        let draggedEmoji = null;
        let canvasRect = null;
        let eventListenersBound = false;

        // Drag and drop + text shadow init
        requestIdleCallback(() => {
            const dropZone = document.getElementById('dropZone');
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.style.borderColor = 'var(--primary)';
                dropZone.style.background = 'rgba(249, 115, 22, 0.1)';
            });
            dropZone.addEventListener('dragleave', () => {
                dropZone.style.borderColor = 'var(--border)';
                dropZone.style.background = 'transparent';
            });
            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.style.borderColor = 'var(--border)';
                dropZone.style.background = 'transparent';
                if (e.dataTransfer.files.length) {
                    handleFile(e.dataTransfer.files[0]);
                }
            });

            // Text shadow toggle
            document.getElementById('textShadow').addEventListener('change', function() {
                document.getElementById('shadowControls').style.display = this.checked ? 'block' : 'none';
            });
        }, { timeout: 2000 });

        function handleFile(file) {
            if (!file || !file.type.startsWith('image/')) {
                showToast('Please select an image', true);
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                originalImage = new Image();
                originalImage.onload = () => {
                    initCanvas();
                    document.getElementById('uploadArea').style.display = 'none';
                    document.getElementById('previewArea').style.display = 'block';
                    document.getElementById('controls').style.display = 'block';
                };
                originalImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        function initCanvas() {
            canvas = document.getElementById('canvas');
            ctx = canvas.getContext('2d');

            const maxWidth = 500;
            const scale = Math.min(1, maxWidth / originalImage.width);
            canvas.width = originalImage.width * scale;
            canvas.height = originalImage.height * scale;

            // Add mouse events for emoji dragging directly on canvas (only once)
            if (!eventListenersBound) {
                canvas.addEventListener('mousedown', startDragEmoji);
                canvas.addEventListener('mousemove', dragEmoji);
                canvas.addEventListener('mouseup', endDragEmoji);
                canvas.addEventListener('mouseleave', endDragEmoji);
                eventListenersBound = true;
            }

            updateMeme();
        }

        function addEmoji(emoji) {
            if (!canvas) {
                showToast('Please upload an image first', true);
                return;
            }
            
            const size = parseInt(document.getElementById('emojiSize').value);
            
            // Add emoji to center of canvas
            emojis.push({
                emoji: emoji,
                x: canvas.width / 2,
                y: canvas.height / 2,
                size: size
            });
            
            updateMeme();
            showToast('Emoji added! Drag to reposition');
        }

        function clearEmojis() {
            emojis = [];
            updateMeme();
            showToast('All emojis cleared');
        }

        function startDragEmoji(e) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const mouseX = (e.clientX - rect.left) * scaleX;
            const mouseY = (e.clientY - rect.top) * scaleY;

            // Check if clicking on an emoji (reverse order to get top emoji)
            for (let i = emojis.length - 1; i >= 0; i--) {
                const emoji = emojis[i];
                const halfSize = emoji.size / 2;
                
                if (mouseX >= emoji.x - halfSize && mouseX <= emoji.x + halfSize &&
                    mouseY >= emoji.y - halfSize && mouseY <= emoji.y + halfSize) {
                    draggedEmoji = emoji;
                    canvas.style.cursor = 'grabbing';
                    e.preventDefault();
                    return;
                }
            }
        }

        function dragEmoji(e) {
            if (!draggedEmoji) {
                // Change cursor when hovering over emoji
                const rect = canvas.getBoundingClientRect();
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;
                const mouseX = (e.clientX - rect.left) * scaleX;
                const mouseY = (e.clientY - rect.top) * scaleY;
                
                let overEmoji = false;
                for (let i = emojis.length - 1; i >= 0; i--) {
                    const emoji = emojis[i];
                    const halfSize = emoji.size / 2;
                    
                    if (mouseX >= emoji.x - halfSize && mouseX <= emoji.x + halfSize &&
                        mouseY >= emoji.y - halfSize && mouseY <= emoji.y + halfSize) {
                        overEmoji = true;
                        break;
                    }
                }
                canvas.style.cursor = overEmoji ? 'grab' : 'default';
                return;
            }

            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const mouseX = (e.clientX - rect.left) * scaleX;
            const mouseY = (e.clientY - rect.top) * scaleY;

            // Update emoji position with bounds checking
            draggedEmoji.x = Math.max(draggedEmoji.size / 2, Math.min(mouseX, canvas.width - draggedEmoji.size / 2));
            draggedEmoji.y = Math.max(draggedEmoji.size / 2, Math.min(mouseY, canvas.height - draggedEmoji.size / 2));

            updateMeme();
        }

        function endDragEmoji() {
            if (draggedEmoji) {
                draggedEmoji = null;
                canvas.style.cursor = 'grab';
            }
        }

        function applyFilter(filter) {
            currentFilter = filter;
            
            // Update button styles
            document.querySelectorAll('[id^="filter-"]').forEach(btn => {
                btn.style.background = 'var(--dark)';
                btn.style.borderColor = 'var(--border)';
                btn.style.color = 'var(--white)';
                btn.classList.remove('active-filter');
            });
            document.getElementById('filter-' + filter).style.background = 'var(--primary)';
            document.getElementById('filter-' + filter).style.borderColor = 'var(--primary)';
            document.getElementById('filter-' + filter).style.color = 'white';
            document.getElementById('filter-' + filter).classList.add('active-filter');
            
            updateMeme();
        }

        function setAlignment(align) {
            textAlignment = align;
            
            // Update button styles
            document.querySelectorAll('[id^="align-"]').forEach(btn => {
                btn.style.background = 'var(--dark)';
                btn.style.borderColor = 'var(--border)';
                btn.style.color = 'var(--white)';
                btn.classList.remove('active-align');
            });
            document.getElementById('align-' + align).style.background = 'var(--primary)';
            document.getElementById('align-' + align).style.borderColor = 'var(--primary)';
            document.getElementById('align-' + align).style.color = 'white';
            document.getElementById('align-' + align).classList.add('active-align');
            
            updateMeme();
        }

        function updateMeme() {
            if (!originalImage) return;

            // Apply filter to image
            ctx.filter = getFilterString();
            ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
            ctx.filter = 'none';

            const topText = document.getElementById('topText').value.toUpperCase();
            const middleText = document.getElementById('middleText').value.toUpperCase();
            const bottomText = document.getElementById('bottomText').value.toUpperCase();
            const fontSize = document.getElementById('fontSize').value;
            const fontFamily = document.getElementById('fontFamily').value;
            const textColor = document.getElementById('textColor').value;
            const strokeColor = document.getElementById('strokeColor').value;
            const strokeWidth = document.getElementById('strokeWidth').value;
            const hasShadow = document.getElementById('textShadow').checked;
            const shadowBlur = document.getElementById('shadowBlur').value;

            // Set font
            ctx.font = `bold ${fontSize}px ${fontFamily}, sans-serif`;
            ctx.textAlign = textAlignment;
            ctx.fillStyle = textColor;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = strokeWidth;
            ctx.lineJoin = 'round';

            // Set shadow if enabled
            if (hasShadow) {
                ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                ctx.shadowBlur = shadowBlur;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
            }

            // Calculate X position based on alignment
            let xPos;
            if (textAlignment === 'left') {
                xPos = 20;
            } else if (textAlignment === 'right') {
                xPos = canvas.width - 20;
            } else {
                xPos = canvas.width / 2;
            }

            // Draw top text
            if (topText) {
                const topY = fontSize * 1.2;
                drawText(topText, xPos, topY);
            }

            // Draw middle text
            if (middleText) {
                const middleY = canvas.height / 2 + fontSize / 3;
                drawText(middleText, xPos, middleY);
            }

            // Draw bottom text
            if (bottomText) {
                const bottomY = canvas.height - fontSize * 0.3;
                drawText(bottomText, xPos, bottomY);
            }

            // Reset shadow
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            // Draw emojis
            emojis.forEach(emojiObj => {
                ctx.font = `${emojiObj.size}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(emojiObj.emoji, emojiObj.x, emojiObj.y);
            });
        }

        function getFilterString() {
            switch(currentFilter) {
                case 'grayscale': return 'grayscale(100%)';
                case 'sepia': return 'sepia(100%)';
                case 'invert': return 'invert(100%)';
                case 'blur': return 'blur(3px)';
                case 'brightness': return 'brightness(150%)';
                default: return 'none';
            }
        }

        function drawText(text, x, y) {
            const strokeWidth = document.getElementById('strokeWidth').value;
            
            if (strokeWidth > 0) {
                ctx.strokeText(text, x, y);
            }
            ctx.fillText(text, x, y);
        }

        function applyPreset(preset) {
            switch(preset) {
                case 'classic':
                    document.getElementById('textColor').value = '#ffffff';
                    document.getElementById('strokeColor').value = '#000000';
                    document.getElementById('strokeWidth').value = 3;
                    document.getElementById('fontSize').value = 48;
                    break;
                case 'dark':
                    document.getElementById('textColor').value = '#000000';
                    document.getElementById('strokeColor').value = '#ffffff';
                    document.getElementById('strokeWidth').value = 2;
                    document.getElementById('fontSize').value = 48;
                    break;
                case 'colorful':
                    document.getElementById('textColor').value = '#ffff00';
                    document.getElementById('strokeColor').value = '#ff00ff';
                    document.getElementById('strokeWidth').value = 4;
                    document.getElementById('fontSize').value = 52;
                    break;
                case 'minimal':
                    document.getElementById('textColor').value = '#ffffff';
                    document.getElementById('strokeColor').value = '#000000';
                    document.getElementById('strokeWidth').value = 1;
                    document.getElementById('fontSize').value = 40;
                    break;
            }
            
            // Update displays
            document.getElementById('fontSize-val').textContent = document.getElementById('fontSize').value + 'px';
            document.getElementById('strokeWidth-val').textContent = document.getElementById('strokeWidth').value + 'px';
            
            updateMeme();
        }

        function downloadMeme() {
            if (!originalImage) return;

            const downloadCanvas = document.createElement('canvas');
            const downloadCtx = downloadCanvas.getContext('2d');
            downloadCanvas.width = originalImage.width;
            downloadCanvas.height = originalImage.height;

            // Apply filter
            downloadCtx.filter = getFilterString();
            downloadCtx.drawImage(originalImage, 0, 0);
            downloadCtx.filter = 'none';

            const topText = document.getElementById('topText').value.toUpperCase();
            const middleText = document.getElementById('middleText').value.toUpperCase();
            const bottomText = document.getElementById('bottomText').value.toUpperCase();
            const fontSize = document.getElementById('fontSize').value;
            const fontFamily = document.getElementById('fontFamily').value;
            const textColor = document.getElementById('textColor').value;
            const strokeColor = document.getElementById('strokeColor').value;
            const strokeWidth = document.getElementById('strokeWidth').value;
            const hasShadow = document.getElementById('textShadow').checked;
            const shadowBlur = document.getElementById('shadowBlur').value;

            const scale = originalImage.width / canvas.width;
            const scaledFontSize = fontSize * scale;

            downloadCtx.font = `bold ${scaledFontSize}px ${fontFamily}, sans-serif`;
            downloadCtx.textAlign = textAlignment;
            downloadCtx.fillStyle = textColor;
            downloadCtx.strokeStyle = strokeColor;
            downloadCtx.lineWidth = strokeWidth * scale;
            downloadCtx.lineJoin = 'round';

            if (hasShadow) {
                downloadCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                downloadCtx.shadowBlur = shadowBlur * scale;
                downloadCtx.shadowOffsetX = 2 * scale;
                downloadCtx.shadowOffsetY = 2 * scale;
            }

            let xPos;
            if (textAlignment === 'left') {
                xPos = 20 * scale;
            } else if (textAlignment === 'right') {
                xPos = downloadCanvas.width - 20 * scale;
            } else {
                xPos = downloadCanvas.width / 2;
            }

            if (topText) {
                const topY = scaledFontSize * 1.2;
                if (strokeWidth > 0) downloadCtx.strokeText(topText, xPos, topY);
                downloadCtx.fillText(topText, xPos, topY);
            }

            if (middleText) {
                const middleY = downloadCanvas.height / 2 + scaledFontSize / 3;
                if (strokeWidth > 0) downloadCtx.strokeText(middleText, xPos, middleY);
                downloadCtx.fillText(middleText, xPos, middleY);
            }

            if (bottomText) {
                const bottomY = downloadCanvas.height - scaledFontSize * 0.3;
                if (strokeWidth > 0) downloadCtx.strokeText(bottomText, xPos, bottomY);
                downloadCtx.fillText(bottomText, xPos, bottomY);
            }

            // Reset shadow before drawing emojis
            downloadCtx.shadowColor = 'transparent';
            downloadCtx.shadowBlur = 0;
            downloadCtx.shadowOffsetX = 0;
            downloadCtx.shadowOffsetY = 0;

            // Draw emojis on download canvas at full resolution
            const emojiScale = originalImage.width / canvas.width;
            emojis.forEach(emojiObj => {
                downloadCtx.font = `${emojiObj.size * emojiScale}px Arial`;
                downloadCtx.textAlign = 'center';
                downloadCtx.textBaseline = 'middle';
                downloadCtx.fillText(emojiObj.emoji, emojiObj.x * emojiScale, emojiObj.y * emojiScale);
            });

            // Now create the blob with everything drawn
            downloadCanvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'meme_' + Date.now() + '.png';
                a.click();
                URL.revokeObjectURL(url);
                showToast('Meme downloaded!');
            });
        }

        function uploadNew() {
            document.getElementById('fileInput').click();
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }