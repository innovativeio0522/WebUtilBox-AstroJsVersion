function calculate() {
            const billAmount = parseFloat(document.getElementById('billAmount').value) || 0;
            const tipPercent = parseFloat(document.getElementById('tipPercent').value) || 0;
            const numPeople = parseInt(document.getElementById('numPeople').value) || 1;

            // Update tip percent display
            document.getElementById('tipPercentDisplay').textContent = tipPercent + '%';

            // Calculate amounts
            const tipAmount = billAmount * (tipPercent / 100);
            const totalAmount = billAmount + tipAmount;
            const tipPerPerson = tipAmount / numPeople;
            const totalPerPerson = totalAmount / numPeople;

            // Display results
            document.getElementById('tipAmount').textContent = '$' + tipAmount.toFixed(2);
            document.getElementById('totalAmount').textContent = '$' + totalAmount.toFixed(2);
            document.getElementById('tipPerPerson').textContent = '$' + tipPerPerson.toFixed(2);
            document.getElementById('totalPerPerson').textContent = '$' + totalPerPerson.toFixed(2);
        }

        function setTip(percent) {
            document.getElementById('tipPercent').value = percent;
            calculate();
        }

        function changePeople(delta) {
            const input = document.getElementById('numPeople');
            let value = parseInt(input.value) || 1;
            value = Math.max(1, value + delta);
            input.value = value;
            calculate();
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