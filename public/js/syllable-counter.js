function countSyllablesInWord(word){
            word=word.toLowerCase().replace(/[^a-z]/g,'');
            if(word.length<=3)return 1;
            
            word=word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/,'');
            word=word.replace(/^y/,'');
            const matches=word.match(/[aeiouy]{1,2}/g);
            return matches?matches.length:1;
        }

        function countSyllables(){
            const text=document.getElementById('inputText').value.trim();
            if(!text){
                showToast('Please enter some text',true);
                return;
            }

            const words=text.match(/\b[a-zA-Z]+\b/g)||[];
            const wordData=words.map(word=>({
                word,
                syllables:countSyllablesInWord(word)
            }));

            const totalSyllables=wordData.reduce((sum,item)=>sum+item.syllables,0);
            const totalWords=words.length;
            const avgSyllables=(totalSyllables/totalWords).toFixed(2);
            
            // Readability estimate (simplified)
            const readabilityScore=avgSyllables<=1.5?'Very Easy':avgSyllables<=2?'Easy':avgSyllables<=2.5?'Medium':avgSyllables<=3?'Difficult':'Very Difficult';

            displayResults(totalSyllables,totalWords,avgSyllables,readabilityScore,wordData);
            showToast('Syllables counted!');
        }

        function displayResults(total,words,avg,readability,wordData){
            document.getElementById('statsGrid').innerHTML=`
                <div class="stat-card">
                    <div class="stat-number">${total}</div>
                    <div class="stat-label">Total Syllables</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${words}</div>
                    <div class="stat-label">Total Words</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${avg}</div>
                    <div class="stat-label">Avg per Word</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" style="font-size:1.5rem">${readability}</div>
                    <div class="stat-label">Readability</div>
                </div>
            `;

            document.getElementById('wordList').innerHTML=wordData.map(item=>`
                <div class="word-item">
                    <span style="font-weight:600">${item.word}</span>
                    <span style="color:var(--primary)">${item.syllables} syllable${item.syllables>1?'s':''}</span>
                </div>
            `).join('');

            document.getElementById('results').style.display='block';
        }

        function copyResults(){
            const text=document.getElementById('inputText').value;
            const words=text.match(/\b[a-zA-Z]+\b/g)||[];
            
            let result='Syllable Count Results\n--------------------\n\n';
            words.forEach(word=>{
                const count=countSyllablesInWord(word);
                result+=`${word}: ${count} syllable${count>1?'s':''}\n`;
            });
            
            const total=words.reduce((sum,word)=>sum+countSyllablesInWord(word),0);
            result+=`\nTotal: ${total} syllables in ${words.length} words`;

            navigator.clipboard.writeText(result).then(()=>{
                showToast('Results copied!');
            });
        }

        function clearAll(){
            document.getElementById('inputText').value='';
            document.getElementById('results').style.display='none';
            showToast('Cleared');
        }

        function showToast(message,isError=false){
            const toast=document.getElementById('toast');
            const msg=document.getElementById('toastMessage');
            msg.textContent=message;
            toast.className='toast show'+(isError?' error':'');
            setTimeout(()=>toast.classList.remove('show'),3000);
        }