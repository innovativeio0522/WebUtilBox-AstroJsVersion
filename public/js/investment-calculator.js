// Auto-calculate on input change
        document.querySelectorAll('input, select').forEach(el => {
            el.addEventListener('input', () => {
                if (document.getElementById('results').style.display !== 'none') {
                    calculateInvestment();
                }
            });
        });

        function calculateInvestment() {
            const initial = parseFloat(document.getElementById('initialInvestment').value) || 0;
            const monthly = parseFloat(document.getElementById('monthlyContribution').value) || 0;
            const years = parseInt(document.getElementById('years').value) || 0;
            const annualRate = parseFloat(document.getElementById('returnRate').value) || 0;
            const compoundingFreq = parseInt(document.getElementById('compounding').value);
            const timing = document.getElementById('contributionTiming').value;

            const rate = annualRate / 100;
            const periodsPerYear = 12; // Monthly contributions
            const totalPeriods = years * periodsPerYear;

            let balance = initial;
            let totalContributions = initial;
            const yearlyData = [];

            // Calculate period by period
            for (let period = 1; period <= totalPeriods; period++) {
                // Add contribution at beginning or end
                if (timing === 'start') {
                    balance += monthly;
                    totalContributions += monthly;
                }

                // Apply interest (compound based on frequency)
                const periodicRate = rate / compoundingFreq;
                const compoundsThisPeriod = compoundingFreq / periodsPerYear;
                balance = balance * Math.pow(1 + periodicRate, compoundsThisPeriod);

                if (timing === 'end') {
                    balance += monthly;
                    totalContributions += monthly;
                }

                // Store yearly data
                if (period % 12 === 0) {
                    const year = period / 12;
                    const interest = balance - totalContributions;
                    yearlyData.push({
                        year,
                        contributions: totalContributions,
                        interest,
                        balance
                    });
                }
            }

            const futureValue = balance;
            const totalInterest = futureValue - totalContributions;
            const roi = ((futureValue - totalContributions) / totalContributions) * 100;
            const annualizedReturn = (Math.pow(futureValue / initial, 1 / years) - 1) * 100;

            // Display results
            document.getElementById('futureValue').textContent = `$${futureValue.toLocaleString(undefined, {maximumFractionDigits: 2})}`;
            document.getElementById('totalContributions').textContent = `$${totalContributions.toLocaleString(undefined, {maximumFractionDigits: 2})}`;
            document.getElementById('totalInterest').textContent = `$${totalInterest.toLocaleString(undefined, {maximumFractionDigits: 2})}`;
            document.getElementById('roi').textContent = `${roi.toFixed(2)}%`;
            document.getElementById('annualizedReturn').textContent = `${annualizedReturn.toFixed(2)}%`;

            // Generate breakdown table
            const tbody = document.getElementById('breakdownBody');
            tbody.innerHTML = '';
            yearlyData.forEach(data => {
                const row = tbody.insertRow();
                row.innerHTML = `
                    <td style="padding: 8px; border-bottom: 1px solid var(--border);">Year ${data.year}</td>
                    <td style="padding: 8px; border-bottom: 1px solid var(--border); text-align: right;">$${data.contributions.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                    <td style="padding: 8px; border-bottom: 1px solid var(--border); text-align: right;">$${data.interest.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                    <td style="padding: 8px; border-bottom: 1px solid var(--border); text-align: right; font-weight: 600;">$${data.balance.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                `;
            });

            document.getElementById('results').style.display = 'block';
        }