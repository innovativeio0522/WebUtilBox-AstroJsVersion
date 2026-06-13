function syncLoanAmount() {
            const value = document.getElementById('loanAmountInput').value;
            document.getElementById('loanAmount').value = value;
            calculate();
        }

        function syncInterestRate() {
            const value = document.getElementById('interestRateInput').value;
            document.getElementById('interestRate').value = value;
            calculate();
        }

        function syncLoanTerm() {
            const value = document.getElementById('loanTermInput').value;
            document.getElementById('loanTerm').value = value;
            calculate();
        }

        function calculate() {
            const principal = parseFloat(document.getElementById('loanAmount').value);
            const annualRate = parseFloat(document.getElementById('interestRate').value);
            const years = parseFloat(document.getElementById('loanTerm').value);

            // Sync input fields
            document.getElementById('loanAmountInput').value = principal;
            document.getElementById('interestRateInput').value = annualRate;
            document.getElementById('loanTermInput').value = years;

            // Update displays
            document.getElementById('loanAmountDisplay').textContent = '$' + principal.toLocaleString();
            document.getElementById('interestRateDisplay').textContent = annualRate + '%';
            document.getElementById('loanTermDisplay').textContent = years + (years === 1 ? ' year' : ' years');

            // Calculate EMI
            const monthlyRate = annualRate / 12 / 100;
            const months = years * 12;

            let emi;
            if (monthlyRate === 0) {
                emi = principal / months;
            } else {
                emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
            }

            const totalPayment = emi * months;
            const totalInterest = totalPayment - principal;

            // Display results
            document.getElementById('monthlyEMI').textContent = '$' + emi.toFixed(2);
            document.getElementById('totalInterest').textContent = '$' + totalInterest.toFixed(2);
            document.getElementById('totalPayment').textContent = '$' + totalPayment.toFixed(2);

            // Breakdown
            document.getElementById('principalAmount').textContent = '$' + principal.toLocaleString();
            document.getElementById('interestAmount').textContent = '$' + totalInterest.toFixed(2);
            document.getElementById('totalPayments').textContent = months + ' months';
            document.getElementById('totalAmountBreakdown').textContent = '$' + totalPayment.toFixed(2);
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }

        // Initialize
        calculate();