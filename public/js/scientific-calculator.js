let display=document.getElementById('display');
let current='0';
function addNum(n){if(current==='0'&&n!=='.')current=n;else current+=n;updateDisplay()}
function addFunc(f){if(current==='0')current=f;else current+=f;updateDisplay()}
function updateDisplay(){display.textContent=current.replace(/Math\.PI/g,'p').replace(/Math\.E/g,'e').replace(/Math\.sqrt/g,'v').replace(/Math\.log10/g,'log').replace(/Math\.log/g,'ln').replace(/Math\.pow/g,'^')}
function clearDisplay(){current='0';updateDisplay()}
function backspace(){current=current.length>1?current.slice(0,-1):'0';updateDisplay()}
function calculate(){try{let expr=current.replace(/sin\(/g,'Math.sin(').replace(/cos\(/g,'Math.cos(').replace(/tan\(/g,'Math.tan(').replace(/log\(/g,'Math.log10(').replace(/ln\(/g,'Math.log(').replace(/sqrt\(/g,'Math.sqrt(').replace(/pow\(/g,'Math.pow(').replace(/\^/g,'**');let result=eval(expr);current=result.toString();updateDisplay()}catch(e){current='Error';updateDisplay();setTimeout(()=>{current='0';updateDisplay()},2000)}}
document.addEventListener('keydown',e=>{if(e.key>='0'&&e.key<='9'||e.key==='.')addNum(e.key);else if(e.key==='+'||e.key==='-'||e.key==='*'||e.key==='/')addNum(e.key);else if(e.key==='Enter')calculate();else if(e.key==='Escape')clearDisplay();else if(e.key==='Backspace')backspace()});
function showToast(message,isError=false){const toast=document.getElementById('toast');const msg=document.getElementById('toastMessage');msg.textContent=message;toast.className='toast show'+(isError?' error':'');setTimeout(()=>toast.classList.remove('show'),3000)}