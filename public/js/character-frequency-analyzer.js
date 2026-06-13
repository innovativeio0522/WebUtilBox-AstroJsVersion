let freqData=[];

        function analyzeFrequency(){
            const text=document.getElementById('inputText').value;
            if(!text){
                showToast('Please enter some text',true);
                return;
            }

            const caseSensitive=document.getElementById('caseSensitive').checked;
            const lettersOnly=document.getElementById('lettersOnly').checked;
            const includeSpaces=document.getElementById('includeSpaces').checked;

            let chars=text.split('');
            
            // Filter
            if(lettersOnly){
                chars=chars.filter(c=>/[a-zA-Z]/.test(c));
            }
            if(!includeSpaces){
                chars=chars.filter(c=>c!==' ');
            }
            if(!caseSensitive){
                chars=chars.map(c=>c.toLowerCase());
            }

            // Count frequency
            const freqMap={};
            chars.forEach(c=>{
                freqMap[c]=(freqMap[c]||0)+1;
            });

            // Convert to array
            const totalChars=chars.length;
            freqData=Object.entries(freqMap).map(([char,count])=>({
                char,
                count,
                percent:((count/totalChars)*100).toFixed(2)
            }));

            // Sort by count descending
            freqData.sort((a,b)=>b.count-a.count);

            displayResults(totalChars);
            showToast('Analysis complete!');
        }

        function displayResults(total){
            const unique=freqData.length;
            const mostCommon=freqData[0]||{char:'-',count:0};
            const leastCommon=freqData[freqData.length-1]||{char:'-',count:0};

            document.getElementById('summary').innerHTML=`
                <div class="summary-card">
                    <div class="summary-number">${total}</div>
                    <div class="summary-label">Total Characters</div>
                </div>
                <div class="summary-card">
                    <div class="summary-number">${unique}</div>
                    <div class="summary-label">Unique Characters</div>
                </div>
                <div class="summary-card">
                    <div class="summary-number">${mostCommon.char}</div>
                    <div class="summary-label">Most Common (${mostCommon.count}x)</div>
                </div>
                <div class="summary-card">
                    <div class="summary-number">${leastCommon.char}</div>
                    <div class="summary-label">Least Common (${leastCommon.count}x)</div>
                </div>
            `;

            // Character grid
            document.getElementById('charGrid').innerHTML=freqData.map(item=>`
                <div class="char-card">
                    <div class="char-letter">${item.char===' '?'?':item.char}</div>
                    <div class="char-count">${item.count}x</div>
                    <div class="char-percent">${item.percent}%</div>
                </div>
            `).join('');

            // Chart
            const maxCount=Math.max(...freqData.map(d=>d.count));
            document.getElementById('chart').innerHTML=freqData.slice(0,15).map(item=>`
                <div style="margin-bottom:10px">
                    <div style="display:flex;justify-content:space-between;margin-bottom:3px">
                        <span style="font-weight:600">${item.char===' '?'Space':item.char}</span>
                        <span style="color:var(--gray)">${item.count} (${item.percent}%)</span>
                    </div>
                    <div class="chart-bar" style="width:${(item.count/maxCount)*100}%"></div>
                </div>
            `).join('');

            document.getElementById('results').style.display='block';
        }

        function exportData(){
            if(!freqData.length){
                showToast('No data to export',true);
                return;
            }

            let csv='Character,Count,Percentage\n';
            freqData.forEach(item=>{
                csv+=`"${item.char}",${item.count},${item.percent}%\n`;
            });

            const blob=new Blob([csv],{type:'text/csv'});
            const url=URL.createObjectURL(blob);
            const a=document.createElement('a');
            a.href=url;
            a.download='character-frequency.csv';
            a.click();
            URL.revokeObjectURL(url);
            showToast('CSV exported!');
        }

        function clearAll(){
            document.getElementById('inputText').value='';
            document.getElementById('results').style.display='none';
            freqData=[];
            showToast('Cleared');
        }

        function showToast(message,isError=false){
            const toast=document.getElementById('toast');
            const msg=document.getElementById('toastMessage');
            msg.textContent=message;
            toast.className='toast show'+(isError?' error':'');
            setTimeout(()=>toast.classList.remove('show'),3000);
        }