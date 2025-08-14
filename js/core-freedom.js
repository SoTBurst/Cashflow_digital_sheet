// Simplified cash account logic for freedom mode
(function(){
  let runningBalance = 0;
  let baseMonthlyCashflow = 0;
  let startMonthlyCashflow = 0;
  let goalTarget = 0;
  let goalShown = false;

  function formatSigned(val){ return window.formatNumberWithSign ? window.formatNumberWithSign(val) : (val>=0?'+':'') + val; }
  function formatCurrency(val){ return window.formatCurrency ? window.formatCurrency(val) : (val.toLocaleString('de-DE') + ' €'); }

  function updateDisplay(){
    const balEl = document.getElementById('current-balance');
    if(balEl){ balEl.textContent = formatSigned(runningBalance); balEl.style.color = runningBalance < 0 ? 'var(--danger)' : 'inherit'; }
    const cfEl = document.getElementById('freedom-mode-cashflow');
    if(cfEl){ cfEl.textContent = formatCurrency(baseMonthlyCashflow); }
  const goalEl = document.getElementById('freedom-goal-target');
  if(goalEl){ goalEl.textContent = formatCurrency(goalTarget); }
    updateGoalProgressUI();
  }

  function updateGoalProgressUI(){
    const startEl = document.getElementById('goal-start-label');
    const targetEl = document.getElementById('goal-target-label');
    const pctEl = document.getElementById('goal-progress-percent');
    const fill = document.getElementById('goal-progress-fill');
    if(startEl) startEl.textContent = formatCurrency(startMonthlyCashflow);
    if(targetEl) targetEl.textContent = formatCurrency(goalTarget);
    const span = Math.max(1, goalTarget - startMonthlyCashflow);
    const progress = Math.max(0, Math.min(1, (baseMonthlyCashflow - startMonthlyCashflow) / span));
    const pct = Math.round(progress * 100);
    if(pctEl) pctEl.textContent = pct + '%';
    if(fill){ fill.style.width = pct + '%'; fill.parentElement?.setAttribute('aria-valuenow', String(pct)); }
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
    // Warn if this would make balance negative (threshold crossing)
    const wouldBe = runningBalance - donation;
    if(runningBalance >= 0 && wouldBe < 0){
      const proceed = window.confirm('Die Spende würde deinen Kontostand negativ machen. Trotzdem spenden?');
      if(!proceed) return;
    }
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

  function loseHalf(){
    const current = runningBalance;
    if(current === 0) return;
    const loss = -Math.floor(Math.abs(current) * 0.5) * Math.sign(current);
    // Only meaningful if there is positive cash to lose; for negative balances, treat as no-op
    if(current > 0){
      const lossAbs = Math.abs(loss);
      const proceed = window.confirm(`Du verlierst 50% deines aktuellen Bargelds (${formatCurrency(lossAbs)}). Fortfahren?`);
      if(!proceed) return;
      addLog(-lossAbs, '50% Bargeldverlust');
    }
  }

  function readBaseCashflow(){
    const stored = sessionStorage.getItem('freedomBaseCashflow');
    const val = stored ? parseInt(stored,10) : 0;
    baseMonthlyCashflow = isNaN(val) ? 0 : val;
  startMonthlyCashflow = baseMonthlyCashflow;
  goalTarget = startMonthlyCashflow + 50000;
  }

  function init(){
    readBaseCashflow();
    updateDisplay();
    document.getElementById('btn-add-cashflow')?.addEventListener('click', applyMonthlyCashflow);
    document.getElementById('btn-donate')?.addEventListener('click', donate);
  document.getElementById('btn-lose-half')?.addEventListener('click', loseHalf);
    document.getElementById('btn-return')?.addEventListener('click', () => {
      try { localStorage.removeItem('freedomInvestments'); } catch(e) {}
      window.location.href='index.html';
    });
    const manual = document.getElementById('manual-entry');
    if(manual){
      // Reformat on blur
      manual.addEventListener('blur', () => {
        const raw = manual.value.trim();
        if(raw === '') return;
        const negative = raw.startsWith('-');
        const numeric = window.parseFormattedNumber ? (window.parseFormattedNumber(raw) || 0) : parseInt(raw.replace(/[^0-9]/g,''),10) || 0;
        if(numeric === 0){ manual.value=''; return; }
        const formatted = (negative?'-':'') + (window.formatNumber ? window.formatNumber(numeric) : numeric.toLocaleString('de-DE'));
        manual.value = formatted;
      });
      // Clean characters on input (allow digits, minus)
      manual.addEventListener('input', () => {
  const prevPos = manual.selectionStart;
  let v = manual.value;
  const neg = v.startsWith('-');
  // Strip all non digits
  v = v.replace(/[^0-9]/g, '');
  if(v === '') { manual.value = neg ? '-' : ''; return; }
  // Format with thousand separators (German locale) using available util if present
  const formattedCore = window.formatNumber ? window.formatNumber(parseInt(v,10)) : parseInt(v,10).toLocaleString('de-DE');
  manual.value = (neg?'-':'') + formattedCore;
  // Set caret at end (simple approach). Advanced caret keeping not required per current UX.
  requestAnimationFrame(()=>{ manual.selectionStart = manual.selectionEnd = manual.value.length; });
      });
      manual.addEventListener('keydown', e => {
        if(e.key === 'Enter') {
          const raw = manual.value.trim();
            if(raw === '') return;
          const val = window.parseFormattedNumber ? (window.parseFormattedNumber(raw) || 0) : (parseFloat(raw)||0);
          if(val === 0) { manual.value=''; return; }
          // Warning if amount not ending with 0000 (absolute value)
          const absVal = Math.abs(val);
          if(absVal % 10000 !== 0){
            const proceed = window.confirm('Der Betrag endet nicht mit 0000. Vermutlich Tippfehler. Trotzdem verbuchen?');
            if(!proceed) return; 
          }
          addLog(val, 'Manueller Eintrag');
          manual.value='';
        }
      });
    }

  // Setup goal popup close
  const goalPopup = document.getElementById('goal-congrats-popup');
  const goalClose = document.getElementById('goal-congrats-close');
  goalClose?.addEventListener('click', () => { if(goalPopup) goalPopup.style.display = 'none'; });
  }

  document.addEventListener('DOMContentLoaded', init);

  // Expose minimal API for other modules (e.g., investments on freedom.html)
  window.FreedomAPI = {
    // Deduct or add an amount and log it
    addLog: function(amount, label){
      addLog(amount, label);
    },
  // Read current balance
  getBalance: function(){ return runningBalance; },
    // Adjust the base monthly cashflow and persist; positive increases, negative decreases
    adjustMonthlyCashflow: function(delta){
      if(!Number.isFinite(delta) || delta === 0) return;
      baseMonthlyCashflow += Math.round(delta);
      try { sessionStorage.setItem('freedomBaseCashflow', String(baseMonthlyCashflow)); } catch(e) {}
      updateDisplay();
      // Check goal
      if(!goalShown && baseMonthlyCashflow >= goalTarget){
        try {
          const gp = document.getElementById('goal-congrats-popup');
          const s = document.getElementById('goal-start-cf');
          const t = document.getElementById('goal-target-cf');
          const c = document.getElementById('goal-current-cf');
          if(s) s.textContent = formatCurrency(startMonthlyCashflow);
          if(t) t.textContent = formatCurrency(goalTarget);
          if(c) c.textContent = formatCurrency(baseMonthlyCashflow);
          if(gp){
            gp.style.display = 'flex';
            // Simple fireworks: reuse CSS animations by toggling class if present
            gp.classList.add('show-fireworks');
          }
        } catch(e) {}
        goalShown = true;
      }
    }
  };
})();
