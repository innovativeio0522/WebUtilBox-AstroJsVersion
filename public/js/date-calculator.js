let currentMode = 'diff';

        requestIdleCallback(() => {
            // Tab switching
            document.getElementById('tab-diff').addEventListener('click', () => switchMode('diff'));
            document.getElementById('tab-add').addEventListener('click', () => switchMode('add'));
            document.getElementById('tab-age').addEventListener('click', () => switchMode('age'));

            // Calculate buttons
            document.getElementById('calcDiffBtn').addEventListener('click', calculateDifference);
            document.getElementById('calcAddBtn').addEventListener('click', calculateAddSubtract);
            document.getElementById('calcAgeBtn').addEventListener('click', calculateAge);

            // Set default dates
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('diffToDate').value = today;
            document.getElementById('addStartDate').value = today;
            document.getElementById('ageCurrentDate').value = today;
        }, { timeout: 2000 });

        function switchMode(mode) {
            currentMode = mode;
            
            // Update tabs
            ['diff', 'add', 'age'].forEach(m => {
                const tab = document.getElementById(`tab-${m}`);
                const section = document.getElementById(`${m}-section`);
                
                if (m === mode) {
                    tab.style.background = 'var(--primary)';
                    tab.style.border = 'none';
                    section.style.display = 'block';
                } else {
                    tab.style.background = 'var(--dark)';
                    tab.style.border = '1px solid var(--border)';
                    section.style.display = 'none';
                }
            });
            
            // Clear results
            document.getElementById('results').innerHTML = '<div style="text-align: center; padding: 60px 20px; color: var(--gray); font-size: 0.85rem;">Select dates and click calculate to see results</div>';
        }

        function calculateDifference() {
            const fromDate = document.getElementById('diffFromDate').value;
            const toDate = document.getElementById('diffToDate').value;
            
            if (!fromDate || !toDate) {
                showToast('Please select both dates', true);
                return;
            }
            
            const from = new Date(fromDate);
            const to = new Date(toDate);
            
            const diffTime = Math.abs(to - from);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const diffWeeks = Math.floor(diffDays / 7);
            const diffMonths = Math.floor(diffDays / 30.44);
            const diffYears = Math.floor(diffDays / 365.25);
            
            // Calculate detailed breakdown
            let years = 0, months = 0, days = 0;
            let tempDate = new Date(from);
            
            while (tempDate.getFullYear() < to.getFullYear() || 
                   (tempDate.getFullYear() === to.getFullYear() && tempDate.getMonth() < to.getMonth()) ||
                   (tempDate.getFullYear() === to.getFullYear() && tempDate.getMonth() === to.getMonth() && tempDate.getDate() < to.getDate())) {
                
                if (tempDate.getMonth() === to.getMonth() && tempDate.getFullYear() === to.getFullYear()) {
                    days = to.getDate() - tempDate.getDate();
                    break;
                } else if (tempDate.getFullYear() === to.getFullYear() && tempDate.getMonth() < to.getMonth()) {
                    months++;
                    tempDate.setMonth(tempDate.getMonth() + 1);
                } else {
                    years++;
                    tempDate.setFullYear(tempDate.getFullYear() + 1);
                }
            }
            
            const resultsHTML = `
                <div style="background: var(--dark); border-radius: 8px; padding: 20px; margin-bottom: 15px; text-align: center;">
                    <div style="font-size: 2.5rem; color: var(--primary); font-weight: 700; margin-bottom: 8px;">${diffDays}</div>
                    <div style="font-size: 0.9rem; color: var(--gray);">Total Days</div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                    <div style="background: var(--dark); border-radius: 6px; padding: 15px; text-align: center;">
                        <div style="font-size: 1.5rem; color: var(--primary); font-weight: 600;">${diffWeeks}</div>
                        <div style="font-size: 0.75rem; color: var(--gray);">Weeks</div>
                    </div>
                    <div style="background: var(--dark); border-radius: 6px; padding: 15px; text-align: center;">
                        <div style="font-size: 1.5rem; color: var(--primary); font-weight: 600;">${diffMonths}</div>
                        <div style="font-size: 0.75rem; color: var(--gray);">Months</div>
                    </div>
                </div>
                
                <div style="background: var(--dark); border-radius: 8px; padding: 15px;">
                    <div style="font-size: 0.8rem; color: var(--gray); margin-bottom: 10px;">Detailed Breakdown</div>
                    <div style="font-size: 0.9rem; color: var(--white);">
                        ${years > 0 ? `<div>${years} year${years !== 1 ? 's' : ''}</div>` : ''}
                        ${months > 0 ? `<div>${months} month${months !== 1 ? 's' : ''}</div>` : ''}
                        ${days > 0 ? `<div>${days} day${days !== 1 ? 's' : ''}</div>` : ''}
                    </div>
                </div>
            `;
            
            document.getElementById('results').innerHTML = resultsHTML;
        }

        function calculateAddSubtract() {
            const startDate = document.getElementById('addStartDate').value;
            const operation = document.getElementById('addOperation').value;
            const number = parseInt(document.getElementById('addNumber').value);
            const unit = document.getElementById('addUnit').value;
            
            if (!startDate || !number) {
                showToast('Please fill all fields', true);
                return;
            }
            
            const date = new Date(startDate);
            const multiplier = operation === 'add' ? 1 : -1;
            
            switch(unit) {
                case 'days':
                    date.setDate(date.getDate() + (number * multiplier));
                    break;
                case 'weeks':
                    date.setDate(date.getDate() + (number * 7 * multiplier));
                    break;
                case 'months':
                    date.setMonth(date.getMonth() + (number * multiplier));
                    break;
                case 'years':
                    date.setFullYear(date.getFullYear() + (number * multiplier));
                    break;
            }
            
            const resultDate = date.toISOString().split('T')[0];
            const formatted = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            
            const resultsHTML = `
                <div style="background: var(--dark); border-radius: 8px; padding: 20px; margin-bottom: 15px; text-align: center;">
                    <div style="font-size: 0.8rem; color: var(--gray); margin-bottom: 10px;">Result Date</div>
                    <div style="font-size: 1.8rem; color: var(--primary); font-weight: 700; margin-bottom: 8px;">${resultDate}</div>
                    <div style="font-size: 0.85rem; color: var(--white);">${formatted}</div>
                </div>
                
                <div style="background: var(--dark); border-radius: 8px; padding: 15px;">
                    <div style="font-size: 0.8rem; color: var(--gray); margin-bottom: 8px;">Calculation</div>
                    <div style="font-size: 0.85rem; color: var(--white);">
                        ${startDate} ${operation === 'add' ? '+' : '-'} ${number} ${unit} = ${resultDate}
                    </div>
                </div>
            `;
            
            document.getElementById('results').innerHTML = resultsHTML;
        }

        function calculateAge() {
            const birthDate = document.getElementById('ageBirthDate').value;
            const currentDate = document.getElementById('ageCurrentDate').value;
            
            if (!birthDate || !currentDate) {
                showToast('Please select both dates', true);
                return;
            }
            
            const birth = new Date(birthDate);
            const current = new Date(currentDate);
            
            if (birth > current) {
                showToast('Birth date cannot be after current date', true);
                return;
            }
            
            let years = current.getFullYear() - birth.getFullYear();
            let months = current.getMonth() - birth.getMonth();
            let days = current.getDate() - birth.getDate();
            
            if (days < 0) {
                months--;
                const prevMonth = new Date(current.getFullYear(), current.getMonth(), 0);
                days += prevMonth.getDate();
            }
            
            if (months < 0) {
                years--;
                months += 12;
            }
            
            const totalDays = Math.floor((current - birth) / (1000 * 60 * 60 * 24));
            const totalWeeks = Math.floor(totalDays / 7);
            const totalMonths = years * 12 + months;
            
            const nextBirthday = new Date(current.getFullYear(), birth.getMonth(), birth.getDate());
            if (nextBirthday < current) {
                nextBirthday.setFullYear(current.getFullYear() + 1);
            }
            const daysToNextBirthday = Math.ceil((nextBirthday - current) / (1000 * 60 * 60 * 24));
            
            const resultsHTML = `
                <div style="background: var(--dark); border-radius: 8px; padding: 20px; margin-bottom: 15px; text-align: center;">
                    <div style="font-size: 0.8rem; color: var(--gray); margin-bottom: 10px;">Current Age</div>
                    <div style="font-size: 2.5rem; color: var(--primary); font-weight: 700; margin-bottom: 8px;">${years}</div>
                    <div style="font-size: 0.9rem; color: var(--gray);">Years Old</div>
                </div>
                
                <div style="background: var(--dark); border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                    <div style="font-size: 0.8rem; color: var(--gray); margin-bottom: 10px;">Detailed Age</div>
                    <div style="font-size: 1.1rem; color: var(--white); text-align: center;">
                        ${years} years, ${months} months, ${days} days
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                    <div style="background: var(--dark); border-radius: 6px; padding: 12px; text-align: center;">
                        <div style="font-size: 1.2rem; color: var(--primary); font-weight: 600;">${totalMonths}</div>
                        <div style="font-size: 0.7rem; color: var(--gray);">Total Months</div>
                    </div>
                    <div style="background: var(--dark); border-radius: 6px; padding: 12px; text-align: center;">
                        <div style="font-size: 1.2rem; color: var(--primary); font-weight: 600;">${totalWeeks}</div>
                        <div style="font-size: 0.7rem; color: var(--gray);">Total Weeks</div>
                    </div>
                </div>
                
                <div style="background: var(--dark); border-radius: 8px; padding: 15px;">
                    <div style="font-size: 0.8rem; color: var(--gray); margin-bottom: 8px;">Next Birthday</div>
                    <div style="font-size: 0.9rem; color: var(--white);">
                        In ${daysToNextBirthday} days (${nextBirthday.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })})
                    </div>
                </div>
            `;
            
            document.getElementById('results').innerHTML = resultsHTML;
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }