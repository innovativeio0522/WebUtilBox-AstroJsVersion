// Approximate exchange rates (base: USD)
        const rates = {
            USD: 1,
            EUR: 0.92,
            GBP: 0.79,
            JPY: 149.50,
            CNY: 7.24,
            INR: 83.20,
            CAD: 1.36,
            AUD: 1.53,
            CHF: 0.88,
            MXN: 17.05
        };

        function convert() {
            const fromValue = parseFloat(document.getElementById('fromValue').value) || 0;
            const fromCurrency = document.getElementById('fromCurrency').value;
            const toCurrency = document.getElementById('toCurrency').value;
            
            // Convert to USD first, then to target currency
            const inUSD = fromValue / rates[fromCurrency];
            const result = inUSD * rates[toCurrency];
            
            document.getElementById('toValue').value = result.toFixed(2);
            
            const exchangeRate = (rates[toCurrency] / rates[fromCurrency]).toFixed(4);
            document.getElementById('rate').textContent = `1 ${fromCurrency} = ${exchangeRate} ${toCurrency}`;
            document.getElementById('result').textContent = 
                `${fromValue.toFixed(2)} ${fromCurrency} = ${result.toFixed(2)} ${toCurrency}`;
        }

        function swap() {
            const fromCurrency = document.getElementById('fromCurrency');
            const toCurrency = document.getElementById('toCurrency');
            const fromValue = document.getElementById('fromValue');
            const toValue = document.getElementById('toValue');
            
            const tempCurrency = fromCurrency.value;
            fromCurrency.value = toCurrency.value;
            toCurrency.value = tempCurrency;
            
            fromValue.value = toValue.value;
            
            convert();
            showToast('Currencies swapped');
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }

        // Initialize
        convert();