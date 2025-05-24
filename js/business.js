// Business functionality - buying and selling businesses with monthly cashflow

// Global variables for easy debugging
let businessBuyBtn, businessSellBtn;
// Objekt zum Speichern der Unternehmen und ihrer Daten
let businessAssets = {}; // Mehrere Unternehmen erlaubt

// Funktion zur Aktualisierung der Asset-Liste im Frontend
function updateBusinessAssetsList() {
  const container = document.getElementById('business-assets-list');
  container.innerHTML = '';
  
  const businessEntries = Object.entries(businessAssets);
  
  if (businessEntries.length === 0) {
    // Zeige Dummy-Kästchen wenn keine Unternehmen vorhanden sind
    createDummyBusinessRow(container);
  } else {
    // Zeige echte Unternehmen-Daten
    businessEntries.forEach(([name, asset]) => {
      const row = document.createElement('div');
      row.classList.add('asset-item');
        // Name
      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.readOnly = true;
      nameInput.value = name;
      
      // Monatlicher Cashflow
      const cashflowInput = document.createElement('input');
      cashflowInput.type = 'number';
      cashflowInput.readOnly = true;
      cashflowInput.value = asset.cashflow.toFixed(2);
      
      // Kaufpreis
      const priceInput = document.createElement('input');
      priceInput.type = 'number';
      priceInput.readOnly = true;
      priceInput.value = asset.price.toFixed(2);
      
      // Zeile zusammenbauen
      row.append(nameInput, cashflowInput, priceInput);
      container.appendChild(row);
    });
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
  
  // Dummy Cashflow-Feld
  const cashflowInput = document.createElement('input');
  cashflowInput.type = 'number';
  cashflowInput.readOnly = true;
  cashflowInput.value = '';
  cashflowInput.placeholder = '0.00€';
  cashflowInput.style.opacity = '0.5';
  
  // Dummy Preis-Feld
  const priceInput = document.createElement('input');
  priceInput.type = 'number';
  priceInput.readOnly = true;
  priceInput.value = '';
  priceInput.placeholder = '0.00€';
  priceInput.style.opacity = '0.5';
  
  // Zeile zusammenbauen
  row.append(nameInput, cashflowInput, priceInput);
  container.appendChild(row);
}

// Initialize functionality when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  // Get button references
  businessBuyBtn = document.getElementById('btn-buy-business');
  businessSellBtn = document.getElementById('btn-sell-business');
    if (businessBuyBtn) {
    businessBuyBtn.addEventListener('click', function () {
      showBusinessPopup();
    });
  }
  
  if (businessSellBtn) {
    businessSellBtn.addEventListener('click', function () {
      // Check if we have any businesses
      const hasBusinesses = Object.keys(businessAssets).length > 0;
      if (hasBusinesses) {
        showBusinessSellPopup();
      } else {
        alert('Sie haben keine Unternehmen zum Verkaufen.');
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

    if (businessAssets[businessName]) {
      alert('Ein Unternehmen mit diesem Namen existiert bereits!');
      return;
    }

    if (price <= 0) {
      alert('Bitte geben Sie einen gültigen Kaufpreis ein!');
      return;
    }

    if (window.CashflowCore.runningBalance() >= price) {
      // Kauf durchführen
      window.CashflowCore.setRunningBalance(window.CashflowCore.runningBalance() - price);
      businessAssets[businessName] = {
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
      alert('Nicht genügend Guthaben für diesen Kauf!');
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
    const businessName = nameSelect.value;
    const sellPrice = parseFloat(priceInput.value) || 0;

    if (!businessName) {
      alert('Bitte wählen Sie ein Unternehmen zum Verkaufen aus!');
      return;
    }

    if (sellPrice <= 0) {
      alert('Bitte geben Sie einen gültigen Verkaufspreis ein!');
      return;
    }

    if (businessAssets[businessName]) {
      // Verkauf durchführen
      window.CashflowCore.setRunningBalance(window.CashflowCore.runningBalance() + sellPrice);
      delete businessAssets[businessName];
      
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
  const availableBusinesses = Object.keys(businessAssets);
  
  if (availableBusinesses.length === 0) {
    alert('Sie haben keine Unternehmen zum Verkaufen.');
    return;
  }
  
  // Populate dropdown with current businesses
  const nameSelect = document.getElementById('business-sell-name');
  nameSelect.innerHTML = '';
  
  // Add placeholder option
  const placeholderOption = document.createElement('option');
  placeholderOption.value = '';
  placeholderOption.textContent = 'Bitte wählen...';
  nameSelect.appendChild(placeholderOption);
  
  // Add available businesses to dropdown
  availableBusinesses.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    nameSelect.appendChild(option);
  });
  
  // Add event listener to update current cashflow when business is selected
  nameSelect.addEventListener('change', function() {
    const selectedBusiness = this.value;
    const cashflowSpan = document.getElementById('business-current-cashflow');
    
    if (selectedBusiness && businessAssets[selectedBusiness]) {
      cashflowSpan.textContent = businessAssets[selectedBusiness].cashflow.toFixed(2) + ' €';
    } else {
      cashflowSpan.textContent = '0 €';
    }
  });
  
  // Reset form values
  document.getElementById('business-sell-price').value = '';
  document.getElementById('business-current-cashflow').textContent = '0 €';

  const popup = document.getElementById('business-sell-popup');
  popup.style.display = 'flex';
}

function hideBusinessSellPopup() {
  document.getElementById('business-sell-popup').style.display = 'none';
}

function updateBusinessIncome() {
  const businessIncomeInput = document.getElementById('input-income-business');
  
  // Calculate total cashflow from all businesses
  let totalCashflow = 0;
  Object.values(businessAssets).forEach(business => {
    totalCashflow += business.cashflow;
  });
  
  businessIncomeInput.value = totalCashflow.toFixed(2);
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

// Make businessAssets accessible globally
Object.defineProperty(window, 'businessAssets', {
  get: function() { return businessAssets; },
  set: function(value) { businessAssets = value; }
});

// Keep businessAsset for backward compatibility (returns null or first business)
Object.defineProperty(window, 'businessAsset', {
  get: function() { 
    const businesses = Object.keys(businessAssets);
    return businesses.length > 0 ? { 
      name: businesses[0], 
      ...businessAssets[businesses[0]] 
    } : null; 
  },
  set: function(value) { 
    // For backward compatibility - if someone sets a businessAsset, add it to businessAssets
    if (value && value.name) {
      businessAssets[value.name] = {
        price: value.price,
        cashflow: value.cashflow
      };
    }
  }
});
