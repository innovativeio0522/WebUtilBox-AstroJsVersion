// Set current date as default — deferred until browser is idle
        requestIdleCallback(() => {
            document.getElementById('currentDate').valueAsDate = new Date();
        }, { timeout: 1000 });

        function calculateAge() {
            const birthDate = new Date(document.getElementById('birthDate').value);
            const currentDate = new Date(document.getElementById('currentDate').value);

            if (!document.getElementById('birthDate').value || !document.getElementById('currentDate').value) {
                hideResults();
                return;
            }

            if (birthDate > currentDate) {
                showToast('Birth date cannot be in the future', true);
                hideResults();
                return;
            }

            // Calculate age
            let years = currentDate.getFullYear() - birthDate.getFullYear();
            let months = currentDate.getMonth() - birthDate.getMonth();
            let days = currentDate.getDate() - birthDate.getDate();

            if (days < 0) {
                months--;
                const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
                days += prevMonth.getDate();
            }

            if (months < 0) {
                years--;
                months += 12;
            }

            // Calculate totals
            const totalDays = Math.floor((currentDate - birthDate) / (1000 * 60 * 60 * 24));
            const totalWeeks = Math.floor(totalDays / 7);
            const totalMonths = years * 12 + months;
            const totalHours = totalDays * 24;

            // Display main age
            document.getElementById('ageYears').textContent = `${years} ${years === 1 ? 'Year' : 'Years'}`;
            document.getElementById('ageDetails').textContent = `${months} ${months === 1 ? 'month' : 'months'}, ${days} ${days === 1 ? 'day' : 'days'}`;

            // Display totals
            document.getElementById('totalMonths').textContent = totalMonths.toLocaleString();
            document.getElementById('totalWeeks').textContent = totalWeeks.toLocaleString();
            document.getElementById('totalDays').textContent = totalDays.toLocaleString();
            document.getElementById('totalHours').textContent = totalHours.toLocaleString();

            // Calculate next birthday
            let nextBirthday = new Date(currentDate.getFullYear(), birthDate.getMonth(), birthDate.getDate());
            if (nextBirthday < currentDate) {
                nextBirthday.setFullYear(currentDate.getFullYear() + 1);
            }

            const daysUntilBirthday = Math.ceil((nextBirthday - currentDate) / (1000 * 60 * 60 * 24));
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

            document.getElementById('nextBirthday').textContent = nextBirthday.toLocaleDateString();
            document.getElementById('daysUntil').textContent = `${daysUntilBirthday} days`;
            document.getElementById('dayOfWeek').textContent = dayNames[nextBirthday.getDay()];

            // Show results
            document.getElementById('mainAge').style.display = 'block';
            document.getElementById('breakdown').style.display = 'block';
        }

        function hideResults() {
            document.getElementById('mainAge').style.display = 'none';
            document.getElementById('breakdown').style.display = 'none';
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }