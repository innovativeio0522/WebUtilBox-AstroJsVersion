// Auto-calculate on input change
        document.querySelectorAll('input, select').forEach(el => {
            el.addEventListener('input', () => {
                if (document.getElementById('results').style.display !== 'none') {
                    calculateProfit();
                }
            });
        });

        function calculateProfit() {
            const crypto = document.getElementById('crypto').value;
            const investment = parseFloat(document.getElementById('investment').value) || 0;
            const buyPrice = parseFloat(document.getElementById('buyPrice').value) || 0;
            const sellPrice = parseFloat(document.getElementById('sellPrice').value) || 0;
            const buyFeePercent = parseFloat(document.getElementById('buyFee').value) || 0;
            const sellFeePercent = parseFloat(document.getElementById('sellFee').value) || 0;

            // Calculate buy side
            const buyFee = investment * (buyFeePercent / 100);
            const investmentAfterFee = investment - buyFee;
            const coinsPurchased = investmentAfterFee / buyPrice;

            // Calculate sell side
            const saleValue = coinsPurchased * sellPrice;
            const sellFee = saleValue * (sellFeePercent / 100);
            const saleProceeds = saleValue - sellFee;

            // Calculate profit/loss
            const totalFees = buyFee + sellFee;
            const netProfit = saleProceeds - investment;
            const roi = (netProfit / investment) * 100;

            // Calculate break-even price (price needed to cover all fees)
            const breakEven = (investment + totalFees) / coinsPurchased;

            // Calculate price change
            const priceChange = ((sellPrice - buyPrice) / buyPrice) * 100;

            // Display results
            const profitColor = netProfit >= 0 ? '#10b981' : '#ef4444';
            document.getElementById('netProfit').textContent = `${netProfit >= 0 ? '+' : ''}$${netProfit.toFixed(2)}`;
            document.getElementById('netProfit').style.color = profitColor;
            document.getElementById('profitHighlight').style.background = netProfit >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';

            document.getElementById('coinsPurchased').textContent = `${coinsPurchased.toFixed(8)} ${crypto}`;
            document.getElementById('totalInvestment').textContent = `$${investment.toFixed(2)}`;
            document.getElementById('saleProceeds').textContent = `$${saleProceeds.toFixed(2)}`;
            document.getElementById('totalFees').textContent = `$${totalFees.toFixed(2)}`;
            document.getElementById('roi').textContent = `${roi >= 0 ? '+' : ''}${roi.toFixed(2)}%`;
            document.getElementById('roi').style.color = profitColor;
            document.getElementById('breakEven').textContent = `$${breakEven.toFixed(2)}`;
            document.getElementById('priceChange').textContent = `${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}%`;

            // Generate summary
            const cryptoName = document.getElementById('crypto').options[document.getElementById('crypto').selectedIndex].text;
            let summary = '';
            if (netProfit > 0) {
                summary = `?? Profit! You would make $${netProfit.toFixed(2)} (${roi.toFixed(2)}% ROI) by buying ${coinsPurchased.toFixed(8)} ${crypto} at $${buyPrice.toFixed(2)} and selling at $${sellPrice.toFixed(2)}. After paying $${totalFees.toFixed(2)} in fees, your net gain is ${roi.toFixed(2)}%.`;
            } else if (netProfit < 0) {
                summary = `?? Loss! You would lose $${Math.abs(netProfit).toFixed(2)} (${roi.toFixed(2)}% ROI) by buying ${coinsPurchased.toFixed(8)} ${crypto} at $${buyPrice.toFixed(2)} and selling at $${sellPrice.toFixed(2)}. Including $${totalFees.toFixed(2)} in fees, your net loss is ${Math.abs(roi).toFixed(2)}%.`;
            } else {
                summary = `?? Break-even! You would neither profit nor lose. The price change exactly covers the trading fees of $${totalFees.toFixed(2)}.`;
            }
            document.getElementById('profitSummary').textContent = summary;

            document.getElementById('results').style.display = 'block';
        }