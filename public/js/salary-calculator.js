// Auto-calculate on input change
        document.querySelectorAll('input, select').forEach(el => {
            el.addEventListener('input', () => {
                if (document.getElementById('results').style.display !== 'none') {
                    calculateSalary();
                }
            });
        });

        function calculateSalary() {
            const amount = parseFloat(document.getElementById('salaryAmount').value) || 0;
            const period = document.getElementById('salaryPeriod').value;
            const hoursPerWeek = parseFloat(document.getElementById('hoursPerWeek').value) || 40;
            const weeksPerYear = parseFloat(document.getElementById('weeksPerYear').value) || 52;
            const overtimeHours = parseFloat(document.getElementById('overtimeHours').value) || 0;
            const overtimeRate = parseFloat(document.getElementById('overtimeRate').value) || 1.5;
            const bonus = parseFloat(document.getElementById('bonus').value) || 0;
            const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
            const monthlyDeductions = parseFloat(document.getElementById('deductions').value) || 0;

            // Convert to hourly rate first
            let hourlyRate = 0;
            switch(period) {
                case 'hourly':
                    hourlyRate = amount;
                    break;
                case 'daily':
                    hourlyRate = amount / (hoursPerWeek / 5);
                    break;
                case 'weekly':
                    hourlyRate = amount / hoursPerWeek;
                    break;
                case 'monthly':
                    hourlyRate = (amount * 12) / (hoursPerWeek * weeksPerYear);
                    break;
                case 'annual':
                    hourlyRate = amount / (hoursPerWeek * weeksPerYear);
                    break;
            }

            // Calculate gross income
            const regularHoursPerYear = hoursPerWeek * weeksPerYear;
            const overtimeHoursPerYear = overtimeHours * weeksPerYear;
            
            const regularIncome = hourlyRate * regularHoursPerYear;
            const overtimeIncome = hourlyRate * overtimeRate * overtimeHoursPerYear;
            const totalGrossAnnual = regularIncome + overtimeIncome + bonus;

            // Calculate all time periods (gross)
            const grossHourly = totalGrossAnnual / (regularHoursPerYear + overtimeHoursPerYear);
            const grossDaily = totalGrossAnnual / (weeksPerYear * 5);
            const grossWeekly = totalGrossAnnual / weeksPerYear;
            const grossMonthly = totalGrossAnnual / 12;

            // Calculate net income
            const totalTax = totalGrossAnnual * (taxRate / 100);
            const annualDeductions = monthlyDeductions * 12;
            const netAnnual = totalGrossAnnual - totalTax - annualDeductions;

            const netHourly = netAnnual / (regularHoursPerYear + overtimeHoursPerYear);
            const netDaily = netAnnual / (weeksPerYear * 5);
            const netWeekly = netAnnual / weeksPerYear;
            const netMonthly = netAnnual / 12;

            // Display gross results
            document.getElementById('grossHourly').textContent = `$${grossHourly.toFixed(2)}`;
            document.getElementById('grossDaily').textContent = `$${grossDaily.toFixed(2)}`;
            document.getElementById('grossWeekly').textContent = `$${grossWeekly.toFixed(2)}`;
            document.getElementById('grossMonthly').textContent = `$${grossMonthly.toFixed(2)}`;
            document.getElementById('grossAnnual').textContent = `$${totalGrossAnnual.toLocaleString(undefined, {maximumFractionDigits: 0})}`;

            // Display net results
            document.getElementById('netHourly').textContent = `$${netHourly.toFixed(2)}`;
            document.getElementById('netDaily').textContent = `$${netDaily.toFixed(2)}`;
            document.getElementById('netWeekly').textContent = `$${netWeekly.toFixed(2)}`;
            document.getElementById('netMonthly').textContent = `$${netMonthly.toFixed(2)}`;
            document.getElementById('netAnnual').textContent = `$${netAnnual.toLocaleString(undefined, {maximumFractionDigits: 0})}`;

            // Display breakdown
            document.getElementById('regularIncome').textContent = `$${regularIncome.toLocaleString(undefined, {maximumFractionDigits: 0})}`;
            document.getElementById('overtimeIncome').textContent = `$${overtimeIncome.toLocaleString(undefined, {maximumFractionDigits: 0})}`;
            document.getElementById('bonusIncome').textContent = `$${bonus.toLocaleString(undefined, {maximumFractionDigits: 0})}`;
            document.getElementById('totalGross').textContent = `$${totalGrossAnnual.toLocaleString(undefined, {maximumFractionDigits: 0})}`;
            document.getElementById('totalTax').textContent = `$${totalTax.toLocaleString(undefined, {maximumFractionDigits: 0})}`;
            document.getElementById('totalDeductions').textContent = `$${annualDeductions.toLocaleString(undefined, {maximumFractionDigits: 0})}`;
            document.getElementById('takeHome').textContent = `$${netAnnual.toLocaleString(undefined, {maximumFractionDigits: 0})}`;

            document.getElementById('results').style.display = 'block';
        }