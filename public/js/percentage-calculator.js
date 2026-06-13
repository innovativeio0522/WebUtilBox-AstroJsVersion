function calc1() {
            const percent = parseFloat(document.getElementById('percent1').value) || 0;
            const value = parseFloat(document.getElementById('value1').value) || 0;
            const result = (percent / 100) * value;
            document.getElementById('result1').textContent = result.toFixed(2);
        }

        function calc2() {
            const valueA = parseFloat(document.getElementById('value2a').value) || 0;
            const valueB = parseFloat(document.getElementById('value2b').value) || 1;
            const result = (valueA / valueB) * 100;
            document.getElementById('result2').textContent = `${result.toFixed(2)}%`;
        }

        function calc3() {
            const valueA = parseFloat(document.getElementById('value3a').value) || 0;
            const valueB = parseFloat(document.getElementById('value3b').value) || 0;
            const diff = valueB - valueA;
            const percent = (diff / valueA) * 100;
            const type = diff >= 0 ? 'increase' : 'decrease';
            document.getElementById('result3').textContent = 
                `${Math.abs(percent).toFixed(2)}% ${type}`;
        }

        calc1();
        calc2();
        calc3();