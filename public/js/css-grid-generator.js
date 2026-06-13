function updateGrid() {
            const container = document.getElementById('gridContainer');
            const columns = document.getElementById('columns').value;
            const rows = document.getElementById('rows').value;
            const columnGap = document.getElementById('columnGap').value;
            const rowGap = document.getElementById('rowGap').value;
            const justifyItems = document.getElementById('justifyItems').value;
            const alignItems = document.getElementById('alignItems').value;

            document.getElementById('columnsValue').textContent = columns;
            document.getElementById('rowsValue').textContent = rows;
            document.getElementById('columnGapValue').textContent = columnGap;
            document.getElementById('rowGapValue').textContent = rowGap;

            container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
            container.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
            container.style.columnGap = columnGap + 'px';
            container.style.rowGap = rowGap + 'px';
            container.style.justifyItems = justifyItems;
            container.style.alignItems = alignItems;

            const totalItems = columns * rows;
            container.innerHTML = '';
            for (let i = 1; i <= totalItems; i++) {
                const item = document.createElement('div');
                item.className = 'grid-item';
                item.textContent = i;
                container.appendChild(item);
            }

            const css = `.container {
  display: grid;
  grid-template-columns: repeat(${columns}, 1fr);
  grid-template-rows: repeat(${rows}, 1fr);
  column-gap: ${columnGap}px;
  row-gap: ${rowGap}px;
  justify-items: ${justifyItems};
  align-items: ${alignItems};
}`;

            document.getElementById('cssOutput').value = css;
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

        updateGrid();