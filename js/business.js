// Business functionality - buying and selling businesses with monthly cashflow

// Global variables for easy debugging
let businessBuyBtn, businessSellBtn;
// Objekt zum Speichern des Unternehmens und seiner Daten
let businessAsset = null; // Nur ein Unternehmen erlaubt

// Funktion zur Aktualisierung der Asset-Liste im Frontend
function updateBusinessAssetsList() {
  const container = document.getElementById('business-assets-list');
  container.innerHTML = '';
  
  if (!businessAsset) {
    // Zeige Dummy-Kästchen wenn kein Unternehmen vorhanden ist
    createDummyBusinessRow(container);
  } else {
    // Zeige echte Unternehmen-Daten
    const row = document.createElement('div');
    row.classList.add('asset-item');
    
    // Name
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.readOnly = true;
    nameInput.value = businessAsset.name;
    
    // Kaufpreis
    const priceInput = document.createElement('input');
    priceInput.type = 'number';
    priceInput.readOnly = true;
    priceInput.value = businessAsset.price.toFixed(2);
    
    // Monatlicher Cashflow
    const cashflowInput = document.createElement('input');
    cashflowInput.type = 'number';
    cashflowInput.readOnly = true;
    cashflowInput.value = businessAsset.cashflow.toFixed(2);
    
    // Zeile zusammenbauen
    row.append(nameInput, priceInput, cashflowInput);
    container.appendChild(row);
  }
}

// Hilfsfunktion zum Erstellen von Dummy-Kästchen
function createDummyBusinessRow(container) {
  const row = document.createElement('div');
  row.classList.add('asset-item', 'dummy-business-row');
  
  // Dummy Name-Feld
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.readOnly = true;
  nameInput.value = '';
  nameInput.placeholder = 'Name';
  nameInput.style.opacity = '0.5';
  
  // Dummy Preis-Feld
  const priceInput = document.createElement('input');
  priceInput.type = 'number';
  priceInput.readOnly = true;
  priceInput.value = '';
  priceInput.placeholder = '0.00';
  priceInput.style.opacity = '0.5';
  
  // Dummy Cashflow-Feld
  const cashflowInput = document.createElement('input');
  cashflowInput.type = 'number';
  cashflowInput.readOnly = true;
  cashflowInput.value = '';
  cashflowInput.placeholder = '0.00';
  cashflowInput.style.opacity = '0.5';
  
  // Zeile zusammenbauen
  row.append(nameInput, priceInput, cashflowInput);
  container.appendChild(row);
}

// Initialize functionality when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  // Get button references
  businessBuyBtn = document.getElementById('btn-buy-business');
  businessSellBtn = document.getElementById('btn-sell-business');
  
  if (businessBuyBtn) {
    businessBuyBtn.addEventListener('click', function () {
      if (!businessAsset) {
        showBusinessPopup();
      } else {
        alert('Sie können nur ein Unternehmen gleichzeitig besitzen.');
      }
    });
  }
  
  if (businessSellBtn) {
    businessSellBtn.addEventListener('click', function () {
      if (businessAsset) {
        showBusinessSellPopup();
      } else {
        alert('Sie haben kein Unternehmen zum Verkaufen.');
      }
    });
  }

  // Setup popups
  setupBusinessBuyPopup();
  setupBusinessSellPopup();
  
  // Initialize with dummy boxes
  updateBusinessAssetsList();
});

function setupBusinessBuyPopup() {
  const popup = document.getElementById('business-popup');
  if (!popup) return;

  const nameInput = document.getElementById('business-name');
  const priceInput = document.getElementById('business-price');
  const cashflowInput = document.getElementById('business-cashflow');
  const confirmBtn = document.getElementById('business-buy-confirm');
  const cancelBtn = document.getElementById('business-buy-cancel');

  // Confirm button
  confirmBtn.addEventListener('click', function () {
    const businessName = nameInput.value.trim();
    const price = parseFloat(priceInput.value) || 0;
    const cashflow = parseFloat(cashflowInput.value) || 0;

    if (!businessName) {
      alert('Bitte geben Sie einen Unternehmensnamen ein!');
      return;
    }

    if (price <= 0) {
      alert('Bitte geben Sie einen gültigen Kaufpreis ein!');
      return;
    }

    if (window.CashflowCore.runningBalance() >= price && !businessAsset) {
      // Kauf durchführen
      window.CashflowCore.setRunningBalance(window.CashflowCore.runningBalance() - price);
      businessAsset = {
        name: businessName,
        price: price,
        cashflow: cashflow
      };
      
      updateBusinessAssetsList();
      updateBusinessIncome();
      addBusinessPurchaseToEntries(businessName, price);
      window.CashflowCore.updateDisplayBalance();
      window.CashflowCore.updateSummary();
      
      if (typeof window.updateSellButtonStates === 'function'){
        window.updateSellButtonStates();
      }
      
      hideBusinessPopup();
    } else {
      if (window.CashflowCore.runningBalance() < price) {
        alert('Nicht genügend Guthaben für diesen Kauf!');
      } else if (businessAsset) {
        alert('Sie besitzen bereits ein Unternehmen!');
      }
    }
  });

  cancelBtn.addEventListener('click', hideBusinessPopup);
  // Close on outside click
  popup.addEventListener('click', e => { if (e.target === popup) hideBusinessPopup(); });
}

function setupBusinessSellPopup() {
  const popup = document.getElementById('business-sell-popup');
  if (!popup) return;

  const nameSelect = document.getElementById('business-sell-name');
  const priceInput = document.getElementById('business-sell-price');
  const confirmBtn = document.getElementById('business-sell-confirm');
  const cancelBtn = document.getElementById('business-sell-cancel');

  // Confirm button
  confirmBtn.addEventListener('click', function () {
    const sellPrice = parseFloat(priceInput.value) || 0;

    if (sellPrice <= 0) {
      alert('Bitte geben Sie einen gültigen Verkaufspreis ein!');
      return;
    }

    if (businessAsset) {
      const businessName = businessAsset.name;
      
      // Verkauf durchführen
      window.CashflowCore.setRunningBalance(window.CashflowCore.runningBalance() + sellPrice);
      businessAsset = null;
      
      updateBusinessAssetsList();
      updateBusinessIncome();
      addBusinessSaleToEntries(businessName, sellPrice);
      window.CashflowCore.updateDisplayBalance();
      window.CashflowCore.updateSummary();
      
      if (typeof window.updateSellButtonStates === 'function') {
        window.updateSellButtonStates();
      }
      
      hideBusinessSellPopup();
    }
  });

  cancelBtn.addEventListener('click', hideBusinessSellPopup);
  // Close on outside click
  popup.addEventListener('click', e => { if (e.target === popup) hideBusinessSellPopup(); });
}

function showBusinessPopup() {
  // Popup zurücksetzen und anzeigen
  document.getElementById('business-name').value = '';
  document.getElementById('business-price').value = '';
  document.getElementById('business-cashflow').value = '';

  const popup = document.getElementById('business-popup');
  popup.style.display = 'flex';
}

function hideBusinessPopup() {
  document.getElementById('business-popup').style.display = 'none';
}

function showBusinessSellPopup() {
  if (!businessAsset) {
    alert('Sie haben kein Unternehmen zum Verkaufen.');
    return;
  }
  
  // Populate dropdown with current business
  const nameSelect = document.getElementById('business-sell-name');
  nameSelect.innerHTML = '';
  
  const option = document.createElement('option');
  option.value = businessAsset.name;
  option.textContent = businessAsset.name;
  nameSelect.appendChild(option);
  
  // Show current cashflow
  document.getElementById('business-current-cashflow').textContent = businessAsset.cashflow.toFixed(2) + ' €';
  
  // Reset sell price
  document.getElementById('business-sell-price').value = '';

  const popup = document.getElementById('business-sell-popup');
  popup.style.display = 'flex';
}

function hideBusinessSellPopup() {
  document.getElementById('business-sell-popup').style.display = 'none';
}

function updateBusinessIncome() {
  const businessIncomeInput = document.getElementById('input-income-business');
  if (businessAsset) {
    businessIncomeInput.value = businessAsset.cashflow.toFixed(2);
  } else {
    businessIncomeInput.value = '0';
  }
}

function addBusinessPurchaseToEntries(businessName, price) {
  const ul = document.getElementById('entries');
  const entriesChildren = Array.from(ul.children);

  // Check if the first element is an empty input field
  const isFirstEntryEmpty = entriesChildren.length > 0 &&
    entriesChildren[0].querySelector('input').type === 'number';

  const insertAfterElement = isFirstEntryEmpty ? entriesChildren[0] : null;

  // Create entry for business purchase
  const li = document.createElement('li');
  const inp = document.createElement('input');
  inp.type = 'text';
  inp.readOnly = true;
  inp.value = '-' + price.toFixed(2);
  inp.style.color = 'var(--danger)';
  inp.title = `Unternehmen "${businessName}" gekauft`;

  li.append(inp);

  if (insertAfterElement) {
    insertAfterElement.after(li);
  } else {
    ul.prepend(li);
  }

  // Updated account balance display
  const sumLi = document.createElement('li');
  const sumInp = document.createElement('input');
  sumInp.type = 'text';
  sumInp.readOnly = true;
  sumInp.value = (window.CashflowCore.runningBalance() >= 0 ? '+' : '-') + Math.abs(window.CashflowCore.runningBalance()).toFixed(2);
  sumInp.style.background = '#eee';

  if (window.CashflowCore.runningBalance() < 0) {
    sumInp.style.color = 'var(--danger)';
  }

  sumLi.append(sumInp);

  // Insert balance entry after the business purchase entry
  li.after(sumLi);

  // Set global flag (for bank logic)
  window.lastActionWasManualEntry = true;
}

function addBusinessSaleToEntries(businessName, price) {
  const ul = document.getElementById('entries');
  const entriesChildren = Array.from(ul.children);

  // Check if the first element is an empty input field
  const isFirstEntryEmpty = entriesChildren.length > 0 &&
    entriesChildren[0].querySelector('input').type === 'number';

  const insertAfterElement = isFirstEntryEmpty ? entriesChildren[0] : null;

  // Create entry for business sale
  const li = document.createElement('li');
  const inp = document.createElement('input');
  inp.type = 'text';
  inp.readOnly = true;
  inp.value = '+' + price.toFixed(2);
  inp.style.color = ''; // Positive amounts in standard color
  inp.title = `Unternehmen "${businessName}" verkauft`;

  li.append(inp);

  if (insertAfterElement) {
    insertAfterElement.after(li);
  } else {
    ul.prepend(li);
  }

  // Updated account balance display
  const sumLi = document.createElement('li');
  const sumInp = document.createElement('input');
  sumInp.type = 'text';
  sumInp.readOnly = true;
  sumInp.value = (window.CashflowCore.runningBalance() >= 0 ? '+' : '-') + Math.abs(window.CashflowCore.runningBalance()).toFixed(2);
  sumInp.style.background = '#eee';

  if (window.CashflowCore.runningBalance() < 0) {
    sumInp.style.color = 'var(--danger)';
  }

  sumLi.append(sumInp);

  // Insert balance entry after the business sale entry
  li.after(sumLi);

  // Set global flag (for bank logic)
  window.lastActionWasManualEntry = true;
}

// Make functions and data available globally
window.showBusinessPopup = showBusinessPopup;
window.hideBusinessPopup = hideBusinessPopup;
window.showBusinessSellPopup = showBusinessSellPopup;
window.hideBusinessSellPopup = hideBusinessSellPopup;
window.updateBusinessIncome = updateBusinessIncome;

// Make businessAsset accessible globally
Object.defineProperty(window, 'businessAsset', {
  get: function() { return businessAsset; },
  set: function(value) { businessAsset = value; }
});
