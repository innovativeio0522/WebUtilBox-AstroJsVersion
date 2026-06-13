const commonWords=new Set(['the','be','to','of','and','a','in','that','have','i','it','for','not','on','with','he','as','you','do','at','this','but','his','by','from','they','we','say','her','she','or','an','will','my','one','all','would','there','their','what','so','up','out','if','about','who','get','which','go','me','when','make','can','like','time','no','just','him','know','take','people','into','year','your','good','some','could','them','see','other','than','then','now','look','only','come','its','over','think','also','back','after','use','two','how','our','work','first','well','way','even','new','want','because','any','these','give','day','most','us']);
        
        let freqData=[];
        let sortColumn='count';
        let sortAsc=false;

        function analyzeFrequency(){
            const text=document.getElementById('inputText').value.trim();
            if(!text){
                showToast('Please enter some text',true);
                return;
            }

            const caseSensitive=document.getElementById('caseSensitive').checked;
            const ignoreCommon=document.getElementById('ignoreCommon').checked;
            const minLength=parseInt(document.getElementById('minLength').value)||1;

            // Extract words
            let words=text.match(/\b[a-zA-Z]+\b/g)||[];
            if(!caseSensitive)words=words.map(w=>w.toLowerCase());
            
            // Filter
            words=words.filter(w=>w.length>=minLength);
            if(ignoreCommon)words=words.filter(w=>!commonWords.has(w.toLowerCase()));

            // Count frequency
            const freqMap={};
            words.forEach(w=>{
                freqMap[w]=(freqMap[w]||0)+1;
            });

            // Convert to array
            const totalWords=words.length;
            freqData=Object.entries(freqMap).map(([word,count])=>({
                word,
                count,
                percent:((count/totalWords)*100).toFixed(2)
            }));

            // Sort by count descending
            freqData.sort((a,b)=>b.count-a.count);

            displayResults(totalWords);
            showToast('Analysis complete!');
        }

        function displayResults(totalWords){
            // Summary
            const uniqueWords=freqData.length;
            const mostCommon=freqData[0]||{word:'-',count:0};
            const avgFreq=(totalWords/uniqueWords).toFixed(1);

            document.getElementById('summary').innerHTML=`
                <div class="summary-card">
                    <div class="summary-number">${totalWords}</div>
                    <div class="summary-label">Total Words</div>
                </div>
                <div class="summary-card">
                    <div class="summary-number">${uniqueWords}</div>
                    <div class="summary-label">Unique Words</div>
                </div>
                <div class="summary-card">
                    <div class="summary-number">${mostCommon.word}</div>
                    <div class="summary-label">Most Common (${mostCommon.count}x)</div>
                </div>
                <div class="summary-card">
                    <div class="summary-number">${avgFreq}</div>
                    <div class="summary-label">Avg Frequency</div>
                </div>
            `;

            // Table
            renderTable();
            document.getElementById('results').style.display='block';
        }

        function renderTable(){
            const tbody=document.getElementById('freqTableBody');
            const maxCount=Math.max(...freqData.map(d=>d.count));
            
            tbody.innerHTML=freqData.map((item,idx)=>`
                <tr>
                    <td style="color:var(--gray)">${idx+1}</td>
                    <td style="font-weight:600">${item.word}</td>
                    <td>${item.count}</td>
                    <td>${item.percent}%</td>
                    <td><div class="freq-bar" style="width:${(item.count/maxCount)*100}%"></div></td>
                </tr>
            `).join('');
        }

        function sortTable(column){
            if(sortColumn===column){
                sortAsc=!sortAsc;
            }else{
                sortColumn=column;
                sortAsc=column==='word';
            }

            freqData.sort((a,b)=>{
                let valA=column==='rank'?freqData.indexOf(a):a[column];
                let valB=column==='rank'?freqData.indexOf(b):b[column];
                
                if(column==='count'||column==='percent'){
                    valA=parseFloat(valA);
                    valB=parseFloat(valB);
                }

                if(sortAsc)return valA>valB?1:-1;
                return valA<valB?1:-1;
            });

            renderTable();
        }

        function exportCSV(){
            if(!freqData.length){
                showToast('No data to export',true);
                return;
            }

            let csv='Rank,Word,Count,Percentage\n';
            freqData.forEach((item,idx)=>{
                csv+=`${idx+1},"${item.word}",${item.count},${item.percent}%\n`;
            });

            const blob=new Blob([csv],{type:'text/csv'});
            const url=URL.createObjectURL(blob);
            const a=document.createElement('a');
            a.href=url;
            a.download='word-frequency.csv';
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