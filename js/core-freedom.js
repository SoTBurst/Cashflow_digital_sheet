// Simplified cash account logic for freedom mode
(function(){
  let runningBalance = 0;
  let baseMonthlyCashflow = 0;

  function formatSigned(val){ return window.formatNumberWithSign ? window.formatNumberWithSign(val) : (val>=0?'+':'') + val; }
  function formatCurrency(val){ return window.formatCurrency ? window.formatCurrency(val) : (val.toLocaleString('de-DE') + ' €'); }

  function updateDisplay(){
    const balEl = document.getElementById('current-balance');
    if(balEl){ balEl.textContent = formatSigned(runningBalance); balEl.style.color = runningBalance < 0 ? 'var(--danger)' : 'inherit'; }
    const cfEl = document.getElementById('freedom-mode-cashflow');
    if(cfEl){ cfEl.textContent = formatCurrency(baseMonthlyCashflow); }
  }

  function addLog(amount, label){
    runningBalance += amount;
    const ul = document.getElementById('entries');
    if(!ul) return;
    const liEntry = document.createElement('li');
    const inpEntry = document.createElement('input');
    inpEntry.type='text'; inpEntry.readOnly = true; inpEntry.value = formatSigned(amount);
    if(amount < 0) inpEntry.style.color='var(--danger)'; else if(amount>0) inpEntry.style.color='var(--primary)';
    if(label) inpEntry.title = label;
    liEntry.append(inpEntry);

    const liSum = document.createElement('li');
    const inpSum = document.createElement('input');
    inpSum.type='text'; inpSum.readOnly = true; inpSum.classList.add('balance-snapshot');
    inpSum.value = formatSigned(runningBalance);
    if(runningBalance < 0) inpSum.style.color='var(--danger)';
    liSum.append(inpSum);

    // Neueinträge oben: zuerst Entry, dann Summe davor
    ul.prepend(liEntry);
    liEntry.before(liSum);
    updateDisplay();
  }

  function applyMonthlyCashflow(){
    if(baseMonthlyCashflow === 0) return;
    addLog(baseMonthlyCashflow, 'Monatlicher Cashflow verbucht');
  }

  function donate(){
    if(baseMonthlyCashflow === 0) return;
    const donation = Math.round(baseMonthlyCashflow * 0.1);
    if(donation <= 0) return;
    addLog(-donation, 'Spende 10% des Cashflows');
  }

  function resetAll(){
    runningBalance = 0;
    const ul = document.getElementById('entries');
    if(ul) ul.innerHTML='';
    updateDisplay();
  // Manuelles Eingabefeld leeren
  const manual = document.getElementById('manual-entry');
  if(manual){ manual.value=''; }
  }

  function readBaseCashflow(){
    const stored = sessionStorage.getItem('freedomBaseCashflow');
    const val = stored ? parseInt(stored,10) : 0;
    baseMonthlyCashflow = isNaN(val) ? 0 : val;
  }

  function init(){
    readBaseCashflow();
    updateDisplay();
    document.getElementById('btn-add-cashflow')?.addEventListener('click', applyMonthlyCashflow);
    document.getElementById('btn-donate')?.addEventListener('click', donate);
    document.getElementById('btn-reset')?.addEventListener('click', resetAll);
    document.getElementById('btn-return')?.addEventListener('click', () => { window.location.href='index.html'; });
    const manual = document.getElementById('manual-entry');
    if(manual){
      manual.addEventListener('keydown', e => {
        if(e.key === 'Enter') {
          const raw = manual.value.trim();
            if(raw === '') return;
          const val = window.parseFormattedNumber ? (window.parseFormattedNumber(raw) || 0) : (parseFloat(raw)||0);
          if(val === 0) { manual.value=''; return; }
          addLog(val, 'Manueller Eintrag');
          manual.value='';
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
