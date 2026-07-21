let updateDebounceTimer = null;

function updatePreview() {
    const text = document.getElementById('previewText').value;
    const offsetX = document.getElementById('offsetX').value;
    const offsetY = document.getElementById('offsetY').value;
    const blur = document.getElementById('blur').value;
    const color = document.getElementById('shadowColor').value;
    const opacity = document.getElementById('opacity').value / 100;
    const textColor = document.getElementById('textColor').value;

    document.getElementById('offsetXValue').textContent = offsetX;
    document.getElementById('offsetYValue').textContent = offsetY;
    document.getElementById('blurValue').textContent = blur;
    document.getElementById('opacityValue').textContent = document.getElementById('opacity').value;

    const preview = document.getElementById('preview');
    preview.textContent = text;
    preview.style.color = textColor;

    const rgb = hexToRgb(color);
    const shadow = `${offsetX}px ${offsetY}px ${blur}px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
    preview.style.textShadow = shadow;

    document.getElementById('cssOutput').value = `text-shadow: ${shadow};`;

    triggerSliderTrack();
}

function triggerSliderTrack() {
    if (updateDebounceTimer) clearTimeout(updateDebounceTimer);
    updateDebounceTimer = setTimeout(() => {
        if (window.trackToolEvent) {
            window.trackToolEvent('adjust_slider', 'text-shadow-generator');
        }
    }, 1000);
}

function updateBackground() {
    const bgColor = document.getElementById('bgColor').value;
    document.querySelector('.workspace > div').style.background = bgColor;
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : {r: 0, g: 0, b: 0};
}

function applyPreset(preset) {
    const presets = {
        simple: { x: 2, y: 2, blur: 4, color: '#000000', opacity: 75 },
        hard: { x: 5, y: 5, blur: 0, color: '#000000', opacity: 100 },
        double: { x: 3, y: 3, blur: 0, color: '#000000', opacity: 50 },
        glow: { x: 0, y: 0, blur: 20, color: '#f97316', opacity: 80 },
        '3d': { x: 1, y: 1, blur: 0, color: '#000000', opacity: 100 },
        neon: { x: 0, y: 0, blur: 10, color: '#00ff00', opacity: 100 }
    };

    const p = presets[preset];
    if (!p) return;
    document.getElementById('offsetX').value = p.x;
    document.getElementById('offsetY').value = p.y;
    document.getElementById('blur').value = p.blur;
    document.getElementById('shadowColor').value = p.color;
    document.getElementById('opacity').value = p.opacity;
    updatePreview();

    if (window.trackToolEvent) {
        window.trackToolEvent('apply_preset', 'text-shadow-generator', { preset_name: preset });
    }
}

function copyCss() {
    const css = document.getElementById('cssOutput').value;
    navigator.clipboard.writeText(css).then(() => showToast('CSS copied!'));

    if (window.trackToolEvent) {
        window.trackToolEvent('copy_css', 'text-shadow-generator');
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    const msg = document.getElementById('toastMessage');
    if (!toast || !msg) return;
    msg.textContent = message;
    toast.className = 'toast show';
    setTimeout(() => toast.classList.remove('show'), 3000);
}

updatePreview();

// Explicitly attach all HTML event handler functions to window
window.updatePreview = updatePreview;
window.updateBackground = updateBackground;
window.applyPreset = applyPreset;
window.copyCss = copyCss;