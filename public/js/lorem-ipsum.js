const textLibrary = {
            classic: {
                start: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                words: "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum".split(' ')
            },
            cicero: {
                start: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
                words: "sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt".split(' ')
            },
            kafka: {
                start: "One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.",
                words: "one morning when gregor samsa woke from troubled dreams he found himself transformed in his bed into a horrible vermin lay on his armour-like back and if lifted head slightly could see brown belly slightly domed divided by arches into stiff sections bedding was hardly able to cover it seemed ready slide off any moment".split(' ')
            },
            bacon: {
                start: "Bacon ipsum dolor amet ribeye strip steak pork chop, beef ribs chicken turkey ham hock.",
                words: "bacon ipsum dolor amet ribeye strip steak pork chop beef ribs chicken turkey ham hock brisket meatball kielbasa short loin picanha pork belly pastrami jerky sausage salami shank prosciutto pancetta drumstick sirloin tri-tip flank chuck tenderloin bresaola venison capicola spare ribs ground round tail fatback".split(' ')
            },
            hipster: {
                start: "Artisan cold-pressed kombucha, sustainable organic farm-to-table craft beer vegan gluten-free.",
                words: "artisan cold-pressed kombucha sustainable organic farm-to-table craft beer vegan gluten-free kale chips quinoa sriracha brooklyn fixie beard mustache vinyl typewriter messenger bag bicycle rights pour-over single-origin coffee aesthetic chambray flannel letterpress gastropub food truck locavore meditation yoga authentic ethical".split(' ')
            },
            corporate: {
                start: "Synergize strategic initiatives to leverage core competencies and drive actionable insights.",
                words: "synergize strategic initiatives leverage core competencies drive actionable insights optimize deliverables streamline workflows maximize ROI paradigm shift best practices value proposition scalable solutions innovative thinking disruptive technology thought leadership stakeholder engagement bandwidth utilization circle back touch base low-hanging fruit move needle game-changer".split(' ')
            }
        };

        function updatePlaceholder() {
            const type = document.getElementById('generateType').value;
            const amountInput = document.getElementById('amount');
            
            if (type === 'paragraphs') {
                amountInput.max = 50;
                amountInput.value = Math.min(amountInput.value, 50);
            } else if (type === 'words') {
                amountInput.max = 1000;
            } else {
                amountInput.max = 100;
            }
        }

        function generateText() {
            const type = document.getElementById('generateType').value;
            const amount = parseInt(document.getElementById('amount').value) || 5;
            const startWithLorem = document.getElementById('startWithLorem').checked;
            const textType = document.querySelector('input[name="textType"]:checked').value;
            
            const library = textLibrary[textType];
            let result = [];
            
            if (type === 'paragraphs') {
                for (let i = 0; i < amount; i++) {
                    let paragraph = [];
                    const sentenceCount = 3 + Math.floor(Math.random() * 5);
                    
                    for (let j = 0; j < sentenceCount; j++) {
                        const wordCount = 8 + Math.floor(Math.random() * 12);
                        let sentence = [];
                        
                        if (i === 0 && j === 0 && startWithLorem) {
                            sentence.push(library.start);
                        } else {
                            for (let k = 0; k < wordCount; k++) {
                                sentence.push(library.words[Math.floor(Math.random() * library.words.length)]);
                            }
                            sentence = sentence.join(' ');
                            sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
                        }
                        
                        paragraph.push(sentence);
                    }
                    result.push(paragraph.join(' '));
                }
                result = result.join('\n\n');
                
            } else if (type === 'words') {
                if (startWithLorem) {
                    result.push(library.start.split(' ').slice(0, Math.min(amount, library.start.split(' ').length)).join(' '));
                    const remaining = amount - library.start.split(' ').length;
                    if (remaining > 0) {
                        for (let i = 0; i < remaining; i++) {
                            result.push(library.words[Math.floor(Math.random() * library.words.length)]);
                        }
                    }
                } else {
                    for (let i = 0; i < amount; i++) {
                        result.push(library.words[Math.floor(Math.random() * library.words.length)]);
                    }
                }
                result = result.join(' ');
                
            } else { // sentences
                for (let i = 0; i < amount; i++) {
                    if (i === 0 && startWithLorem) {
                        result.push(library.start);
                    } else {
                        const wordCount = 8 + Math.floor(Math.random() * 12);
                        let sentence = [];
                        for (let j = 0; j < wordCount; j++) {
                            sentence.push(library.words[Math.floor(Math.random() * library.words.length)]);
                        }
                        sentence = sentence.join(' ');
                        sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
                        result.push(sentence);
                    }
                }
                result = result.join(' ');
            }
            
            showOutput(result);
            
            // Update word count
            const wordCount = result.trim().split(/\s+/).length;
            document.getElementById('wordCount').textContent = `(${wordCount} words)`;
            
            showToast('Text generated!');
        }

        function showOutput(text) {
            const content = document.getElementById('outputText');
            content.textContent = text;
            content.style.color = 'var(--white)';
        }

        function copyOutput() {
            const text = document.getElementById('outputText')?.textContent;
            if (!text || text === 'Click "Generate Text" to create placeholder text...') {
                return showToast('Generate text first', true);
            }
            
            navigator.clipboard.writeText(text).then(() => {
                showToast('Text copied to clipboard!');
            });
        }

        function clearOutput() {
            const content = document.getElementById('outputText');
            content.textContent = 'Click "Generate Text" to create placeholder text...';
            content.style.color = 'var(--gray)';
            document.getElementById('wordCount').textContent = '';
            showToast('Cleared');
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            msg.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }

        // Initialize
        updatePlaceholder();