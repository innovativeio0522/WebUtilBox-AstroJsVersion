let currentDelimiter=',';
        let items=[];

        function setDelimiter(delimiter,type){
            document.querySelectorAll('.preset-btn').forEach(btn=>btn.classList.remove('active'));
            event.target.classList.add('active');
            
            if(type==='custom'){
                document.getElementById('customDelimiter').style.display='block';
                document.getElementById('customDelimiter').focus();
            }else{
                document.getElementById('customDelimiter').style.display='none';
                currentDelimiter=delimiter;
            }
        }

        function splitText(){
            const text=document.getElementById('inputText').value;
            if(!text.trim()){
                showToast('Please enter some text',true);
                return;
            }

            let delimiter=currentDelimiter;
            const customInput=document.getElementById('customDelimiter');
            if(customInput.style.display==='block'){
                delimiter=customInput.value||',';
            }

            // Handle special characters
            if(delimiter==='\\n')delimiter='\n';
            if(delimiter==='\\t')delimiter='\t';

            // Split
            items=text.split(delimiter);

            // Options
            if(document.getElementById('trimItems').checked){
                items=items.map(item=>item.trim());
            }
            if(document.getElementById('removeEmpty').checked){
                items=items.filter(item=>item.length>0);
            }
            if(document.getElementById('removeDuplicates').checked){
                items=[...new Set(items)];
            }

            document.getElementById('itemCount').textContent=`${items.length} items`;
            formatOutput('list');
            document.getElementById('results').style.display='block';
            showToast('Text split successfully!');
        }

        function formatOutput(format){
            let output='';
            
            switch(format){
                case 'list':
                    output=items.join('\n');
                    break;
                case 'numbered':
                    output=items.map((item,idx)=>`${idx+1}. ${item}`).join('\n');
                    break;
                case 'comma':
                    output=items.join(', ');
                    break;
                case 'array':
                    output=JSON.stringify(items,null,2);
                    break;
                case 'json':
                    output=JSON.stringify({items},null,2);
                    break;
                case 'quoted':
                    output=items.map(item=>`"${item}"`).join(', ');
                    break;
            }

            document.getElementById('output').textContent=output;
        }

        function copyOutput(){
            const output=document.getElementById('output').textContent;
            navigator.clipboard.writeText(output).then(()=>{
                showToast('Copied to clipboard!');
            });
        }

        function clearAll(){
            document.getElementById('inputText').value='';
            document.getElementById('results').style.display='none';
            items=[];
            showToast('Cleared');
        }

        function showToast(message,isError=false){
            const toast=document.getElementById('toast');
            const msg=document.getElementById('toastMessage');
            msg.textContent=message;
            toast.className='toast show'+(isError?' error':'');
            setTimeout(()=>toast.classList.remove('show'),3000);
        }