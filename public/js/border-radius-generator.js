function updateAll() {
            const value = document.getElementById('allCorners').value;
            document.getElementById('allVal').textContent = value + 'px';
            
            document.getElementById('topLeft').value = value;
            document.getElementById('topRight').value = value;
            document.getElementById('bottomRight').value = value;
            document.getElementById('bottomLeft').value = value;
            
            updateRadius();
        }

        function updateRadius() {
            const tl = document.getElementById('topLeft').value;
            const tr = document.getElementById('topRight').value;
            const br = document.getElementById('bottomRight').value;
            const bl = document.getElementById('bottomLeft').value;

            // Update displays
            document.getElementById('tlVal').textContent = tl + 'px';
            document.getElementById('trVal').textContent = tr + 'px';
            document.getElementById('brVal').textContent = br + 'px';
            document.getElementById('blVal').textContent = bl + 'px';

            // Apply to preview
            const radius = `${tl}px ${tr}px ${br}px ${bl}px`;
            document.getElementById('previewBox').style.borderRadius = radius;

            // Update CSS code
            if (tl === tr && tr === br && br === bl) {
                document.getElementById('cssCode').textContent = `border-radius: ${tl}px;`;
            } else {
                document.getElementById('cssCode').textContent = `border-radius: ${radius};`;
            }
        }

        function setPreset(type) {
            switch(type) {
                case 'circle':
                    setValues(50, 50, 50, 50);
                    break;
                case 'rounded':
                    setValues(20, 20, 20, 20);
                    break;
                case 'blob':
                    setValues(60, 40, 70, 30);
                    break;
                case 'reset':
                    setValues(0, 0, 0, 0);
                    break;
            }
        }

        function setValues(tl, tr, br, bl) {
            document.getElementById('topLeft').value = tl;
            document.getElementById('topRight').value = tr;
            document.getElementById('bottomRight').value = br;
            document.getElementById('bottomLeft').value = bl;
            updateRadius();
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
        updateRadius();