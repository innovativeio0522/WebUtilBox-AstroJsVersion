const units = {
            length: {
                m: { name: 'Meters', factor: 1 },
                km: { name: 'Kilometers', factor: 0.001 },
                cm: { name: 'Centimeters', factor: 100 },
                mm: { name: 'Millimeters', factor: 1000 },
                ft: { name: 'Feet', factor: 3.28084 },
                in: { name: 'Inches', factor: 39.3701 },
                yd: { name: 'Yards', factor: 1.09361 },
                mi: { name: 'Miles', factor: 0.000621371 }
            },
            weight: {
                kg: { name: 'Kilograms', factor: 1 },
                g: { name: 'Grams', factor: 1000 },
                mg: { name: 'Milligrams', factor: 1000000 },
                lb: { name: 'Pounds', factor: 2.20462 },
                oz: { name: 'Ounces', factor: 35.274 },
                ton: { name: 'Metric Tons', factor: 0.001 }
            },
            temperature: {
                c: { name: 'Celsius (°C)' },
                f: { name: 'Fahrenheit (°F)' },
                k: { name: 'Kelvin (K)' }
            },
            volume: {
                l: { name: 'Liters', factor: 1 },
                ml: { name: 'Milliliters', factor: 1000 },
                gal: { name: 'Gallons (US)', factor: 0.264172 },
                qt: { name: 'Quarts', factor: 1.05669 },
                pt: { name: 'Pints', factor: 2.11338 },
                cup: { name: 'Cups', factor: 4.22675 },
                m3: { name: 'Cubic Meters', factor: 0.001 }
            },
            area: {
                m2: { name: 'Square Meters', factor: 1 },
                km2: { name: 'Square Kilometers', factor: 0.000001 },
                cm2: { name: 'Square Centimeters', factor: 10000 },
                ft2: { name: 'Square Feet', factor: 10.7639 },
                in2: { name: 'Square Inches', factor: 1550 },
                acre: { name: 'Acres', factor: 0.000247105 },
                ha: { name: 'Hectares', factor: 0.0001 }
            },
            speed: {
                ms: { name: 'Meters/Second', factor: 1 },
                kmh: { name: 'Kilometers/Hour', factor: 3.6 },
                mph: { name: 'Miles/Hour', factor: 2.23694 },
                knot: { name: 'Knots', factor: 1.94384 },
                fps: { name: 'Feet/Second', factor: 3.28084 }
            }
        };

        function updateUnits() {
            const category = document.getElementById('category').value;
            const categoryUnits = units[category];
            
            const fromUnit = document.getElementById('fromUnit');
            const toUnit = document.getElementById('toUnit');
            
            fromUnit.innerHTML = '';
            toUnit.innerHTML = '';
            
            for (const [key, value] of Object.entries(categoryUnits)) {
                fromUnit.innerHTML += `<option value="${key}">${value.name}</option>`;
                toUnit.innerHTML += `<option value="${key}">${value.name}</option>`;
            }
            
            // Set different default units
            if (toUnit.options.length > 1) {
                toUnit.selectedIndex = 1;
            }
            
            convert();
            updateQuickConversions();
        }

        function convert() {
            const category = document.getElementById('category').value;
            const fromValue = parseFloat(document.getElementById('fromValue').value) || 0;
            const fromUnit = document.getElementById('fromUnit').value;
            const toUnit = document.getElementById('toUnit').value;
            
            let result;
            
            if (category === 'temperature') {
                result = convertTemperature(fromValue, fromUnit, toUnit);
            } else {
                const fromFactor = units[category][fromUnit].factor;
                const toFactor = units[category][toUnit].factor;
                result = (fromValue / fromFactor) * toFactor;
            }
            
            document.getElementById('toValue').value = result.toFixed(6).replace(/\.?0+$/, '');
            
            const fromName = units[category][fromUnit].name;
            const toName = units[category][toUnit].name;
            document.getElementById('result').textContent = 
                `${fromValue} ${fromName} = ${result.toFixed(4).replace(/\.?0+$/, '')} ${toName}`;
        }

        function convertTemperature(value, from, to) {
            // Convert to Celsius first
            let celsius;
            if (from === 'c') celsius = value;
            else if (from === 'f') celsius = (value - 32) * 5/9;
            else if (from === 'k') celsius = value - 273.15;
            
            // Convert from Celsius to target
            if (to === 'c') return celsius;
            else if (to === 'f') return celsius * 9/5 + 32;
            else if (to === 'k') return celsius + 273.15;
        }

        function swap() {
            const fromUnit = document.getElementById('fromUnit');
            const toUnit = document.getElementById('toUnit');
            const fromValue = document.getElementById('fromValue');
            const toValue = document.getElementById('toValue');
            
            const tempUnit = fromUnit.value;
            fromUnit.value = toUnit.value;
            toUnit.value = tempUnit;
            
            fromValue.value = toValue.value;
            
            convert();
            showToast('Units swapped');
        }

        function updateQuickConversions() {
            const category = document.getElementById('category').value;
            const quickDiv = document.getElementById('quickConversions');
            
            const examples = {
                length: ['1 in = 2.54 cm', '1 ft = 30.48 cm', '1 m = 3.28 ft', '1 km = 0.621 mi'],
                weight: ['1 kg = 2.20 lb', '1 lb = 453.59 g', '1 oz = 28.35 g', '1 ton = 1000 kg'],
                temperature: ['0°C = 32°F', '100°C = 212°F', '20°C = 68°F', '37°C = 98.6°F'],
                volume: ['1 L = 0.264 gal', '1 gal = 3.785 L', '1 cup = 236.59 mL', '1 m³ = 1000 L'],
                area: ['1 m² = 10.76 ft²', '1 acre = 4047 m²', '1 ha = 10000 m²', '1 km² = 247 acres'],
                speed: ['1 m/s = 3.6 km/h', '1 mph = 1.609 km/h', '1 knot = 1.852 km/h', '100 km/h = 62.1 mph']
            };
            
            quickDiv.innerHTML = examples[category].map(ex => 
                `<div style="padding: 6px 10px; background: var(--light); border-radius: 6px; border-left: 3px solid var(--primary);">${ex}</div>`
            ).join('');
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }

        // Initialize
        updateUnits();