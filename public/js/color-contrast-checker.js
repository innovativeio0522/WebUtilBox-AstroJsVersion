function getLuminance(r,g,b){const a=[r,g,b].map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)});return a[0]*0.2126+a[1]*0.7152+a[2]*0.0722}
function getContrast(fg,bg){const l1=getLuminance(...fg);const l2=getLuminance(...bg);const lighter=Math.max(l1,l2);const darker=Math.min(l1,l2);return(lighter+0.05)/(darker+0.05)}
function hexToRgb(hex){const result=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);return result?[parseInt(result[1],16),parseInt(result[2],16),parseInt(result[3],16)]:null}
function checkContrast(){const fgHex=document.getElementById('fgColor').value;const bgHex=document.getElementById('bgColor').value;document.getElementById('fgHex').value=fgHex;document.getElementById('bgHex').value=bgHex;const fg=hexToRgb(fgHex);const bg=hexToRgb(bgHex);if(!fg||!bg)return;const ratio=getContrast(fg,bg);document.getElementById('ratio').textContent=ratio.toFixed(2)+':1';document.getElementById('preview').style.color=fgHex;document.getElementById('preview').style.background=bgHex;const aaLarge=ratio>=3;const aaNormal=ratio>=4.5;const aaaLarge=ratio>=4.5;const aaaNormal=ratio>=7;document.getElementById('compliance').innerHTML=`
<div class="compliance-card ${aaNormal?'pass':'fail'}">
<div class="status-icon">${aaNormal?'?':'?'}</div>
<div style="font-weight:600;margin-bottom:5px">AA Normal</div>
<div style="color:var(--gray);font-size:0.9rem">4.5:1 required</div>
</div>
<div class="compliance-card ${aaLarge?'pass':'fail'}">
<div class="status-icon">${aaLarge?'?':'?'}</div>
<div style="font-weight:600;margin-bottom:5px">AA Large</div>
<div style="color:var(--gray);font-size:0.9rem">3:1 required</div>
</div>
<div class="compliance-card ${aaaNormal?'pass':'fail'}">
<div class="status-icon">${aaaNormal?'?':'?'}</div>
<div style="font-weight:600;margin-bottom:5px">AAA Normal</div>
<div style="color:var(--gray);font-size:0.9rem">7:1 required</div>
</div>
<div class="compliance-card ${aaaLarge?'pass':'fail'}">
<div class="status-icon">${aaaLarge?'?':'?'}</div>
<div style="font-weight:600;margin-bottom:5px">AAA Large</div>
<div style="color:var(--gray);font-size:0.9rem">4.5:1 required</div>
</div>
`}
function updateFromHex(type){const hex=document.getElementById(type+'Hex').value;if(/^#[0-9A-F]{6}$/i.test(hex)){document.getElementById(type+'Color').value=hex;checkContrast()}}
function swapColors(){const fg=document.getElementById('fgColor').value;const bg=document.getElementById('bgColor').value;document.getElementById('fgColor').value=bg;document.getElementById('bgColor').value=fg;checkContrast();showToast('Colors swapped')}
function randomColors(){document.getElementById('fgColor').value='#'+Math.floor(Math.random()*16777215).toString(16).padStart(6,'0');document.getElementById('bgColor').value='#'+Math.floor(Math.random()*16777215).toString(16).padStart(6,'0');checkContrast();showToast('Random colors generated')}
function copyColors(){const fg=document.getElementById('fgColor').value;const bg=document.getElementById('bgColor').value;const text=`Foreground: ${fg}\nBackground: ${bg}\nContrast Ratio: ${document.getElementById('ratio').textContent}`;navigator.clipboard.writeText(text).then(()=>showToast('Colors copied!'))}
function showToast(message,isError=false){const toast=document.getElementById('toast');const msg=document.getElementById('toastMessage');msg.textContent=message;toast.className='toast show'+(isError?' error':'');setTimeout(()=>toast.classList.remove('show'),3000)}
checkContrast();