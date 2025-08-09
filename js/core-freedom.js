// Simplified cash account logic for freedom mode
(function(){
  let runningBalance = 0;

  function format(val){ return window.formatNumberWithSign ? window.formatNumberWithSign(val) : (val>=0?"+":"")+val; }

  function updateDisplay(){
    const el = document.getElementById('current-balance');
    if(el){ el.textContent = format(runningBalance); el.style.color = runningBalance < 0 ? 'var(--danger)' : 'inherit'; }
  }

  function addEntryField(){
    const ul = document.getElementById('entries');
    if(!ul) return;
    const li = document.createElement('li');
    const inp = document.createElement('input');
    inp.type='number';
    inp.placeholder='€';
    inp.addEventListener('keydown', e => {
      if(e.key==='Enter'){ finalize(inp); }
    });
    li.append(inp);
    ul.prepend(li);
    inp.focus();
  }

  function finalize(inp){
    const raw = inp.value.trim();
    const val = window.parseFormattedNumber ? (window.parseFormattedNumber(raw) || 0) : (parseFloat(raw)||0);
    runningBalance += val;
    inp.readOnly = true;
    inp.type='text';
    inp.value = format(val);
    if(val<0) inp.style.color='var(--danger)'; else if(val>0) inp.style.color='var(--primary)';
    const sumLi = document.createElement('li');
    const sumInp = document.createElement('input');
    sumInp.type='text'; sumInp.readOnly=true; sumInp.classList.add('balance-snapshot');
    sumInp.value = format(runningBalance);
    if(runningBalance<0) sumInp.style.color='var(--danger)';
    sumLi.append(sumInp);
    inp.parentNode.before(sumLi);
    updateDisplay();
    addEntryField();
  }

  function resetAll(){
    runningBalance = 0;
    const ul = document.getElementById('entries');
    if(ul) ul.innerHTML='';
    updateDisplay();
    addEntryField();
  }

  function init(){
    document.getElementById('btn-reset')?.addEventListener('click', resetAll);
    document.getElementById('btn-return')?.addEventListener('click', () => { window.location.href='index.html'; });
    resetAll();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
