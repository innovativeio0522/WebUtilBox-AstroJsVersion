const PRESETS = [
            { name: 'Purple Haze',    type: 'linear', angle: 135, c1: '#667eea', c2: '#764ba2' },
            { name: 'Sunset',         type: 'linear', angle: 135, c1: '#f5af19', c2: '#f12711' },
            { name: 'Ocean',          type: 'linear', angle: 135, c1: '#2980b9', c2: '#6dd5fa' },
            { name: 'Forest',         type: 'linear', angle: 135, c1: '#134e5e', c2: '#71b280' },
            { name: 'Rose Gold',      type: 'linear', angle: 135, c1: '#f4c2c2', c2: '#c9a0a0' },
            { name: 'Midnight',       type: 'linear', angle: 135, c1: '#0f0c29', c2: '#302b63' },
            { name: 'Peach',          type: 'linear', angle: 135, c1: '#ffecd2', c2: '#fcb69f' },
            { name: 'N. Lights',      type: 'linear', angle: 135, c1: '#43e97b', c2: '#38f9d7' },
            { name: 'Candy',          type: 'linear', angle: 135, c1: '#f093fb', c2: '#f5576c' },
            { name: 'Steel',          type: 'linear', angle: 135, c1: '#4facfe', c2: '#00f2fe' },
            { name: 'Subtle Card',    type: 'linear', angle: 135, c1: '#f5f7fa', c2: '#c3cfe2' },
            { name: 'Deep Space',     type: 'radial',  angle: 135, c1: '#1a1a2e', c2: '#0f3460' },
        ];

        function buildPresetGallery() {
            const gallery = document.getElementById('presetGallery');
            PRESETS.forEach((p, i) => {
                const grad = p.type === 'linear'
                    ? `linear-gradient(${p.angle}deg, ${p.c1} 0%, ${p.c2} 100%)`
                    : `radial-gradient(ellipse at center, ${p.c1} 0%, ${p.c2} 100%)`;
                const el = document.createElement('button');
                el.setAttribute('aria-label', `Load ${p.name} preset`);
                el.style.cssText = `background:${grad};height:72px;border-radius:10px;border:2px solid transparent;cursor:pointer;position:relative;transition:border-color .2s,transform .15s`;
                el.onmouseenter = () => { el.style.borderColor = 'var(--primary)'; el.style.transform = 'scale(1.04)'; };
                el.onmouseleave = () => { el.style.borderColor = 'transparent'; el.style.transform = 'scale(1)'; };
                const label = document.createElement('span');
                label.textContent = p.name;
                label.style.cssText = 'position:absolute;bottom:6px;left:0;right:0;text-align:center;font-size:.7rem;font-weight:600;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.7)';
                el.appendChild(label);
                el.onclick = () => loadPreset(i);
                gallery.appendChild(el);
            });
        }

        function loadPreset(i) {
            const p = PRESETS[i];
            document.getElementById('gradientType').value = p.type;
            document.getElementById('angle').value = p.angle;
            document.getElementById('color1').value = p.c1;
            document.getElementById('color2').value = p.c2;
            updateGradient();
            showToast(`Loaded: ${p.name}`);
        }

        function updateGradient() {
            const type = document.getElementById('gradientType').value;
            const angle = document.getElementById('angle').value;
            const color1 = document.getElementById('color1').value;
            const color2 = document.getElementById('color2').value;
            
            let gradient;
            if (type === 'linear') {
                gradient = `linear-gradient(${angle}deg, ${color1} 0%, ${color2} 100%)`;
            } else {
                gradient = `radial-gradient(ellipse at center, ${color1} 0%, ${color2} 100%)`;
            }
            
            document.getElementById('preview').style.background = gradient;
            document.getElementById('cssCode').textContent = `background: ${gradient};`;
        }

        function copyCSS() {
            const text = document.getElementById('cssCode').textContent;
            navigator.clipboard.writeText(text).then(() => {
                showToast('CSS copied to clipboard!');
            });
        }

        function showToast(message) {
            const toast = document.getElementById('toast');
            document.getElementById('toastMessage').textContent = message;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }

        buildPresetGallery();
        updateGradient();