const jsonInput = document.getElementById('jsonInput');
        const csvOutput = document.getElementById('csvOutput');
        const previewDiv = document.getElementById('previewDiv');
        const previewTab = document.getElementById('previewTab');
        const csvTab = document.getElementById('csvTab');
        const convertBtn = document.getElementById('convertBtn');
        const copyBtn = document.getElementById('copyBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        const loadSampleBtn = document.getElementById('loadSampleBtn');
        const clearBtn = document.getElementById('clearBtn');

        let currentTab = 'preview';
        let csvData = '';
        let currentDirection = 'jsonToCsv';

        function switchDirection(direction) {
            currentDirection = direction;
            
            // Update tabs
            document.querySelectorAll('.direction-tab').forEach(tab => tab.classList.remove('active'));
            document.getElementById(direction + 'Tab').classList.add('active');
            
            // Update UI labels and placeholders
            if (direction === 'jsonToCsv') {
                document.querySelector('label[style*="font-size: 0.8rem"]').textContent = 'JSON Input';
                jsonInput.placeholder = `[
  {"name": "John", "age": 30, "city": "New York"},
  {"name": "Jane", "age": 25, "city": "London"}
]`;
                convertBtn.textContent = 'Convert to CSV';
                downloadBtn.textContent = '?? Download CSV';
            } else {
                document.querySelector('label[style*="font-size: 0.8rem"]').textContent = 'CSV Input';
                jsonInput.placeholder = `name,age,city
John,30,New York
Jane,25,London`;
                convertBtn.textContent = 'Convert to JSON';
                downloadBtn.textContent = '?? Download JSON';
            }
            
            // Clear data
            jsonInput.value = '';
            csvOutput.value = '';
            csvData = '';
            previewDiv.innerHTML = '<div style="text-align: center; padding: 60px 20px; color: var(--gray); font-size: 0.85rem;">Enter data and click Convert to see preview</div>';
        }

        requestIdleCallback(() => {
            previewTab.addEventListener('click', () => switchTab('preview'));
            csvTab.addEventListener('click', () => switchTab('csv'));
            convertBtn.addEventListener('click', convert);
            copyBtn.addEventListener('click', copyData);
            downloadBtn.addEventListener('click', downloadData);
            loadSampleBtn.addEventListener('click', loadSample);
            clearBtn.addEventListener('click', () => {
                jsonInput.value = '';
                csvOutput.value = '';
                csvData = '';
                previewDiv.innerHTML = '<div style="text-align: center; padding: 60px 20px; color: var(--gray); font-size: 0.85rem;">Enter data and click Convert to see preview</div>';
                showToast('Cleared');
            });
        }, { timeout: 2000 });

        function switchTab(tab) {
            currentTab = tab;
            
            if (tab === 'preview') {
                previewTab.style.background = 'var(--primary)';
                previewTab.style.border = 'none';
                csvTab.style.background = 'var(--dark)';
                csvTab.style.border = '1px solid var(--border)';
                previewDiv.style.display = 'block';
                csvOutput.style.display = 'none';
            } else {
                csvTab.style.background = 'var(--primary)';
                csvTab.style.border = 'none';
                previewTab.style.background = 'var(--dark)';
                previewTab.style.border = '1px solid var(--border)';
                previewDiv.style.display = 'none';
                csvOutput.style.display = 'block';
            }
        }

        function convert() {
            if (currentDirection === 'jsonToCsv') {
                convertJSONtoCSV();
            } else {
                convertCSVtoJSON();
            }
        }

        function convertJSONtoCSV() {
            const input = jsonInput.value.trim();
            
            if (!input) {
                showToast('Please enter JSON data', true);
                return;
            }
            
            try {
                let data = JSON.parse(input);
                
                if (!Array.isArray(data)) {
                    data = [data];
                }
                
                if (data.length === 0) {
                    showToast('JSON array is empty', true);
                    return;
                }
                
                const flatData = data.map(item => flattenObject(item));
                const allKeys = new Set();
                flatData.forEach(item => {
                    Object.keys(item).forEach(key => allKeys.add(key));
                });
                const headers = Array.from(allKeys);
                
                const csvRows = [];
                csvRows.push(headers.map(h => escapeCSV(h)).join(','));
                
                flatData.forEach(item => {
                    const row = headers.map(header => escapeCSV(item[header]));
                    csvRows.push(row.join(','));
                });
                
                csvData = csvRows.join('\n');
                csvOutput.value = csvData;
                createTablePreview(headers, flatData);
                showToast('Converted to CSV successfully!');
                
            } catch (error) {
                showToast('Invalid JSON: ' + error.message, true);
                previewDiv.innerHTML = '<div style="text-align: center; padding: 60px 20px; color: #e74c3c; font-size: 0.85rem;">Error: ' + error.message + '</div>';
            }
        }

        function convertCSVtoJSON() {
            const input = jsonInput.value.trim();
            
            if (!input) {
                showToast('Please enter CSV data', true);
                return;
            }
            
            try {
                const lines = input.split('\n').filter(line => line.trim());
                
                if (lines.length < 2) {
                    showToast('CSV must have at least a header and one data row', true);
                    return;
                }
                
                const headers = parseCSVLine(lines[0]);
                const jsonArray = [];
                
                for (let i = 1; i < lines.length; i++) {
                    const values = parseCSVLine(lines[i]);
                    const obj = {};
                    
                    headers.forEach((header, index) => {
                        let value = values[index] || '';
                        
                        // Try to parse as number
                        if (value && !isNaN(value)) {
                            value = Number(value);
                        }
                        // Try to parse as boolean
                        else if (value === 'true') value = true;
                        else if (value === 'false') value = false;
                        // Try to parse as null
                        else if (value === 'null' || value === '') value = null;
                        
                        obj[header] = value;
                    });
                    
                    jsonArray.push(obj);
                }
                
                csvData = JSON.stringify(jsonArray, null, 2);
                csvOutput.value = csvData;
                
                // Create preview
                createJSONPreview(jsonArray);
                showToast('Converted to JSON successfully!');
                
            } catch (error) {
                showToast('Invalid CSV: ' + error.message, true);
                previewDiv.innerHTML = '<div style="text-align: center; padding: 60px 20px; color: #e74c3c; font-size: 0.85rem;">Error: ' + error.message + '</div>';
            }
        }

        function parseCSVLine(line) {
            const result = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                const nextChar = line[i + 1];
                
                if (char === '"') {
                    if (inQuotes && nextChar === '"') {
                        current += '"';
                        i++;
                    } else {
                        inQuotes = !inQuotes;
                    }
                } else if (char === ',' && !inQuotes) {
                    result.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            
            result.push(current.trim());
            return result;
        }

        function flattenObject(obj, prefix = '') {
            const flattened = {};
            
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const value = obj[key];
                    const newKey = prefix ? `${prefix}.${key}` : key;
                    
                    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                        Object.assign(flattened, flattenObject(value, newKey));
                    } else if (Array.isArray(value)) {
                        flattened[newKey] = JSON.stringify(value);
                    } else {
                        flattened[newKey] = value;
                    }
                }
            }
            
            return flattened;
        }

        function escapeCSV(value) {
            if (value === null || value === undefined) return '';
            const str = String(value);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return '"' + str.replace(/"/g, '""') + '"';
            }
            return str;
        }

        function createTablePreview(headers, data) {
            let html = '<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse; font-size: 0.75rem;">';
            
            html += '<thead><tr>';
            headers.forEach(header => {
                html += `<th style="background: var(--dark); color: var(--white); padding: 8px; border: 1px solid var(--border); text-align: left; font-weight: 600; white-space: nowrap;">${escapeHTML(header)}</th>`;
            });
            html += '</tr></thead>';
            
            html += '<tbody>';
            data.forEach((row, idx) => {
                html += '<tr>';
                headers.forEach(header => {
                    const value = row[header] !== undefined ? row[header] : '';
                    html += `<td style="background: ${idx % 2 === 0 ? 'var(--dark)' : '#1a1a1a'}; color: var(--white); padding: 8px; border: 1px solid var(--border); font-weight: normal; white-space: nowrap;">${escapeHTML(String(value))}</td>`;
                });
                html += '</tr>';
            });
            html += '</tbody>';
            
            html += '</table></div>';
            
            html += `<div style="margin-top: 12px; font-size: 0.75rem; color: var(--gray);">
                ${data.length} row${data.length !== 1 ? 's' : ''}, ${headers.length} column${headers.length !== 1 ? 's' : ''}
            </div>`;
            
            previewDiv.innerHTML = html;
        }

        function createJSONPreview(data) {
            const formatted = JSON.stringify(data, null, 2);
            const html = `<pre style="background: var(--dark); color: var(--white); padding: 15px; border-radius: 6px; overflow-x: auto; font-size: 0.8rem; margin: 0;">${escapeHTML(formatted)}</pre>
            <div style="margin-top: 12px; font-size: 0.75rem; color: var(--gray);">
                ${data.length} object${data.length !== 1 ? 's' : ''} in array
            </div>`;
            previewDiv.innerHTML = html;
        }

        function escapeHTML(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }

        function copyData() {
            if (!csvData) {
                showToast('No data to copy', true);
                return;
            }
            
            navigator.clipboard.writeText(csvData).then(() => {
                showToast('Copied to clipboard!');
            }).catch(() => {
                showToast('Failed to copy', true);
            });
        }

        function downloadData() {
            if (!csvData) {
                showToast('No data to download', true);
                return;
            }
            
            const isJSON = currentDirection === 'csvToJson';
            const blob = new Blob([csvData], { type: isJSON ? 'application/json' : 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'data_' + Date.now() + (isJSON ? '.json' : '.csv');
            a.click();
            URL.revokeObjectURL(url);
            showToast('File downloaded!');
        }

        function loadSample() {
            if (currentDirection === 'jsonToCsv') {
                jsonInput.value = `[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30,
    "city": "New York",
    "active": true
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "age": 25,
    "city": "London",
    "active": true
  },
  {
    "id": 3,
    "name": "Bob Johnson",
    "email": "bob@example.com",
    "age": 35,
    "city": "Paris",
    "active": false
  }
]`;
            } else {
                jsonInput.value = `id,name,email,age,city,active
1,John Doe,john@example.com,30,New York,true
2,Jane Smith,jane@example.com,25,London,true
3,Bob Johnson,bob@example.com,35,Paris,false`;
            }
            showToast('Sample loaded!');
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }