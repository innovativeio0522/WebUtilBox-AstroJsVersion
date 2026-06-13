const calcMode = document.getElementById('calcMode');
        const calculateBtn = document.getElementById('calculateBtn');
        const clearBtn = document.getElementById('clearBtn');
        const results = document.getElementById('results');
        const placeholder = document.getElementById('placeholder');

        // Mode switching
        calcMode.addEventListener('change', switchMode);

        function switchMode() {
            const mode = calcMode.value;
            document.querySelectorAll('.calc-mode').forEach(el => el.style.display = 'none');
            document.querySelectorAll('.result-mode').forEach(el => el.style.display = 'none');
            
            if (mode === 'discount') {
                document.getElementById('mode1').style.display = 'block';
            } else if (mode === 'savings') {
                document.getElementById('mode2').style.display = 'block';
            } else if (mode === 'original') {
                document.getElementById('mode3').style.display = 'block';
            }
            
            results.style.display = 'none';
            placeholder.style.display = 'block';
        }

        // Calculate
        calculateBtn.addEventListener('click', calculate);

        function calculate() {
            const mode = calcMode.value;
            
            if (mode === 'discount') {
                calculateFinalPrice();
            } else if (mode === 'savings') {
                calculateDiscountPercent();
            } else if (mode === 'original') {
                calculateOriginalPrice();
            }
        }

        function calculateFinalPrice() {
            const original = parseFloat(document.getElementById('originalPrice1').value);
            const discount = parseFloat(document.getElementById('discountPercent1').value) || 0;
            const additional = parseFloat(document.getElementById('additionalDiscount').value) || 0;
            const tax = parseFloat(document.getElementById('taxPercent').value) || 0;

            if (!original || original <= 0) {
                showToast('Please enter a valid original price', true);
                return;
            }

            if (discount < 0 || discount > 100) {
                showToast('Discount must be between 0 and 100', true);
                return;
            }

            // Calculate first discount
            const discountAmount = (original * discount) / 100;
            const priceAfterDiscount = original - discountAmount;

            // Calculate additional discount
            let additionalAmount = 0;
            let priceAfterAdditional = priceAfterDiscount;
            if (additional > 0) {
                additionalAmount = (priceAfterDiscount * additional) / 100;
                priceAfterAdditional = priceAfterDiscount - additionalAmount;
            }

            // Calculate tax
            let taxAmount = 0;
            let finalPrice = priceAfterAdditional;
            if (tax > 0) {
                taxAmount = (priceAfterAdditional * tax) / 100;
                finalPrice = priceAfterAdditional + taxAmount;
            }

            const totalSavings = discountAmount + additionalAmount;

            // Display results
            document.getElementById('resOriginal1').textContent = original.toFixed(2);
            document.getElementById('resDiscount').textContent = discountAmount.toFixed(2);
            document.getElementById('resDiscountPercent').textContent = discount.toFixed(1);
            document.getElementById('resTotalSavings').textContent = totalSavings.toFixed(2);
            document.getElementById('resFinal1').textContent = finalPrice.toFixed(2);

            // Show/hide additional discount
            if (additional > 0) {
                document.getElementById('additionalDiscountSection').style.display = 'block';
                document.getElementById('resAdditionalDiscount').textContent = additionalAmount.toFixed(2);
                document.getElementById('resAdditionalPercent').textContent = additional.toFixed(1);
            } else {
                document.getElementById('additionalDiscountSection').style.display = 'none';
            }

            // Show/hide tax
            if (tax > 0) {
                document.getElementById('taxSection').style.display = 'block';
                document.getElementById('resTax').textContent = taxAmount.toFixed(2);
                document.getElementById('resTaxPercent').textContent = tax.toFixed(1);
            } else {
                document.getElementById('taxSection').style.display = 'none';
            }

            document.getElementById('results1').style.display = 'block';
            results.style.display = 'block';
            placeholder.style.display = 'none';
        }

        function calculateDiscountPercent() {
            const original = parseFloat(document.getElementById('originalPrice2').value);
            const final = parseFloat(document.getElementById('finalPrice2').value);

            if (!original || original <= 0 || !final || final < 0) {
                showToast('Please enter valid prices', true);
                return;
            }

            if (final > original) {
                showToast('Final price cannot be greater than original price', true);
                return;
            }

            const saved = original - final;
            const discountPercent = (saved / original) * 100;

            document.getElementById('resOriginal2').textContent = original.toFixed(2);
            document.getElementById('resFinal2').textContent = final.toFixed(2);
            document.getElementById('resSaved2').textContent = saved.toFixed(2);
            document.getElementById('resDiscountPercent2').textContent = discountPercent.toFixed(1);

            document.getElementById('results2').style.display = 'block';
            results.style.display = 'block';
            placeholder.style.display = 'none';
        }

        function calculateOriginalPrice() {
            const final = parseFloat(document.getElementById('finalPrice3').value);
            const discount = parseFloat(document.getElementById('discountPercent3').value);

            if (!final || final <= 0 || !discount || discount <= 0 || discount >= 100) {
                showToast('Please enter valid values', true);
                return;
            }

            const original = final / (1 - discount / 100);
            const saved = original - final;

            document.getElementById('resFinal3').textContent = final.toFixed(2);
            document.getElementById('resDiscountPercent3').textContent = discount.toFixed(1);
            document.getElementById('resSaved3').textContent = saved.toFixed(2);
            document.getElementById('resOriginal3').textContent = original.toFixed(2);

            document.getElementById('results3').style.display = 'block';
            results.style.display = 'block';
            placeholder.style.display = 'none';
        }

        // Clear
        clearBtn.addEventListener('click', () => {
            document.querySelectorAll('input[type="number"]').forEach(input => input.value = '');
            results.style.display = 'none';
            placeholder.style.display = 'block';
            showToast('Cleared');
        });

        // Examples
        document.querySelectorAll('.example-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                const original = btn.dataset.original;
                const discount = btn.dataset.discount;
                const additional = btn.dataset.additional || '';

                calcMode.value = mode;
                switchMode();

                document.getElementById('originalPrice1').value = original;
                document.getElementById('discountPercent1').value = discount;
                document.getElementById('additionalDiscount').value = additional;

                calculate();
            });
        });

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }