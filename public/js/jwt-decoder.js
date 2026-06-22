function decodeBase64Url(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) {
        str += '=';
    }
    const binary = atob(str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
}

function decodeJWT() {
            const jwt = document.getElementById('jwtInput').value.trim();
            
            if (!jwt) {
                hideAll();
                return;
            }
            
            try {
                const parts = jwt.split('.');
                
                if (parts.length !== 3) {
                    showError('Invalid JWT format. JWT must have 3 parts separated by dots.');
                    return;
                }
                
                // Decode header and payload safely supporting Base64URL and UTF-8
                const header = JSON.parse(decodeBase64Url(parts[0]));
                const payload = JSON.parse(decodeBase64Url(parts[1]));
                const signature = parts[2];
                
                // Display token parts
                document.getElementById('headerPart').textContent = parts[0];
                document.getElementById('payloadPart').textContent = parts[1];
                document.getElementById('signaturePart').textContent = parts[2];
                document.getElementById('tokenParts').style.display = 'block';
                
                // Display header
                document.getElementById('headerContent').textContent = JSON.stringify(header, null, 2);
                document.getElementById('headerOutput').style.display = 'block';
                
                // Display payload
                document.getElementById('payloadContent').textContent = JSON.stringify(payload, null, 2);
                document.getElementById('payloadOutput').style.display = 'block';
                
                // Display signature
                document.getElementById('signatureContent').textContent = signature;
                document.getElementById('signatureOutput').style.display = 'block';
                
                // Display claims info
                displayClaims(payload);
                
                // Show success
                showSuccess('JWT decoded successfully');
                
            } catch (e) {
                showError('Invalid JWT token. Unable to decode.');
            }
        }
        
        function displayClaims(payload) {
            const claimsList = document.getElementById('claimsList');
            const standardClaims = {
                'iss': 'Issuer',
                'sub': 'Subject',
                'aud': 'Audience',
                'exp': 'Expiration Time',
                'nbf': 'Not Before',
                'iat': 'Issued At',
                'jti': 'JWT ID'
            };
            
            let html = '';
            let hasStandardClaims = false;
            
            for (const [key, label] of Object.entries(standardClaims)) {
                if (payload[key] !== undefined) {
                    hasStandardClaims = true;
                    let value = payload[key];
                    
                    // Format timestamps
                    if (['exp', 'nbf', 'iat'].includes(key) && typeof value === 'number') {
                        const date = new Date(value * 1000);
                        const now = new Date();
                        const isExpired = key === 'exp' && date < now;
                        const isNotYetValid = key === 'nbf' && date > now;
                        
                        value = `${date.toLocaleString()} ${isExpired ? '🔴 EXPIRED' : isNotYetValid ? '⏳ Not yet valid' : '🟢 Valid'}`;
                    }
                    
                    html += `<div style="padding: 8px; background: var(--light); border-radius: 6px; border-left: 3px solid var(--primary);">
                        <span style="color: var(--gray); font-weight: 600;">${label} (${key}):</span>
                        <span style="color: var(--white); margin-left: 8px;">${value}</span>
                    </div>`;
                }
            }
            
            if (hasStandardClaims) {
                claimsList.innerHTML = html;
                document.getElementById('claimsInfo').style.display = 'block';
            } else {
                document.getElementById('claimsInfo').style.display = 'none';
            }
        }
        
        function showSuccess(message) {
            const status = document.getElementById('validationStatus');
            status.innerHTML = `<div style="color: var(--secondary);">✔️ ${message}</div>`;
            status.style.background = 'rgba(52, 211, 153, 0.1)';
            status.style.borderColor = 'var(--secondary)';
            status.style.display = 'block';
        }
        
        function showError(message) {
            const status = document.getElementById('validationStatus');
            status.innerHTML = `<div style="color: var(--danger);">❌ ${message}</div>`;
            status.style.background = 'rgba(248, 113, 113, 0.1)';
            status.style.borderColor = 'var(--danger)';
            status.style.display = 'block';
            hideAll();
        }
        
        function hideAll() {
            document.getElementById('tokenParts').style.display = 'none';
            document.getElementById('headerOutput').style.display = 'none';
            document.getElementById('payloadOutput').style.display = 'none';
            document.getElementById('signatureOutput').style.display = 'none';
            document.getElementById('claimsInfo').style.display = 'none';
            document.getElementById('validationStatus').style.display = 'none';
        }
        
        function clearAll() {
            document.getElementById('jwtInput').value = '';
            hideAll();
            showToast('Cleared');
        }
        
        function loadSample() {
            const sampleJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
            document.getElementById('jwtInput').value = sampleJWT;
            decodeJWT();
            showToast('Sample JWT loaded');
        }
        
        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }