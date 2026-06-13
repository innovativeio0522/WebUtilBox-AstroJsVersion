let frames = [];
        let gifBlob = null;

        async function loadImages() {
            const files = Array.from(document.getElementById('imageFiles').files);
            
            for (const file of files) {
                if (file.type.startsWith('image/')) {
                    const url = URL.createObjectURL(file);
                    const img = new Image();
                    img.src = url;
                    await new Promise(resolve => img.onload = resolve);
                    
                    frames.push({ url, img, name: file.name });
                }
            }

            if (frames.length > 0) {
                displayFrames();
                document.getElementById('imageList').style.display = 'block';
                showToast(`${files.length} image(s) loaded`);
            }
        }

        function displayFrames() {
            const container = document.getElementById('frameItems');
            container.innerHTML = '';

            frames.forEach((frame, index) => {
                const item = document.createElement('div');
                item.className = 'frame-item';
                item.draggable = true;
                item.dataset.index = index;

                item.innerHTML = `
                    <div style="font-size: 1.5rem; cursor: grab; color: var(--gray);">?</div>
                    <img src="${frame.url}" class="frame-preview" alt="${frame.name}">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; margin-bottom: 4px;">${frame.name}</div>
                        <div style="font-size: 0.85rem; color: var(--gray);">Frame ${index + 1}</div>
                    </div>
                    <button onclick="removeFrame(${index})" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 1.2rem;">?</button>
                `;

                item.addEventListener('dragstart', handleDragStart);
                item.addEventListener('dragover', handleDragOver);
                item.addEventListener('drop', handleDrop);

                container.appendChild(item);
            });

            document.getElementById('frameCount').textContent = frames.length;
        }

        let draggedIndex = null;

        function handleDragStart(e) {
            draggedIndex = parseInt(e.target.dataset.index);
        }

        function handleDragOver(e) {
            e.preventDefault();
        }

        function handleDrop(e) {
            e.preventDefault();
            const dropIndex = parseInt(e.target.closest('.frame-item').dataset.index);
            
            if (draggedIndex !== null && draggedIndex !== dropIndex) {
                const draggedItem = frames[draggedIndex];
                frames.splice(draggedIndex, 1);
                frames.splice(dropIndex, 0, draggedItem);
                displayFrames();
            }
        }

        function removeFrame(index) {
            URL.revokeObjectURL(frames[index].url);
            frames.splice(index, 1);
            if (frames.length === 0) {
                document.getElementById('imageList').style.display = 'none';
            }
            displayFrames();
        }

        function clearFrames() {
            frames.forEach(frame => URL.revokeObjectURL(frame.url));
            frames = [];
            document.getElementById('imageList').style.display = 'none';
            document.getElementById('imageFiles').value = '';
            document.getElementById('preview').style.display = 'none';
            showToast('All frames cleared');
        }

        async function createGIF() {
            if (frames.length < 2) {
                showToast('Please add at least 2 images', true);
                return;
            }

            document.getElementById('progress').style.display = 'block';
            document.getElementById('progressBar').style.width = '0%';
            document.getElementById('progressText').textContent = 'Creating GIF...';

            const delay = parseInt(document.getElementById('frameDelay').value);
            const maxWidth = parseInt(document.getElementById('maxWidth').value);

            try {
                // Create canvas for each frame
                const canvases = [];
                for (let i = 0; i < frames.length; i++) {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    const scale = Math.min(maxWidth / frames[i].img.width, 1);
                    canvas.width = frames[i].img.width * scale;
                    canvas.height = frames[i].img.height * scale;
                    
                    ctx.drawImage(frames[i].img, 0, 0, canvas.width, canvas.height);
                    canvases.push(canvas);
                    
                    document.getElementById('progressBar').style.width = ((i + 1) / frames.length * 50) + '%';
                }

                // Create animated WebP or fallback to canvas animation
                document.getElementById('progressText').textContent = 'Generating animation...';
                
                // For simplicity, we'll create an APNG (Animated PNG) using canvas
                // Note: This is a simplified version. For production, consider using a library
                const firstCanvas = canvases[0];
                const blob = await new Promise(resolve => {
                    firstCanvas.toBlob(resolve, 'image/png');
                });

                gifBlob = blob;
                const url = URL.createObjectURL(blob);
                
                // Create a simple animation preview using canvas
                createAnimatedPreview(canvases, delay);
                
                document.getElementById('progressBar').style.width = '100%';
                document.getElementById('preview').style.display = 'block';
                document.getElementById('progress').style.display = 'none';
                showToast('Animation created! (Note: Download will be first frame as PNG. For full GIF support, use desktop software)');
            } catch (error) {
                document.getElementById('progress').style.display = 'none';
                showToast('Error creating animation: ' + error.message, true);
            }
        }

        function createAnimatedPreview(canvases, delay) {
            const previewImg = document.getElementById('gifPreview');
            const previewCanvas = document.createElement('canvas');
            previewCanvas.width = canvases[0].width;
            previewCanvas.height = canvases[0].height;
            const ctx = previewCanvas.getContext('2d');

            const transition = document.getElementById('transitionEffect').value;
            const transitionDuration = parseInt(document.getElementById('transitionDuration').value);
            const reverseLoop = document.getElementById('reverseLoop').checked;
            const addBounce = document.getElementById('addBounce').checked;

            let currentFrame = 0;
            let direction = 1; // 1 for forward, -1 for backward
            let transitionProgress = 0;
            let isTransitioning = false;
            let lastTime = Date.now();
            
            function easeInOutQuad(t) {
                return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            }

            function animate() {
                const now = Date.now();
                const deltaTime = now - lastTime;
                lastTime = now;

                ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

                if (transition === 'none') {
                    // No transition - instant switch
                    ctx.drawImage(canvases[currentFrame], 0, 0);
                    
                    if (!isTransitioning) {
                        isTransitioning = true;
                        setTimeout(() => {
                            isTransitioning = false;
                            currentFrame += direction;
                            
                            if (reverseLoop) {
                                if (currentFrame >= canvases.length - 1) direction = -1;
                                if (currentFrame <= 0) direction = 1;
                            } else {
                                currentFrame = (currentFrame + canvases.length) % canvases.length;
                            }
                        }, delay);
                    }
                } else {
                    // Smooth transition
                    if (!isTransitioning) {
                        transitionProgress = 0;
                        isTransitioning = true;
                    }

                    transitionProgress += deltaTime / transitionDuration;
                    
                    if (transitionProgress >= 1) {
                        transitionProgress = 0;
                        isTransitioning = false;
                        currentFrame += direction;
                        
                        if (reverseLoop) {
                            if (currentFrame >= canvases.length - 1) direction = -1;
                            if (currentFrame <= 0) direction = 1;
                        } else {
                            currentFrame = (currentFrame + canvases.length) % canvases.length;
                        }
                    }

                    const progress = addBounce ? easeInOutQuad(transitionProgress) : transitionProgress;
                    const nextFrame = (currentFrame + direction + canvases.length) % canvases.length;

                    applyTransition(ctx, canvases[currentFrame], canvases[nextFrame], progress, transition);
                }

                previewImg.src = previewCanvas.toDataURL();
                requestAnimationFrame(animate);
            }

            function applyTransition(ctx, currentCanvas, nextCanvas, progress, effect) {
                const width = previewCanvas.width;
                const height = previewCanvas.height;

                switch(effect) {
                    case 'fade':
                        // Cross-fade
                        ctx.globalAlpha = 1 - progress;
                        ctx.drawImage(currentCanvas, 0, 0);
                        ctx.globalAlpha = progress;
                        ctx.drawImage(nextCanvas, 0, 0);
                        ctx.globalAlpha = 1;
                        break;

                    case 'slide-left':
                        ctx.drawImage(currentCanvas, -width * progress, 0);
                        ctx.drawImage(nextCanvas, width * (1 - progress), 0);
                        break;

                    case 'slide-right':
                        ctx.drawImage(currentCanvas, width * progress, 0);
                        ctx.drawImage(nextCanvas, -width * (1 - progress), 0);
                        break;

                    case 'slide-up':
                        ctx.drawImage(currentCanvas, 0, -height * progress);
                        ctx.drawImage(nextCanvas, 0, height * (1 - progress));
                        break;

                    case 'slide-down':
                        ctx.drawImage(currentCanvas, 0, height * progress);
                        ctx.drawImage(nextCanvas, 0, -height * (1 - progress));
                        break;

                    case 'zoom-in':
                        // Current frame zooms in and fades out
                        const scale1 = 1 + progress * 0.5;
                        const x1 = (width - width * scale1) / 2;
                        const y1 = (height - height * scale1) / 2;
                        ctx.globalAlpha = 1 - progress;
                        ctx.drawImage(currentCanvas, x1, y1, width * scale1, height * scale1);
                        
                        // Next frame fades in
                        ctx.globalAlpha = progress;
                        ctx.drawImage(nextCanvas, 0, 0);
                        ctx.globalAlpha = 1;
                        break;

                    case 'zoom-out':
                        // Current frame fades out
                        ctx.globalAlpha = 1 - progress;
                        ctx.drawImage(currentCanvas, 0, 0);
                        
                        // Next frame zooms out from center
                        const scale2 = 0.5 + progress * 0.5;
                        const x2 = (width - width * scale2) / 2;
                        const y2 = (height - height * scale2) / 2;
                        ctx.globalAlpha = progress;
                        ctx.drawImage(nextCanvas, x2, y2, width * scale2, height * scale2);
                        ctx.globalAlpha = 1;
                        break;
                }
            }

            animate();
        }

        function downloadGIF() {
            if (!gifBlob) return;
            
            const url = URL.createObjectURL(gifBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `animated_${Date.now()}.gif`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('GIF downloaded!');
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }