function updateFlex() {
            const container = document.getElementById('flexContainer');
            const direction = document.getElementById('flexDirection').value;
            const justify = document.getElementById('justifyContent').value;
            const align = document.getElementById('alignItems').value;
            const wrap = document.getElementById('flexWrap').value;
            const gap = document.getElementById('gap').value;

            document.getElementById('gapValue').textContent = gap;

            container.style.flexDirection = direction;
            container.style.justifyContent = justify;
            container.style.alignItems = align;
            container.style.flexWrap = wrap;
            container.style.gap = gap + 'px';

            const css = `.container {
  display: flex;
  flex-direction: ${direction};
  justify-content: ${justify};
  align-items: ${align};
  flex-wrap: ${wrap};
  gap: ${gap}px;
}`;

            document.getElementById('cssOutput').value = css;
        }

        function updateItems() {
            const count = document.getElementById('itemCount').value;
            document.getElementById('itemCountValue').textContent = count;

            const container = document.getElementById('flexContainer');
            container.innerHTML = '';
            for (let i = 1; i <= count; i++) {
                const item = document.createElement('div');
                item.className = 'flex-item';
                item.textContent = i;
                container.appendChild(item);
            }
        }

        function copyCss() {
            const css = document.getElementById('cssOutput').value;
            navigator.clipboard.writeText(css).then(() => showToast('CSS copied!'));
        }

        function showToast(message) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show';
            setTimeout(() => toast.classList.remove('show'), 3000);
        }

        updateFlex();