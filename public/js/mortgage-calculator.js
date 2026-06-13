let amortizationVisible = false;

        // Auto-calculate on input change
        document.querySelectorAll('input, select').forEach(el => {
            el.addEventListener('input', () => {
                updateDownPaymentPercent();
                if (document.getElementById('results').style.display !== 'none') {
                    calculateMortgage();
                }
            });
        });

        function updateDownPaymentPercent() {
            const homePrice = parseFloat(document.getElementById('homePrice').value) || 0;
            const downPayment = parseFloat(document.getElementById('downPayment').value) || 0;
            const percent = homePrice > 0 ? ((downPayment / homePrice) * 100).toFixed(1) : 0;
            document.getElementById('downPaymentPercent').textContent = `${percent}% down payment`;
        }

        function calculateMortgage() {
            const homePrice = parseFloat(document.getElementById('homePrice').value) || 0;
            const downPayment = parseFloat(document.getElementById('downPayment').value) || 0;
            const loanTerm = parseInt(document.getElementById('loanTerm').value);
            const annualRate = parseFloat(document.getElementById('interestRate').value) || 0;
            const propertyTax = parseFloat(document.getElementById('propertyTax').value) || 0;
            const homeInsurance = parseFloat(document.getElementById('homeInsurance').value) || 0;
            const hoaFees = parseFloat(document.getElementById('hoaFees').value) || 0;
            const pmiRate = parseFloat(document.getElementById('pmi').value) || 0;

            const loanAmount = homePrice - downPayment;
            const monthlyRate = annualRate / 100 / 12;
            const numPayments = loanTerm * 12;

            // Calculate monthly principal & interest
            let monthlyPI = 0;
            if (monthlyRate > 0) {
                monthlyPI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                           (Math.pow(1 + monthlyRate, numPayments) - 1);
            } else {
                monthlyPI = loanAmount / numPayments;
            }

            // Calculate other monthly costs
            const monthlyTax = propertyTax / 12;
            const monthlyInsurance = homeInsurance / 12;
            
            // PMI only if down payment < 20%
            const downPaymentPercent = (downPayment / homePrice) * 100;
            const monthlyPMI = downPaymentPercent < 20 ? (loanAmount * pmiRate / 100 / 12) : 0;

            const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance + hoaFees + monthlyPMI;
            const totalInterest = (monthlyPI * numPayments) - loanAmount;
            const totalPaid = monthlyPI * numPayments;

            // Display results
            document.getElementById('totalMonthly').textContent = `$${totalMonthly.toFixed(2)}`;
            document.getElementById('principalInterest').textContent = `$${monthlyPI.toFixed(2)}`;
            document.getElementById('monthlyTax').textContent = `$${monthlyTax.toFixed(2)}`;
            document.getElementById('monthlyInsurance').textContent = `$${monthlyInsurance.toFixed(2)}`;
            document.getElementById('monthlyHOA').textContent = `$${hoaFees.toFixed(2)}`;
            document.getElementById('monthlyPMI').textContent = `$${monthlyPMI.toFixed(2)}`;
            document.getElementById('loanAmount').textContent = `$${loanAmount.toLocaleString()}`;
            document.getElementById('totalInterest').textContent = `$${totalInterest.toLocaleString(undefined, {maximumFractionDigits: 0})}`;
            document.getElementById('totalPaid').textContent = `$${totalPaid.toLocaleString(undefined, {maximumFractionDigits: 0})}`;

            // Calculate payoff date
            const today = new Date();
            const payoffDate = new Date(today.getFullYear() + loanTerm, today.getMonth(), today.getDate());
            document.getElementById('payoffDate').textContent = payoffDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

            // Generate amortization schedule
            generateAmortizationSchedule(loanAmount, monthlyRate, numPayments, monthlyPI);

            document.getElementById('results').style.display = 'block';
        }

        function generateAmortizationSchedule(principal, monthlyRate, numPayments, payment) {
            const tbody = document.getElementById('amortizationBody');
            tbody.innerHTML = '';

            let balance = principal;
            
            for (let i = 1; i <= numPayments; i++) {
                const interestPayment = balance * monthlyRate;
                const principalPayment = payment - interestPayment;
                balance -= principalPayment;

                // Show every payment for first year, then yearly
                if (i <= 12 || i % 12 === 0 || i === numPayments) {
                    const row = tbody.insertRow();
                    row.innerHTML = `
                        <td style="padding: 8px; border-bottom: 1px solid var(--border);">${i}</td>
                        <td style="padding: 8px; border-bottom: 1px solid var(--border); text-align: right;">$${payment.toFixed(2)}</td>
                        <td style="padding: 8px; border-bottom: 1px solid var(--border); text-align: right;">$${principalPayment.toFixed(2)}</td>
                        <td style="padding: 8px; border-bottom: 1px solid var(--border); text-align: right;">$${interestPayment.toFixed(2)}</td>
                        <td style="padding: 8px; border-bottom: 1px solid var(--border); text-align: right;">$${Math.max(0, balance).toFixed(2)}</td>
                    `;
                }
            }
        }

        function toggleAmortization() {
            amortizationVisible = !amortizationVisible;
            document.getElementById('amortizationSection').style.display = amortizationVisible ? 'block' : 'none';
            document.getElementById('toggleText').textContent = amortizationVisible ? 'Hide Amortization Schedule' : 'Show Amortization Schedule';
        }

        // Initialize
        updateDownPaymentPercent();