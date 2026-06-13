let currentUnit = 'metric';

        function setUnit(unit) {
            currentUnit = unit;
            
            if (unit === 'metric') {
                document.getElementById('metricBtn').style.background = 'var(--primary)';
                document.getElementById('metricBtn').style.border = 'none';
                document.getElementById('imperialBtn').style.background = 'var(--light)';
                document.getElementById('imperialBtn').style.border = '1px solid var(--border)';
                document.getElementById('metricInputs').style.display = 'grid';
                document.getElementById('imperialInputs').style.display = 'none';
            } else {
                document.getElementById('imperialBtn').style.background = 'var(--primary)';
                document.getElementById('imperialBtn').style.border = 'none';
                document.getElementById('metricBtn').style.background = 'var(--light)';
                document.getElementById('metricBtn').style.border = '1px solid var(--border)';
                document.getElementById('metricInputs').style.display = 'none';
                document.getElementById('imperialInputs').style.display = 'block';
            }
            
            calculate();
        }

        function calculate() {
            let bmi;
            
            if (currentUnit === 'metric') {
                const weight = parseFloat(document.getElementById('weightKg').value);
                const height = parseFloat(document.getElementById('heightCm').value);
                
                if (!weight || !height || weight <= 0 || height <= 0) {
                    hideResult();
                    return;
                }
                
                const heightM = height / 100;
                bmi = weight / (heightM * heightM);
            } else {
                const weight = parseFloat(document.getElementById('weightLbs').value);
                const feet = parseFloat(document.getElementById('heightFt').value) || 0;
                const inches = parseFloat(document.getElementById('heightIn').value) || 0;
                const totalInches = (feet * 12) + inches;
                
                if (!weight || !totalInches || weight <= 0 || totalInches <= 0) {
                    hideResult();
                    return;
                }
                
                bmi = (weight / (totalInches * totalInches)) * 703;
            }
            
            displayResult(bmi);
        }

        function displayResult(bmi) {
            const resultDiv = document.getElementById('bmiResult');
            const bmiValue = document.getElementById('bmiValue');
            const bmiCategory = document.getElementById('bmiCategory');
            
            bmiValue.textContent = bmi.toFixed(1);
            
            let category, color, bgColor;
            
            if (bmi < 18.5) {
                category = 'Underweight';
                color = '#60a5fa';
                bgColor = 'rgba(96, 165, 250, 0.2)';
            } else if (bmi < 25) {
                category = 'Normal weight';
                color = '#34d399';
                bgColor = 'rgba(52, 211, 153, 0.2)';
            } else if (bmi < 30) {
                category = 'Overweight';
                color = '#fbbf24';
                bgColor = 'rgba(251, 191, 36, 0.2)';
            } else {
                category = 'Obese';
                color = '#f87171';
                bgColor = 'rgba(248, 113, 113, 0.2)';
            }
            
            bmiCategory.textContent = category;
            bmiCategory.style.color = color;
            resultDiv.style.background = bgColor;
            resultDiv.style.border = `2px solid ${color}`;
            resultDiv.style.display = 'block';
        }

        function hideResult() {
            document.getElementById('bmiResult').style.display = 'none';
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }