// Tax brackets for 2026 (simplified progressive tax rates)
        const taxBrackets = {
            US: {
                currency: 'USD',
                single: [
                    {limit: 11600, rate: 10},
                    {limit: 47150, rate: 12},
                    {limit: 100525, rate: 22},
                    {limit: 191950, rate: 24},
                    {limit: 243725, rate: 32},
                    {limit: 609350, rate: 35},
                    {limit: Infinity, rate: 37}
                ],
                married: [
                    {limit: 23200, rate: 10},
                    {limit: 94300, rate: 12},
                    {limit: 201050, rate: 22},
                    {limit: 383900, rate: 24},
                    {limit: 487450, rate: 32},
                    {limit: 731200, rate: 35},
                    {limit: Infinity, rate: 37}
                ],
                standardDeduction: {single: 14600, married: 29200, head: 21900}
            },
            UK: {
                currency: 'GBP',
                single: [
                    {limit: 12570, rate: 0},
                    {limit: 50270, rate: 20},
                    {limit: 125140, rate: 40},
                    {limit: Infinity, rate: 45}
                ],
                standardDeduction: {single: 0, married: 0, head: 0}
            },
            CA: {
                currency: 'CAD',
                single: [
                    {limit: 15000, rate: 0},
                    {limit: 53359, rate: 15},
                    {limit: 106717, rate: 20.5},
                    {limit: 165430, rate: 26},
                    {limit: 235675, rate: 29},
                    {limit: Infinity, rate: 33}
                ],
                standardDeduction: {single: 15000, married: 15000, head: 15000}
            },
            AU: {
                currency: 'AUD',
                single: [
                    {limit: 18200, rate: 0},
                    {limit: 45000, rate: 19},
                    {limit: 120000, rate: 32.5},
                    {limit: 180000, rate: 37},
                    {limit: Infinity, rate: 45}
                ],
                standardDeduction: {single: 0, married: 0, head: 0}
            },
            IN: {
                currency: 'INR',
                single: [
                    {limit: 300000, rate: 0},
                    {limit: 600000, rate: 5},
                    {limit: 900000, rate: 10},
                    {limit: 1200000, rate: 15},
                    {limit: 1500000, rate: 20},
                    {limit: Infinity, rate: 30}
                ],
                standardDeduction: {single: 50000, married: 50000, head: 50000}
            },
            DE: {
                currency: 'EUR',
                single: [
                    {limit: 11604, rate: 0},
                    {limit: 17005, rate: 14},
                    {limit: 66760, rate: 24},
                    {limit: 277825, rate: 42},
                    {limit: Infinity, rate: 45}
                ],
                standardDeduction: {single: 1230, married: 2460, head: 1230}
            },
            FR: {
                currency: 'EUR',
                single: [
                    {limit: 11294, rate: 0},
                    {limit: 28797, rate: 11},
                    {limit: 82341, rate: 30},
                    {limit: 177106, rate: 41},
                    {limit: Infinity, rate: 45}
                ],
                standardDeduction: {single: 0, married: 0, head: 0}
            },
            JP: {
                currency: 'JPY',
                single: [
                    {limit: 1950000, rate: 5},
                    {limit: 3300000, rate: 10},
                    {limit: 6950000, rate: 20},
                    {limit: 9000000, rate: 23},
                    {limit: 18000000, rate: 33},
                    {limit: 40000000, rate: 40},
                    {limit: Infinity, rate: 45}
                ],
                standardDeduction: {single: 480000, married: 480000, head: 480000}
            },
            BR: {
                currency: 'BRL',
                single: [
                    {limit: 24511, rate: 0},
                    {limit: 33919, rate: 7.5},
                    {limit: 45012, rate: 15},
                    {limit: 55976, rate: 22.5},
                    {limit: Infinity, rate: 27.5}
                ],
                standardDeduction: {single: 0, married: 0, head: 0}
            },
            MX: {
                currency: 'MXN',
                single: [
                    {limit: 8952, rate: 1.92},
                    {limit: 75984, rate: 6.4},
                    {limit: 133536, rate: 10.88},
                    {limit: 155229, rate: 16},
                    {limit: 185852, rate: 17.92},
                    {limit: 374837, rate: 21.36},
                    {limit: 590795, rate: 23.52},
                    {limit: 1127926, rate: 30},
                    {limit: 1503902, rate: 32},
                    {limit: 4511707, rate: 34},
                    {limit: Infinity, rate: 35}
                ],
                standardDeduction: {single: 0, married: 0, head: 0}
            }
        };

        function updateTaxInfo() {
            const country = document.getElementById('country').value;
            const filingStatus = document.getElementById('filingStatus').value;
            const brackets = taxBrackets[country];
            
            // Update currency
            document.getElementById('currency').value = brackets.currency;
            
            // Update standard deduction
            const deduction = brackets.standardDeduction[filingStatus] || 0;
            document.getElementById('deduction').value = deduction;
            
            // Update deduction info
            const countryName = document.getElementById('country').options[document.getElementById('country').selectedIndex].text;
            document.getElementById('deductionInfo').textContent = `Standard deduction for ${countryName}`;
            
            // Show/hide filing status for countries that use it
            if (country === 'US') {
                document.getElementById('filingStatusGroup').style.display = 'block';
            } else {
                document.getElementById('filingStatusGroup').style.display = 'none';
            }
        }

        function calculateTax() {
            const country = document.getElementById('country').value;
            const income = parseFloat(document.getElementById('income').value) || 0;
            const deduction = parseFloat(document.getElementById('deduction').value) || 0;
            const filingStatus = document.getElementById('filingStatus').value;
            const currency = document.getElementById('currency').value;
            
            const brackets = taxBrackets[country][filingStatus] || taxBrackets[country].single;
            const taxableIncome = Math.max(0, income - deduction);
            
            let totalTax = 0;
            let previousLimit = 0;
            const bracketDetails = [];
            
            // Calculate tax for each bracket
            for (let i = 0; i < brackets.length; i++) {
                const bracket = brackets[i];
                const taxableInBracket = Math.min(taxableIncome, bracket.limit) - previousLimit;
                
                if (taxableInBracket > 0) {
                    const taxInBracket = taxableInBracket * (bracket.rate / 100);
                    totalTax += taxInBracket;
                    
                    bracketDetails.push({
                        range: `${formatCurrency(previousLimit, currency)} - ${bracket.limit === Infinity ? '8' : formatCurrency(bracket.limit, currency)}`,
                        rate: bracket.rate,
                        taxable: taxableInBracket,
                        tax: taxInBracket
                    });
                }
                
                previousLimit = bracket.limit;
                if (taxableIncome <= bracket.limit) break;
            }
            
            const effectiveRate = income > 0 ? (totalTax / income) * 100 : 0;
            const takeHome = income - totalTax;
            
            // Display results
            document.getElementById('grossIncome').textContent = formatCurrency(income, currency);
            document.getElementById('taxableIncome').textContent = formatCurrency(taxableIncome, currency);
            document.getElementById('totalTax').textContent = formatCurrency(totalTax, currency);
            document.getElementById('effectiveRate').textContent = `${effectiveRate.toFixed(2)}%`;
            document.getElementById('takeHome').textContent = formatCurrency(takeHome, currency);
            
            // Monthly and weekly
            document.getElementById('monthlyGross').textContent = formatCurrency(income / 12, currency);
            document.getElementById('monthlyNet').textContent = formatCurrency(takeHome / 12, currency);
            document.getElementById('weeklyGross').textContent = formatCurrency(income / 52, currency);
            document.getElementById('weeklyNet').textContent = formatCurrency(takeHome / 52, currency);
            
            // Display bracket breakdown
            const breakdownDiv = document.getElementById('bracketBreakdown');
            breakdownDiv.innerHTML = '';
            bracketDetails.forEach(detail => {
                const item = document.createElement('div');
                item.style.cssText = 'padding: 12px; margin-bottom: 8px; background: rgba(255,255,255,0.03); border-radius: 8px; border-left: 3px solid var(--primary);';
                item.innerHTML = `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span style="color: var(--gray);">${detail.range}</span>
                        <span style="color: var(--primary); font-weight: 600;">${detail.rate}%</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.9rem;">
                        <span style="color: var(--gray);">Taxable: ${formatCurrency(detail.taxable, currency)}</span>
                        <span style="color: var(--text);">Tax: ${formatCurrency(detail.tax, currency)}</span>
                    </div>
                `;
                breakdownDiv.appendChild(item);
            });
            
            document.getElementById('results').style.display = 'block';
        }

        function formatCurrency(amount, currency) {
            const symbols = {
                USD: '$', GBP: '£', EUR: '€', CAD: 'C$', AUD: 'A$',
                INR: '?', JPY: '¥', BRL: 'R$', MXN: 'MX$'
            };
            const symbol = symbols[currency] || currency;
            return `${symbol}${amount.toLocaleString(undefined, {maximumFractionDigits: 0})}`;
        }

        // Auto-calculate on input change
        document.querySelectorAll('input, select').forEach(el => {
            el.addEventListener('input', () => {
                if (el.id === 'country' || el.id === 'filingStatus') {
                    updateTaxInfo();
                }
                if (document.getElementById('results').style.display !== 'none') {
                    calculateTax();
                }
            });
        });

        // Initialize
        updateTaxInfo();