function updateShadow() {
            const hOffset = document.getElementById('hOffset').value;
            const vOffset = document.getElementById('vOffset').value;
            const blur = document.getElementById('blur').value;
            const spread = document.getElementById('spread').value;
            const color = document.getElementById('shadowColor').value;
            const opacity = document.getElementById('opacity').value;
            const inset = document.getElementById('inset').checked;

            // Update displays
            document.getElementById('hOffsetVal').textContent = hOffset + 'px';
            document.getElementById('vOffsetVal').textContent = vOffset + 'px';
            document.getElementById('blurVal').textContent = blur + 'px';
            document.getElementById('spreadVal').textContent = spread + 'px';
            document.getElementById('opacityVal').textContent = opacity;
            document.getElementById('shadowColorText').value = color;

            // Convert hex to rgba
            const r = parseInt(color.substr(1,2), 16);
            const g = parseInt(color.substr(3,2), 16);
            const b = parseInt(color.substr(5,2), 16);
            const rgba = `rgba(${r}, ${g}, ${b}, ${opacity})`;

            // Build shadow
            const insetStr = inset ? 'inset ' : '';
            const shadow = `${insetStr}${hOffset}px ${vOffset}px ${blur}px ${spread}px ${rgba}`;

            // Apply to preview
            document.getElementById('previewBox').style.boxShadow = shadow;

            // Update CSS code
            document.getElementById('cssCode').textContent = `box-shadow: ${shadow};`;
        }

        function updateColorFromText() {
            const color = document.getElementById('shadowColorText').value;
            if (/^#[0-9A-F]{6}$/i.test(color)) {
                document.getElementById('shadowColor').value = color;
                updateShadow();
            }
        }

        function copyCss() {
            const css = document.getElementById('cssCode').textContent;
            navigator.clipboard.writeText(css).then(() => {
                showToast('CSS copied to clipboard!');
            });
        }

        function showToast(message) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show';
            setTimeout(() => toast.classList.remove('show'), 3000);
        }

        // Initialize
        updateShadow();