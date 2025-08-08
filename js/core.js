// Core functionality for Cashflow AI
const profilesData = {
  "debug-anwalt": { bal: [50000, 100000], inc: 7500, exp: 5100, ob: [[115000, 1100], [78000, 300], [11000, 200], [7000, 200], [0, 0]], taxes: 3300, childCost:400},
  anwalt: { bal: [2000, 2400], inc: 7500, exp: 5100, ob: [[115000, 1100], [78000, 300], [11000, 200], [7000, 200], [0, 0]], taxes: 3300, childCost:400},
  arzt: { bal: [3500, 4900], inc: 13200, exp: 8300, ob: [[202000, 1900], [150000, 700], [19000, 300], [10000, 200], [0, 0]], taxes: 5700, childCost:700},
  hausmeister: { bal: [600, 600], inc: 1600, exp: 1000, ob: [[20000, 200], [0, 0], [4000, 100], [3000, 100], [0, 0]], taxes: 600, childCost:100},
  ingenieur: { bal: [400, 1700], inc: 4900, exp: 3200, ob: [[75000, 700], [12000, 100], [7000, 200], [5000, 200], [0, 0]], taxes: 2000, childCost:200},
  krankenschwester: { bal: [500, 1100], inc: 3100, exp: 2000, ob: [[47000, 400], [6000, 100], [5000, 100], [4000, 200], [0, 0]], taxes: 1200, childCost:200},
  lehrer: { bal: [400, 1200], inc: 3300, exp: 2100, ob: [[50000, 500], [12000, 100], [5000, 100], [4000, 200], [0, 0]], taxes: 1200, childCost:200},
  "lkw-fahrer": { bal: [800, 800], inc: 2500, exp: 1700, ob: [[38000, 400], [0, 0], [4000, 100], [3000, 100], [0, 0]], taxes: 1100, childCost:200},
  manager: { bal: [400, 1600], inc: 4600, exp: 3000, ob: [[75000, 700], [12000, 100], [6000, 100], [4000, 200], [0, 0]], taxes: 1900, childCost:300},
  mechaniker: { bal: [700, 700], inc: 2000, exp: 1300, ob: [[31000, 300], [0, 0], [3000, 100], [3000, 100], [0, 0]], taxes: 900, childCost:100},
  pilot: { bal: [2500, 3500], inc: 9500, exp: 6000, ob: [[90000, 1000], [0, 0], [15000, 300], [22000, 700], [0, 0]], taxes: 4000, childCost:400},
  polizist: { bal: [500, 1100], inc: 3000, exp: 1900, ob: [[46000, 400], [0, 0], [5000, 100], [3000, 100], [0, 0]], taxes: 300, childCost:200},
  sekretaer: { bal: [700, 800], inc: 2500, exp: 1700, ob: [[38000, 400], [0, 0], [4000, 100], [3000, 100], [0, 0]], taxes: 500, childCost:100 }
};

let balanceArray = [], baseIncome = 0, baseExpenses = 0, obligations = [];
let initialBalance = 0, runningBalance = 0;

// Flag to track manual entries
window.lastActionWasManualEntry = false;

function generateArray() {
  const arr = [];
  let j = 0;
  while (j < balanceArray.length || arr.length % 2 === 0) {
    let i = arr.length;
    if (i < balanceArray.length) {
      arr.push(balanceArray[i]); j++;
    } else if (i % 2 === 0) {
      arr.push(arr[i - 1] + arr[i - 2]);
    } else {
      arr.push(Math.floor(arr[i - 1] * 1.1));
    }
  }
  return arr;
}

function renderBaseEntries() {
  const ul = document.getElementById('entries');
  ul.innerHTML = '';
  const arr = generateArray();
  // Erstes Element (der alte Kontostand) überspringen, und den letzten Wert als initialBalance verwenden
  initialBalance = arr.length > 1 ? arr[arr.length - 1] : 0;
  runningBalance = initialBalance;
  
  // Schleife beginnt bei Index 1, um den ersten Wert zu überspringen
  // Umgekehrte Reihenfolge - neueste Einträge oben
  for (let i = arr.length - 1; i >= 1; i--) {
    const num = arr[i];
    const li = document.createElement('li');
    const inp = document.createElement('input');
    // Input als Text statt als Zahl anzeigen, um das Vorzeichen hinzuzufügen
    inp.type = 'text';
    inp.readOnly = true;    // Vorzeichen für den Wert hinzufügen (+ oder -) mit Tausendertrennzeichen
    inp.value = window.formatNumberWithSign(num);

    // Rote Farbe für negative Werte
    if (num < 0) {
      inp.style.color = 'var(--danger)';
    }

    li.append(inp);
    ul.append(li);
  }

  // Display-Aktualisierung und ein neues leeres Eingabefeld für weitere Einträge
  updateDisplayBalance();
  addEntry();
}

function addEntry() {
  const ul = document.getElementById('entries');
  const li = document.createElement('li');
  const inp = document.createElement('input');
  inp.type = 'number'; 
  inp.placeholder = '€';
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter') { 
      e.preventDefault(); 
      finalizeEntry(inp); 
    }
  });
  li.append(inp);
  // Neues Eingabefeld immer am Anfang der Liste einfügen
  ul.prepend(li);
  inp.focus();
}

function finalizeEntry(inp) {
  const val = window.parseFormattedNumber(inp.value) || 0;
  runningBalance += val;
  inp.readOnly = true;
  inp.type = 'text';
  inp.value = window.formatNumberWithSign(val);

  // Nach manueller Eingabe setzen wir eine globale Flag, damit updateBankEntryInList weiß,
  // dass es einen neuen Eintrag erstellen soll
  window.lastActionWasManualEntry = true;

  const sumLi = document.createElement('li');
  const sumInp = document.createElement('input');
  sumInp.type = 'text';
  sumInp.readOnly = true;  // Vorzeichen für Kontostand hinzufügen mit Tausendertrennzeichen
  sumInp.value = window.formatNumberWithSign(runningBalance);
  sumInp.style.background = '#eee';

  // Rote Farbe für negative Kontostände
  if (runningBalance < 0) {
    sumInp.style.color = 'var(--danger)';
  }  sumLi.append(sumInp);
  
  // Kontostand-Eintrag vor dem aktuellen Eintrag einfügen
  inp.parentNode.before(sumLi);

  updateDisplayBalance();
  addEntry();
}

function updateDisplayBalance() {
  // Vorzeichen für aktuellen Kontostand immer anzeigen
  const currentBalanceEl = document.getElementById('current-balance');
  // Text mit Vorzeichen und Tausendertrennzeichen setzen
  currentBalanceEl.textContent = window.formatNumberWithSign(runningBalance);
  
  // Farbe anpassen - rot bei negativen Werten
  currentBalanceEl.style.color = runningBalance < 0 ? 'var(--danger)' : 'inherit';

  // Update buttons that depend on balance
  if (typeof updatePayButtonStates === 'function') {
    updatePayButtonStates();
  }
  
  if (typeof updateSellButtonStates === 'function') {
    updateSellButtonStates();
  }
}

function updateSummary() {
  const salary = baseIncome;
  const passive = (window.parseFormattedNumber(document.getElementById('input-income-property').value) || 0) + 
                  (window.parseFormattedNumber(document.getElementById('input-income-business').value) || 0);
  const totalInc = salary + passive;
  const totalExp =
    (window.parseFormattedNumber(document.getElementById('input-expenses-taxes').value) || 0) +
    (window.parseFormattedNumber(document.getElementById('input-expenses-mortgage').value) || 0) +
    (window.parseFormattedNumber(document.getElementById('input-expenses-bafog').value) || 0) +
    (window.parseFormattedNumber(document.getElementById('input-expenses-autoloan').value) || 0) +
    (window.parseFormattedNumber(document.getElementById('input-expenses-cc').value) || 0) +
    (window.parseFormattedNumber(document.getElementById('input-expenses-bank').value) || 0) +
    (window.parseFormattedNumber(document.getElementById('input-expenses-children').value) || 0);  
    
  document.getElementById('sum-salary').textContent = window.formatCurrency(salary);
  document.getElementById('sum-passive').textContent = window.formatCurrency(passive);
  document.getElementById('sum-total-income').textContent = window.formatCurrency(totalInc);
  document.getElementById('sum-total-expenses').textContent = window.formatCurrency(totalExp);
  const cashflowVal = totalInc - totalExp;
  const cashflowEl = document.getElementById('sum-cashflow');
  cashflowEl.textContent = window.formatCurrencyWithSign(cashflowVal);
  cashflowEl.style.color = cashflowVal < 0 ? 'var(--danger)' : (cashflowVal > 0 ? 'var(--primary)' : 'inherit');
  
  // Check for financial freedom achievement
  if (typeof window.CongratulationsPopup !== 'undefined') {
    window.CongratulationsPopup.checkFinancialFreedom(passive, totalExp);
  }
}

function setupPayButtons() {
  ['mortgage', 'bafog', 'autoloan', 'cc'].forEach(type => {
    const btn = document.getElementById(`btn-pay-${type}`);
    btn.addEventListener('click', () => {    const liInput = document.getElementById(`input-liability-${type}`);
    const expInput = document.getElementById(`input-expenses-${type}`);
      const amount = window.parseFormattedNumber(liInput.value) || 0;
      if (runningBalance >= amount && amount > 0) {
        // Aktion bei ausreichendem Guthaben ausführen
        runningBalance -= amount;        liInput.value = window.formatCurrency(0);
        expInput.value = window.formatCurrency(0);
        addLiabilityPaymentToEntries(type, amount);
        updateDisplayBalance();
        updateSummary();
      }
    });
  });
}

function setupAddCashflowButton() {
  const btn = document.getElementById('btn-add-cashflow');
  if (btn) {
    btn.addEventListener('click', () => {
      // Calculate current cashflow
      const salary = baseIncome;
      const passive = (window.parseFormattedNumber(document.getElementById('input-income-property').value) || 0) + 
                      (window.parseFormattedNumber(document.getElementById('input-income-business').value) || 0);
      const totalInc = salary + passive;
      const totalExp =
        (window.parseFormattedNumber(document.getElementById('input-expenses-taxes').value) || 0) +
        (window.parseFormattedNumber(document.getElementById('input-expenses-mortgage').value) || 0) +
        (window.parseFormattedNumber(document.getElementById('input-expenses-bafog').value) || 0) +
        (window.parseFormattedNumber(document.getElementById('input-expenses-autoloan').value) || 0) +
        (window.parseFormattedNumber(document.getElementById('input-expenses-cc').value) || 0) +
        (window.parseFormattedNumber(document.getElementById('input-expenses-bank').value) || 0) +
        (window.parseFormattedNumber(document.getElementById('input-expenses-children').value) || 0);
      
      const cashflow = totalInc - totalExp;
      
      if (cashflow > 0) {
        // Add cashflow to running balance
        runningBalance += cashflow;
        
        // Add entry to the list
        addCashflowToEntries(cashflow);
        
        // Update display
        updateDisplayBalance();
        
        // Set flag for bank entry logic
        window.lastActionWasManualEntry = true;
      } else if (cashflow < 0) {
        // Negative cashflow - ask for confirmation
        if (confirm(`Ihr Cashflow ist negativ (${window.formatNumberWithSign(cashflow)} €). Möchten Sie diesen trotzdem hinzufügen?`)) {
          runningBalance += cashflow;
          addCashflowToEntries(cashflow);
          updateDisplayBalance();
          window.lastActionWasManualEntry = true;
        }
      } else {
        alert('Ihr Cashflow ist 0 €. Es gibt nichts hinzuzufügen.');
      }
    });
  }
}

function addLiabilityPaymentToEntries(type, amount) {
  const ul = document.getElementById('entries');
  const entriesChildren = Array.from(ul.children);
  
  // Finde das erste leere Eingabefeld (für neue Einträge) - sollte jetzt oben sein
  const firstEntryIndex = 0;
  const isFirstEntryEmpty = entriesChildren.length > 0 &&
    entriesChildren[firstEntryIndex].querySelector('input').type === 'number';

  const insertAfterElement = isFirstEntryEmpty ? entriesChildren[firstEntryIndex] : null;

  // Erstellen eines Eintrags für die Verbindlichkeitsrückzahlung
  const li = document.createElement('li');
  const inp = document.createElement('input');
  inp.type = 'text';
  inp.readOnly = true;
  // Negativer Betrag (Geld wird ausgegeben) mit Tausendertrennzeichen
  inp.value = '-' + window.formatNumber(Math.abs(amount));
  inp.style.color = 'var(--danger)';

  // Typ der Verbindlichkeit als Beschreibung im Datensatz speichern
  inp.dataset.liabilityType = type;

  // Je nach Verbindlichkeitstyp einen benutzerfreundlichen Text hinzufügen
  const liabilityNames = {
    'mortgage': 'Hypothek',
    'bafog': 'BAföG Darlehen',
    'autoloan': 'Autokredit',
    'cc': 'Kreditkarte'
  };

  inp.title = liabilityNames[type] + ' vollständig abgezahlt';

  li.append(inp);

  if (insertAfterElement) {
    // Einfügen nach dem leeren Eingabefeld
    insertAfterElement.after(li);
  } else {
    // Am Anfang einfügen, wenn kein leeres Eingabefeld vorhanden ist
    ul.prepend(li);
  }

  // Aktualisiere den Kontostand-Eintrag
  const sumLi = document.createElement('li');
  const sumInp = document.createElement('input');
  sumInp.type = 'text';
  sumInp.readOnly = true;
  sumInp.value = window.formatNumberWithSign(runningBalance);
  sumInp.style.background = '#eee';

  if (runningBalance < 0) {
    sumInp.style.color = 'var(--danger)';
  }  sumLi.append(sumInp);
  // Kontostand-Eintrag vor dem Verbindlichkeits-Eintrag einfügen
  li.before(sumLi);

  // Nach Bezahlung einer Verbindlichkeit Flag setzen, damit updateBankEntryInList weiß,
  // dass es einen neuen Eintrag erstellen soll für den nächsten Bankkredit
  window.lastActionWasManualEntry = true;
}

function addCashflowToEntries(cashflow) {
  const ul = document.getElementById('entries');
  const entriesChildren = Array.from(ul.children);
  
  // Finde das erste leere Eingabefeld (für neue Einträge) - sollte jetzt oben sein
  const firstEntryIndex = 0;
  const isFirstEntryEmpty = entriesChildren.length > 0 &&
    entriesChildren[firstEntryIndex].querySelector('input').type === 'number';

  const insertAfterElement = isFirstEntryEmpty ? entriesChildren[firstEntryIndex] : null;

  // Erstellen eines Eintrags für den Cashflow
  const li = document.createElement('li');
  const inp = document.createElement('input');
  inp.type = 'text';
  inp.readOnly = true;
  inp.value = window.formatNumberWithSign(cashflow);

  // Farbe je nach Vorzeichen
  if (cashflow < 0) {
    inp.style.color = 'var(--danger)';
  } else if (cashflow > 0) {
    inp.style.color = 'var(--primary)';
  }

  inp.title = 'Monatlicher Cashflow hinzugefügt';
  inp.dataset.cashflowEntry = 'true';

  li.append(inp);

  if (insertAfterElement) {
    // Einfügen nach dem leeren Eingabefeld
    insertAfterElement.after(li);
  } else {
    // Am Anfang einfügen, wenn kein leeres Eingabefeld vorhanden ist
    ul.prepend(li);
  }

  // Aktualisiere den Kontostand-Eintrag
  const sumLi = document.createElement('li');
  const sumInp = document.createElement('input');
  sumInp.type = 'text';
  sumInp.readOnly = true;
  sumInp.value = window.formatNumberWithSign(runningBalance);
  sumInp.style.background = '#eee';

  if (runningBalance < 0) {
    sumInp.style.color = 'var(--danger)';
  }

  sumLi.append(sumInp);
  // Kontostand-Eintrag vor dem Cashflow-Eintrag einfügen
  li.before(sumLi);
}

function updatePayButtonStates() {
  ['mortgage', 'bafog', 'autoloan', 'cc'].forEach(type => {
    const btn = document.getElementById(`btn-pay-${type}`);
    const liInput = document.getElementById(`input-liability-${type}`);
    const amount = window.parseFormattedNumber(liInput.value) || 0;

    // Deaktiviere Knopf wenn Verbindlichkeit 0 ist oder nicht genug Guthaben vorhanden
    btn.disabled = amount <= 0 || runningBalance < amount;

    // Visuelles Feedback zum Knopfstatus
    if (btn.disabled) {
      btn.classList.add('btn-disabled');
      btn.title = amount <= 0 ? 'Keine Verbindlichkeit' : 'Nicht genügend Guthaben';
    } else {
      btn.classList.remove('btn-disabled');
      btn.title = 'Verbindlichkeit vollständig abzahlen';
    }
  });
  // Bankkredit-Knopf zum Abbezahlen
  const btnPayBank = document.getElementById('btn-pay-bank-1000');
  const bankInput = document.getElementById('input-liability-bank');
  const bankAmount = window.parseFormattedNumber(bankInput.value) || 0;

  btnPayBank.disabled = bankAmount < 1000 || runningBalance < 1000;
  if (btnPayBank.disabled) {
    btnPayBank.classList.add('btn-disabled');
    btnPayBank.title = bankAmount < 1000 ? 'Kredit zu niedrig für Teilzahlung' : 'Nicht genügend Guthaben';
  } else {
    btnPayBank.classList.remove('btn-disabled');
    btnPayBank.title = '1000 € vom Bankkredit abzahlen';
  }
}

function loadData(profile) {
  const data = profilesData[profile] || profilesData['anwalt'];
  balanceArray = data.bal || [];
  baseIncome = data.inc || 0; 
  baseExpenses = data.exp || 0;
  obligations = data.ob || [];
  document.getElementById('input-income-salary').value = window.formatCurrency(baseIncome);
  document.getElementById('input-income-property').value = window.formatCurrency(0);
  document.getElementById('input-income-business').value = window.formatCurrency(0);
  document.getElementById('input-expenses-taxes').value = window.formatCurrency(data.taxes);
  document.getElementById('input-expenses-mortgage').value = window.formatCurrency(obligations[0][1]);
  document.getElementById('input-expenses-bafog').value = window.formatCurrency(obligations[1][1]);
  document.getElementById('input-expenses-autoloan').value = window.formatCurrency(obligations[2][1]);
  document.getElementById('input-expenses-cc').value = window.formatCurrency(obligations[3][1]);

  currentChildCostRate = data.childCost || 0;
  const childCountEl = document.getElementById('input-children-count');
  const childCostEl  = document.getElementById('input-expenses-children');

  if (childCountEl && childCostEl) {
    // zurücksetzen + einmal berechnen
    childCountEl.value = '0';
    updateChildrenCost();

    // Doppel-Listener vermeiden (optional vorher removeEventListener, hier simpel):
    childCountEl.addEventListener('input', updateChildrenCost);
  }

  // Bankkredit-Zinszahlung (10% der Schulden)
  const bankLoanAmount = obligations[4][0];
  const bankLoanPayment = Math.round(bankLoanAmount * 0.1);  document.getElementById('input-expenses-bank').value = window.formatCurrency(bankLoanPayment);

  // Verbindlichkeiten ausfüllen (erster Wert aus jedem ob-Tupel)
  document.getElementById('input-liability-mortgage').value = window.formatCurrency(obligations[0][0]);
  document.getElementById('input-liability-bafog').value = window.formatCurrency(obligations[1][0]);
  document.getElementById('input-liability-autoloan').value = window.formatCurrency(obligations[2][0]);
  document.getElementById('input-liability-cc').value = window.formatCurrency(obligations[3][0]); 
  document.getElementById('input-liability-bank').value = window.formatCurrency(bankLoanAmount);
  const sel = document.getElementById('profile-selector');
  document.getElementById('job-display').textContent = sel.options[sel.selectedIndex].text;
  document.getElementById('input-income-property').addEventListener('input', updateSummary);
  document.getElementById('input-income-business').addEventListener('input', updateSummary);
  updateSummary();
  renderBaseEntries();
  updatePayButtonStates();
  
  if (typeof updateSellButtonStates === 'function') {
    updateSellButtonStates();
  }
}

// Initialize core functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const sel = document.getElementById('profile-selector');
  sel.addEventListener('change', () => loadData(sel.value));
  loadData(sel.value);
  setupPayButtons();
  setupAddCashflowButton();
  
  // Call setup functions from other modules if they exist
  if (typeof setupBankLoanButtons === 'function') {
    setupBankLoanButtons();
  }
  
  if (typeof setupBuyButtons === 'function') {
    setupBuyButtons();
  }
  
  if (typeof setupSellButtons === 'function') {
    setupSellButtons();
  }
  
  if (typeof setupMobileScroll === 'function') {
    setupMobileScroll();
  }
});

// Export functions to make them available to other modules
window.CashflowCore = {
  updateDisplayBalance,
  updateSummary,
  addEntry,
  finalizeEntry,
  loadData,
  runningBalance: () => runningBalance,
  setRunningBalance: (value) => { runningBalance = value; },
  initialBalance: () => initialBalance,
  updatePayButtonStates
};

let currentChildCostRate = 0;

function updateChildrenCost() {
  const countEl = document.getElementById('input-children-count');
  const costEl  = document.getElementById('input-expenses-children');
  if (!countEl || !costEl) return;

  const n = parseInt(countEl.value, 10) || 0;
  const total = n * (currentChildCostRate || 0);

  costEl.value = window.formatCurrency(total);
  // Kleines UX-Extra: Tooltip mit Rate
  costEl.title = `Kosten je Kind: ${window.formatCurrency(currentChildCostRate)} × ${n}`;
  updateSummary();
}
