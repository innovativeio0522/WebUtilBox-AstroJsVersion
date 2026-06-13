function updateCron() {
            // Show/hide value inputs based on type
            ['minute', 'hour', 'day', 'month', 'weekday'].forEach(field => {
                const type = document.getElementById(field + 'Type').value;
                const valueInput = document.getElementById(field + 'Value');
                if (valueInput) {
                    valueInput.style.display = type === 'specific' || type === 'interval' ? 'block' : 'none';
                }
            });

            // Build cron expression
            const minute = getCronField('minute');
            const hour = getCronField('hour');
            const day = getCronField('day');
            const month = getCronField('month');
            const weekday = getCronField('weekday');

            const cron = `${minute} ${hour} ${day} ${month} ${weekday}`;
            document.getElementById('cronExpression').value = cron;
            document.getElementById('cronDescription').textContent = describeCron(cron);
        }

        function getCronField(field) {
            const type = document.getElementById(field + 'Type').value;
            const value = document.getElementById(field + 'Value')?.value || '0';

            if (type === '*') return '*';
            if (type === 'specific') return value;
            if (type === 'interval') return `*/${value}`;
            return '*';
        }

        function describeCron(cron) {
            const [min, hour, day, month, weekday] = cron.split(' ');
            let desc = [];

            // Minute
            if (min === '*') desc.push('every minute');
            else if (min.includes('/')) desc.push(`every ${min.split('/')[1]} minutes`);
            else desc.push(`at minute ${min}`);

            // Hour
            if (hour !== '*') {
                if (hour.includes('/')) desc.push(`every ${hour.split('/')[1]} hours`);
                else desc.push(`at ${hour}:00`);
            }

            // Day
            if (day !== '*') desc.push(`on day ${day}`);

            // Month
            if (month !== '*') {
                const months = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                desc.push(`in ${months[parseInt(month)]}`);
            }

            // Weekday
            if (weekday !== '*') {
                const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                desc.push(`on ${days[parseInt(weekday)]}`);
            }

            return desc.join(', ');
        }

        function setPreset(cron) {
            const [min, hour, day, month, weekday] = cron.split(' ');
            
            // Reset all to defaults
            document.getElementById('minuteType').value = min === '*' ? '*' : 'specific';
            document.getElementById('hourType').value = hour === '*' ? '*' : 'specific';
            document.getElementById('dayType').value = day === '*' ? '*' : 'specific';
            document.getElementById('monthType').value = month === '*' ? '*' : 'specific';
            document.getElementById('weekdayType').value = weekday === '*' ? '*' : 'specific';

            if (min !== '*') document.getElementById('minuteValue').value = min;
            if (hour !== '*') document.getElementById('hourValue').value = hour;
            if (day !== '*') document.getElementById('dayValue').value = day;
            if (month !== '*') document.getElementById('monthValue').value = month;
            if (weekday !== '*') document.getElementById('weekdayValue').value = weekday;

            updateCron();
        }

        function copyCron() {
            const cron = document.getElementById('cronExpression').value;
            navigator.clipboard.writeText(cron).then(() => showToast('Cron expression copied!'));
        }

        function showToast(message) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show';
            setTimeout(() => toast.classList.remove('show'), 3000);
        }

        updateCron();