function loadScript(src) {
            return new Promise((resolve, reject) => {
                if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
                const s = document.createElement('script');
                s.src = src; s.onload = resolve; s.onerror = reject;
                document.head.appendChild(s);
            });
        }

        let currentMode = 'qr';

        function switchMode(mode) {
            currentMode = mode;
            
            document.getElementById('tab-qr').style.background = mode === 'qr' ? 'var(--primary)' : 'var(--dark)';
            document.getElementById('tab-qr').style.border = mode === 'qr' ? 'none' : '1px solid var(--border)';
            document.getElementById('tab-barcode').style.background = mode === 'barcode' ? 'var(--primary)' : 'var(--dark)';
            document.getElementById('tab-barcode').style.border = mode === 'barcode' ? 'none' : '1px solid var(--border)';
            
            document.getElementById('qr-section').style.display = mode === 'qr' ? 'block' : 'none';
            document.getElementById('barcode-section').style.display = mode === 'barcode' ? 'block' : 'none';
            document.getElementById('qr-preview').style.display = mode === 'qr' ? 'flex' : 'none';
            document.getElementById('barcode-preview').style.display = mode === 'barcode' ? 'flex' : 'none';
            
            if (mode === 'qr') {
                generateQR();
            } else {
                generateBarcode();
            }
        }

        function updateQRInputs() {
            const type = document.getElementById('qrType').value;
            const container = document.getElementById('qr-inputs');
            
            let html = '';
            switch(type) {
                case 'text':
                    html = '<div style="margin-bottom: 12px;"><label style="font-size: 0.8rem; margin-bottom: 6px; display: block; color: var(--gray);">Text Content</label><textarea id="qrText" placeholder="Enter text here..." oninput="generateQR()" style="width: 100%; padding: 8px; font-size: 0.85rem; background: var(--dark); border: 1px solid var(--border); border-radius: 6px; color: var(--white); min-height: 80px; resize: vertical;"></textarea></div>';
                    break;
                case 'url':
                    html = '<div style="margin-bottom: 12px;"><label style="font-size: 0.8rem; margin-bottom: 6px; display: block; color: var(--gray);">Website URL</label><input type="url" id="qrText" placeholder="https://example.com" oninput="generateQR()" style="width: 100%; padding: 8px; font-size: 0.85rem; background: var(--dark); border: 1px solid var(--border); border-radius: 6px; color: var(--white);"></div>';
                    break;
                case 'email':
                    html = '<div style="margin-bottom: 12px;"><label style="font-size: 0.8rem; margin-bottom: 6px; display: block; color: var(--gray);">Email Address</label><input type="email" id="qrEmail" placeholder="email@example.com" oninput="generateQR()" style="width: 100%; padding: 8px; font-size: 0.85rem; background: var(--dark); border: 1px solid var(--border); border-radius: 6px; color: var(--white); margin-bottom: 8px;"><label style="font-size: 0.8rem; margin-bottom: 6px; display: block; color: var(--gray);">Subject (Optional)</label><input type="text" id="qrSubject" placeholder="Email subject" oninput="generateQR()" style="width: 100%; padding: 8px; font-size: 0.85rem; background: var(--dark); border: 1px solid var(--border); border-radius: 6px; color: var(--white);"></div>';
                    break;
                case 'phone':
                    html = '<div style="margin-bottom: 12px;"><label style="font-size: 0.8rem; margin-bottom: 6px; display: block; color: var(--gray);">Phone Number</label><input type="tel" id="qrText" placeholder="+1234567890" oninput="generateQR()" style="width: 100%; padding: 8px; font-size: 0.85rem; background: var(--dark); border: 1px solid var(--border); border-radius: 6px; color: var(--white);"></div>';
                    break;
                case 'sms':
                    html = '<div style="margin-bottom: 12px;"><label style="font-size: 0.8rem; margin-bottom: 6px; display: block; color: var(--gray);">Phone Number</label><input type="tel" id="qrPhone" placeholder="+1234567890" oninput="generateQR()" style="width: 100%; padding: 8px; font-size: 0.85rem; background: var(--dark); border: 1px solid var(--border); border-radius: 6px; color: var(--white); margin-bottom: 8px;"><label style="font-size: 0.8rem; margin-bottom: 6px; display: block; color: var(--gray);">Message</label><textarea id="qrMessage" placeholder="SMS message" oninput="generateQR()" style="width: 100%; padding: 8px; font-size: 0.85rem; background: var(--dark); border: 1px solid var(--border); border-radius: 6px; color: var(--white); min-height: 60px; resize: vertical;"></textarea></div>';
                    break;
                case 'wifi':
                    html = '<div style="margin-bottom: 12px;"><label style="font-size: 0.8rem; margin-bottom: 6px; display: block; color: var(--gray);">Network Name (SSID)</label><input type="text" id="qrSSID" placeholder="WiFi Network Name" oninput="generateQR()" style="width: 100%; padding: 8px; font-size: 0.85rem; background: var(--dark); border: 1px solid var(--border); border-radius: 6px; color: var(--white); margin-bottom: 8px;"><label style="font-size: 0.8rem; margin-bottom: 6px; display: block; color: var(--gray);">Password</label><input type="text" id="qrPassword" placeholder="WiFi Password" oninput="generateQR()" style="width: 100%; padding: 8px; font-size: 0.85rem; background: var(--dark); border: 1px solid var(--border); border-radius: 6px; color: var(--white); margin-bottom: 8px;"><label style="font-size: 0.8rem; margin-bottom: 6px; display: block; color: var(--gray);">Security Type</label><select id="qrSecurity" onchange="generateQR()" style="width: 100%; padding: 8px; background: var(--dark); border: 1px solid var(--border); border-radius: 6px; color: var(--white); font-size: 0.85rem;"><option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="">None</option></select></div>';
                    break;
            }
            
            container.innerHTML = html;
            generateQR();
        }

        function getQRData() {
            const type = document.getElementById('qrType').value;
            
            switch(type) {
                case 'text':
                case 'url':
                case 'phone':
                    const textEl = document.getElementById('qrText');
                    return textEl ? textEl.value : '';
                case 'email':
                    const email = document.getElementById('qrEmail')?.value || '';
                    const subject = document.getElementById('qrSubject')?.value || '';
                    return email ? `mailto:${email}${subject ? '?subject=' + encodeURIComponent(subject) : ''}` : '';
                case 'sms':
                    const phone = document.getElementById('qrPhone')?.value || '';
                    const message = document.getElementById('qrMessage')?.value || '';
                    return phone ? `sms:${phone}${message ? '?body=' + encodeURIComponent(message) : ''}` : '';
                case 'wifi':
                    const ssid = document.getElementById('qrSSID')?.value || '';
                    const password = document.getElementById('qrPassword')?.value || '';
                    const security = document.getElementById('qrSecurity')?.value || '';
                    return ssid ? `WIFI:T:${security};S:${ssid};P:${password};;` : '';
                default:
                    return '';
            }
        }

        async function generateQR() {
            const data = getQRData();
            const canvas = document.getElementById('qrCanvas');
            const preview = document.getElementById('qr-preview');
            const errorMsg = document.getElementById('error-message');
            const downloadBtn = document.getElementById('downloadBtn');
            
            if (!data) {
                canvas.style.display = 'none';
                errorMsg.style.display = 'block';
                errorMsg.textContent = 'Enter data to generate code';
                downloadBtn.disabled = true;
                return;
            }

            if (!window.QRCode) {
                await loadScript('https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js');
            }
            
            errorMsg.style.display = 'none';
            downloadBtn.disabled = false;
            
            const size = parseInt(document.getElementById('qrSize').value);
            const colorDark = document.getElementById('qrColorDark').value;
            const colorLight = document.getElementById('qrColorLight').value;
            
            // Clear previous QR code
            preview.innerHTML = '';
            
            // Create new QR code
            const qrContainer = document.createElement('div');
            preview.appendChild(qrContainer);
            
            new QRCode(qrContainer, {
                text: data,
                width: size,
                height: size,
                colorDark: colorDark,
                colorLight: colorLight,
                correctLevel: QRCode.CorrectLevel.M
            });
        }

        async function generateBarcode() {
            const text = document.getElementById('barcodeText').value;
            const format = document.getElementById('barcodeFormat').value;
            const svg = document.getElementById('barcodeSvg');
            const errorMsg = document.getElementById('error-message');
            const downloadBtn = document.getElementById('downloadBtn');
            
            if (!text) {
                svg.style.display = 'none';
                errorMsg.style.display = 'block';
                downloadBtn.disabled = true;
                return;
            }

            if (!window.JsBarcode) {
                await loadScript('https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js');
            }
            
            try {
                svg.style.display = 'block';
                errorMsg.style.display = 'none';
                downloadBtn.disabled = false;
                
                const width = parseInt(document.getElementById('barcodeWidth').value);
                const height = parseInt(document.getElementById('barcodeHeight').value);
                const displayValue = document.getElementById('barcodeDisplayValue').checked;
                
                JsBarcode(svg, text, {
                    format: format,
                    width: width,
                    height: height,
                    displayValue: displayValue,
                    fontSize: 14,
                    margin: 10
                });
            } catch (error) {
                console.error(error);
                showToast('Invalid barcode data for selected format', true);
                svg.style.display = 'none';
                errorMsg.style.display = 'block';
                errorMsg.textContent = 'Invalid data for ' + format;
                downloadBtn.disabled = true;
            }
        }

        function downloadCode() {
            if (currentMode === 'qr') {
                const canvas = document.getElementById('qrCanvas');
                canvas.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'qrcode_' + Date.now() + '.png';
                    a.click();
                    URL.revokeObjectURL(url);
                    showToast('QR Code downloaded!');
                });
            } else {
                const svg = document.getElementById('barcodeSvg');
                const svgData = new XMLSerializer().serializeToString(svg);
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const img = new Image();
                
                img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                    
                    canvas.toBlob((blob) => {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'barcode_' + Date.now() + '.png';
                        a.click();
                        URL.revokeObjectURL(url);
                        showToast('Barcode downloaded!');
                    });
                };
                
                img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
            }
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }

        // Initialize
        window.addEventListener('DOMContentLoaded', function() {
            updateQRInputs();
        });