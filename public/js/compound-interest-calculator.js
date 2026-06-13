function calculate() {
            const principal = parseFloat(document.getElementById('principal').value) || 0;
            const rate = parseFloat(document.getElementById('rate').value) / 100 || 0;
            const years = parseInt(document.getElementById('years').value) || 0;
            const frequency = parseInt(document.getElementById('frequency').value) || 12;
            const monthlyContribution = parseFloat(document.getElementById('contribution').value) || 0;

            if (principal <= 0 || years <= 0) {
                document.getElementById('results').style.display = 'none';
                return;
            }

            const yearlyData = [];
            let balance = principal;
            let totalContributions = 0;

            for (let year = 1; year <= years; year++) {
                const yearStart = balance;
                
                for (let period = 0; period < frequency; period++) {
                    balance = balance * (1 + rate / frequency);
                    if (monthlyContribution > 0 && frequency >= 12) {
                        const contributionsThisPeriod = monthlyContribution * (12 / frequency);
                        balance += contributionsThisPeriod;
                        totalContributions += contributionsThisPeriod;
                    }
                }

                const yearInterest = balance - yearStart - (monthlyContribution * 12);
                yearlyData.push({
                    year,
                    principal: yearStart + (monthlyContribution * 12),
                    interest: yearInterest,
                    balance
                });
            }

            const finalAmount = balance;
            const totalPrincipal = principal + totalContributions;
            const totalInterest = finalAmount - totalPrincipal;

            document.getElementById('finalAmount').textContent = '$' + finalAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            document.getElementById('totalInterest').textContent = '$' + totalInterest.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            document.getElementById('totalPrincipal').textContent = '$' + totalPrincipal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

            document.getElementById('initialPrincipal').textContent = '$' + principal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            document.getElementById('totalContributions').textContent = '$' + totalContributions.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            document.getElementById('interestEarned').textContent = '$' + totalInterest.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            document.getElementById('finalBalance').textContent = '$' + finalAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

            const tbody = document.getElementById('yearlyTable');
            tbody.innerHTML = '';
            yearlyData.forEach(data => {
                const row = tbody.insertRow();
                row.innerHTML = `
                    <td style="padding: 8px;">${data.year}</td>
                    <td style="padding: 8px; text-align: right;">$${data.principal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</td>
                    <td style="padding: 8px; text-align: right; color: #10b981;">$${data.interest.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</td>
                    <td style="padding: 8px; text-align: right; font-weight: 600;">$${data.balance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</td>
                `;
            });

            document.getElementById('results').style.display = 'block';
        }

        calculate();