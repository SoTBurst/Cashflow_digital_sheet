// Updated stocks functionality - buying and selling

// Global variables for easy debugging
let stocksBuyBtn, stocksSellBtn;
// Array to store stock names
let stockNames = [];
// Objekt zum Speichern der unterschiedlichen Aktien und ihrer Daten
let stocksAssets = {};

// Funktion zur Aktualisierung der Asset-Liste im Frontend
function updateStocksAssetsList() {
  const container = document.getElementById('stocks-assets-list');
  container.innerHTML = '';
  
  const stockEntries = Object.entries(stocksAssets);
  
  if (stockEntries.length === 0) {
    // Zeige Dummy-Kästchen wenn keine Aktien vorhanden sind
    createDummyStockRow(container);
  } else {
    // Zeige echte Aktien-Daten
    stockEntries.forEach(([name, asset]) => {
      const row = document.createElement('div');
      row.classList.add('asset-item');
      // Name
      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.readOnly = true;
      nameInput.value = name;
      // Anzahl
      const qtyInput = document.createElement('input');
      qtyInput.type = 'number';
      qtyInput.readOnly = true;
      qtyInput.value = asset.qty;      // Kosten
      const costInput = document.createElement('input');
      costInput.type = 'text';
      costInput.readOnly = true;
      costInput.value = window.formatCurrency(asset.cost);
      // Zeile zusammenbauen
      row.append(nameInput, qtyInput, costInput);
      container.appendChild(row);
    });
  }
}

// Hilfsfunktion zum Erstellen von Dummy-Kästchen
function createDummyStockRow(container) {
  const row = document.createElement('div');
  row.classList.add('asset-item', 'dummy-stock-row');
  
  // Dummy Name-Feld
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.readOnly = true;
  nameInput.value = '';
  nameInput.placeholder = 'Name';
  nameInput.style.opacity = '0.5';
  
  // Dummy Anzahl-Feld
  const qtyInput = document.createElement('input');
  qtyInput.type = 'number';
  qtyInput.readOnly = true;
  qtyInput.value = '';
  qtyInput.placeholder = '0 Stück';
  qtyInput.style.opacity = '0.5';
    // Dummy Kosten-Feld
  const costInput = document.createElement('input');
  costInput.type = 'text';
  costInput.readOnly = true;
  costInput.value = '';
  costInput.placeholder = '0 €';
  costInput.style.opacity = '0.5';
  
  // Zeile zusammenbauen
  row.append(nameInput, qtyInput, costInput);
  container.appendChild(row);
}

// Initialize functionality when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  // Get button references
  stocksBuyBtn = document.getElementById('btn-buy-stocks');
  stocksSellBtn = document.getElementById('btn-sell-stocks');
  if (stocksSellBtn) {
    stocksSellBtn.addEventListener('click', function () {
      // Check if we have any stocks with quantity > 0
      const hasStocks = Object.values(stocksAssets).some(asset => asset.qty > 0);
      if (hasStocks) {
        showStocksSellPopup();
      } else {
        alert('Sie haben keine Aktien zum Verkaufen.');
      }
    });
  } else {
    console.error('Could not find stocks sell button!');
  }
  // Setup popups
  setupStocksBuyPopup();
  setupStocksSellPopup();
  setupStocksEventPopup();
  
  // Initialize with dummy boxes (will show placeholder when no stocks owned)
  updateStocksAssetsList();
});

function setupStocksBuyPopup() {
  const popup = document.getElementById('stocks-popup');
  if (!popup) return;

  const sharesInput = document.getElementById('stocks-shares');
  const priceInput = document.getElementById('stocks-price');
  const totalContainer = document.getElementById('stocks-total-container');
  const totalPrice = document.getElementById('stocks-total-price');
  const confirmBtn = document.getElementById('stocks-buy-confirm');
  const cancelBtn = document.getElementById('stocks-buy-cancel');

  // Input changes
  sharesInput.addEventListener('input', updateStocksPriceCalculation);
  priceInput.addEventListener('input', updateStocksPriceCalculation);
  // Confirm button
  confirmBtn.addEventListener('click', function () {
    const shares = parseInt(sharesInput.value) || 0;
    const stockName = document.getElementById('stocks-name').value.trim();
    if (!stockName) {
      alert('Bitte geben Sie einen Aktiennamen ein!');    return;
    }
    let price = (window.parseFormattedNumber(priceInput.value) || 0) * shares;

    if (shares > 0 && price > 0 && window.CashflowCore.runningBalance() >= price) {
      window.CashflowCore.setRunningBalance(window.CashflowCore.runningBalance() - price);
      const asset = stocksAssets[stockName] || { qty: 0, cost: 0 };
      asset.qty += shares;
      asset.cost += price;
      stocksAssets[stockName] = asset;
      updateStocksAssetsList();

      addStocksPurchaseToEntries(shares, price, stockName);
      window.CashflowCore.updateDisplayBalance();
      if (typeof window.updateSellButtonStates === 'function'){
        window.updateSellButtonStates();
      }
      // Ensure popup closes after purchase
      hideStocksPopup();
    } else {
      if (window.CashflowCore.runningBalance() < price) alert('Nicht genügend Guthaben für diesen Kauf!');
      else alert('Bitte geben Sie gültige Werte ein!');
    }
  });

  cancelBtn.addEventListener('click', hideStocksPopup);
  // Close on outside click
  popup.addEventListener('click', e => { if (e.target === popup) hideStocksPopup(); });
}

function updateStocksPriceCalculation() {
  const sharesInput = document.getElementById('stocks-shares');
  const priceInput = document.getElementById('stocks-price');
  const totalContainer = document.getElementById('stocks-total-container');
  const totalPrice = document.getElementById('stocks-total-price');

  const shares = parseInt(sharesInput.value) || 0;
  const inputPrice = window.parseFormattedNumber(priceInput.value) || 0;

  priceInput.placeholder = 'Preis pro Aktie';
  totalContainer.style.display = 'contents';
  totalPrice.textContent = window.formatCurrency(inputPrice * shares);
}

function showStocksPopup() {
  // Popup zurücksetzen und anzeigen
  document.getElementById('stocks-name').value = '';
  document.getElementById('stocks-shares').value = '1';
  document.getElementById('stocks-price').value = '';
  document.getElementById('stocks-price').placeholder = 'Preis pro Aktie';
  document.getElementById('stocks-total-price').textContent = window.formatCurrency(0);

  const popup = document.getElementById('stocks-popup');
  popup.style.display = 'flex';
}

function hideStocksPopup() {
  document.getElementById('stocks-popup').style.display = 'none';
}

function addStocksPurchaseToEntries(shares, price, stockName) {
  const ul = document.getElementById('entries');
  const entriesChildren = Array.from(ul.children);

  // Check if the first element is an empty input field
  const isFirstEntryEmpty = entriesChildren.length > 0 &&
    entriesChildren[0].querySelector('input').type === 'number';

  const insertAfterElement = isFirstEntryEmpty ? entriesChildren[0] : null;

  // Create entry for stock purchase
  const li = document.createElement('li');
  const inp = document.createElement('input');
  inp.type = 'text';
  inp.readOnly = true;
  inp.value = window.formatNumberWithSign(-price);
  inp.style.color = 'var(--danger)';
  
  // Include stock name in title if provided
  const nameInfo = stockName ? ` (${stockName})` : '';  inp.title = `${shares} Aktie${shares > 1 ? 'n' : ''}${nameInfo} gekauft`;

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
  sumInp.value = window.formatNumberWithSign(window.CashflowCore.runningBalance());
  sumInp.style.background = '#eee';

  if (window.CashflowCore.runningBalance() < 0) {
    sumInp.style.color = 'var(--danger)';
  }  sumLi.append(sumInp);
  // Insert balance entry before the stock purchase entry
  li.before(sumLi);

  // Set global flag (for bank logic)
  window.lastActionWasManualEntry = true;
}

function setupStocksSellPopup() {
  console.log('Setting up stocks sell popup');
  const popup = document.getElementById('stocks-sell-popup');
  if (!popup) {
    console.error('Could not find stocks sell popup!');
    return;
  }

  const sharesInput = document.getElementById('stocks-sell-shares');
  const priceInput = document.getElementById('stocks-sell-price');
  const totalContainer = document.getElementById('stocks-sell-total-container');
  const totalPrice = document.getElementById('stocks-sell-total-price');
  const confirmBtn = document.getElementById('stocks-sell-confirm');
  const cancelBtn = document.getElementById('stocks-sell-cancel');

  // Input changes
  sharesInput.addEventListener('input', updateStocksSellPriceCalculation);
  priceInput.addEventListener('input', updateStocksSellPriceCalculation);
  
  // Confirm button
  confirmBtn.addEventListener('click', function () {
    console.log('Stock sell confirm clicked');
    const stockNameSelect = document.getElementById('stocks-sell-name');
    const stockName = stockNameSelect.value;
    
    if (!stockName) {
      alert('Bitte wählen Sie eine Aktie zum Verkaufen aus!');
      return;
    }
    
    const asset = stocksAssets[stockName] || { qty: 0, cost: 0 };    const totalShares = asset.qty;
    const sharesToSell = parseInt(sharesInput.value) || 0;
    let price = (window.parseFormattedNumber(priceInput.value) || 0) * sharesToSell;

    if (sharesToSell > 0 && price > 0 && sharesToSell <= totalShares) {
      // Update asset
      const costPerShare = asset.cost / totalShares;
      asset.qty -= sharesToSell;
      asset.cost -= costPerShare * sharesToSell;
      if (asset.qty <= 0) {
        delete stocksAssets[stockName];
      } else {
        stocksAssets[stockName] = asset;
      }
      updateStocksAssetsList();

      // Kontostand updaten
      window.CashflowCore.setRunningBalance(window.CashflowCore.runningBalance() + price);
      addStocksSaleToEntries(sharesToSell, price, stockName);
      window.CashflowCore.updateDisplayBalance();
      if (typeof window.updateSellButtonStates === 'function') window.updateSellButtonStates();
      hideStocksSellPopup();
    } else {
      if (sharesToSell > totalShares) {
        alert(`Sie können maximal ${totalShares} Aktien von ${stockName} verkaufen!`);
      } else {
        alert('Bitte geben Sie gültige Werte ein!');
      }
    }
  });
  
  cancelBtn.addEventListener('click', function () {
    hideStocksSellPopup();
  });
  
  // Click outside popup closes it
  popup.addEventListener('click', function (e) {
    if (e.target === popup) {
      hideStocksSellPopup();
    }
  });
}

function updateStocksSellPriceCalculation() {
  const sharesInput = document.getElementById('stocks-sell-shares');
  const priceInput = document.getElementById('stocks-sell-price');
  const totalContainer = document.getElementById('stocks-sell-total-container');
  const totalPrice = document.getElementById('stocks-sell-total-price');

  const shares = parseInt(sharesInput.value) || 0;
  const inputPrice = window.parseFormattedNumber(priceInput.value) || 0;
  priceInput.placeholder = 'Preis pro Aktie';
  totalContainer.style.display = 'contents';
  totalPrice.textContent = window.formatCurrency(inputPrice * shares);

}

function showStocksSellPopup() {
  console.log('Showing stocks sell popup');
  
  // Get the select element and populate it with available stocks
  const stockNameSelect = document.getElementById('stocks-sell-name');
  stockNameSelect.innerHTML = '';
  
  // Get all stocks with quantity > 0
  const availableStocks = Object.keys(stocksAssets).filter(name => stocksAssets[name].qty > 0);
  
  if (availableStocks.length === 0) {
    // This shouldn't happen since we check before opening the popup
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = 'Keine Aktien verfügbar';
    stockNameSelect.appendChild(emptyOption);
    alert('Sie haben keine Aktien zum Verkaufen.');
    return;
  }
  
  // Add placeholder option
  const placeholderOption = document.createElement('option');
  placeholderOption.value = '';
  placeholderOption.textContent = 'Bitte wählen...';
  stockNameSelect.appendChild(placeholderOption);
  
  // Add available stocks to dropdown
  availableStocks.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = `${name} (${stocksAssets[name].qty} Stück)`;
    stockNameSelect.appendChild(option);
  });
  
  // Add event listener to update available quantity when stock is selected
  stockNameSelect.addEventListener('change', function() {
    const selectedStock = this.value;
    const availableSpan = document.getElementById('stocks-available');
    const sharesInput = document.getElementById('stocks-sell-shares');
    
    if (selectedStock && stocksAssets[selectedStock]) {
      const availableQty = stocksAssets[selectedStock].qty;
      availableSpan.textContent = availableQty;
      sharesInput.max = availableQty;
      sharesInput.value = Math.min(parseInt(sharesInput.value) || 1, availableQty);
    } else {
      availableSpan.textContent = '0';
      sharesInput.max = 0;
      sharesInput.value = '1';
    }
    
    // Update price calculation
    updateStocksSellPriceCalculation();
  });

  // Reset form values
  document.getElementById('stocks-sell-shares').value = '1';
  document.getElementById('stocks-sell-price').value = '';
  document.getElementById('stocks-sell-price').placeholder = 'Preis pro Aktie';
  document.getElementById('stocks-sell-total-price').textContent = '0 €';
  document.getElementById('stocks-available').textContent = '0';

  // Show popup
  const popup = document.getElementById('stocks-sell-popup');
  popup.style.display = 'flex';
}

function hideStocksSellPopup() {
  console.log('Hiding stocks sell popup');
  document.getElementById('stocks-sell-popup').style.display = 'none';
}

function addStocksSaleToEntries(shares, price, stockName) {
  const ul = document.getElementById('entries');
  const entriesChildren = Array.from(ul.children);

  // Check if the first element is an empty input field
  const isFirstEntryEmpty = entriesChildren.length > 0 &&
    entriesChildren[0].querySelector('input').type === 'number';

  const insertAfterElement = isFirstEntryEmpty ? entriesChildren[0] : null;

  // Create entry for stock sale
  const li = document.createElement('li');
  const inp = document.createElement('input');
  inp.type = 'text';
  inp.readOnly = true;
  inp.value = window.formatNumberWithSign(price);
  inp.style.color = ''; // Positive amounts in standard color
  
  // Include stock name in title if provided
  const nameInfo = stockName ? ` (${stockName})` : '';  inp.title = `${shares} Aktie${shares > 1 ? 'n' : ''}${nameInfo} verkauft`;

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
  sumInp.value = window.formatNumberWithSign(window.CashflowCore.runningBalance());
  sumInp.style.background = '#eee';

  if (window.CashflowCore.runningBalance() < 0) {
    sumInp.style.color = 'var(--danger)';
  }  sumLi.append(sumInp);
  // Insert balance entry before the stock sale entry
  li.before(sumLi);

  // Set global flag (for bank logic)
  window.lastActionWasManualEntry = true;
}

// Make functions and data available globally
window.showStocksPopup = showStocksPopup;
window.hideStocksPopup = hideStocksPopup;
window.showStocksSellPopup = showStocksSellPopup;
window.hideStocksSellPopup = hideStocksSellPopup;
window.showStocksEventPopup = showStocksEventPopup;
window.hideStocksEventPopup = hideStocksEventPopup;
window.stocksAssets = stocksAssets;

// Stock Event functionality (Split/Reverse Split)
function setupStocksEventPopup() {
  const popup = document.getElementById('stocks-event-popup');
  const stockNameSelect = document.getElementById('stocks-event-name');
  const eventTypeSelect = document.getElementById('stocks-event-type');
  const currentSpan = document.getElementById('stocks-event-current');
  const newSpan = document.getElementById('stocks-event-new');
  const confirmBtn = document.getElementById('stocks-event-confirm');
  const cancelBtn = document.getElementById('stocks-event-cancel');
  
  // Event type change listener
  eventTypeSelect.addEventListener('change', updateStocksEventCalculation);
  
  // Stock selection change listener
  stockNameSelect.addEventListener('change', updateStocksEventCalculation);
  
  // Confirm button
  confirmBtn.addEventListener('click', function() {
    const stockName = stockNameSelect.value;
    const eventType = eventTypeSelect.value;
    
    if (!stockName) {
      alert('Bitte wählen Sie eine Aktie aus!');
      return;
    }
    
    const asset = stocksAssets[stockName];
    if (!asset || asset.qty <= 0) {
      alert('Ungültige Aktie ausgewählt!');
      return;
    }
    
    let newQty;
    if (eventType === 'split') {
      // Split: Anzahl verdoppeln
      newQty = asset.qty * 2;
    } else {
      // Reverse split: Anzahl halbieren, aufrunden
      newQty = Math.ceil(asset.qty / 2);
    }
    
    // Update the asset
    const oldQty = asset.qty;
    asset.qty = newQty;
    stocksAssets[stockName] = asset;
    
    // Update display
    updateStocksAssetsList();
    
    // Add entry to transaction log
    addStocksEventToEntries(stockName, eventType, oldQty, newQty);
    
    // Update button states
    if (typeof window.updateSellButtonStates === 'function') {
      window.updateSellButtonStates();
    }
    
    hideStocksEventPopup();
  });
  
  cancelBtn.addEventListener('click', hideStocksEventPopup);
  
  // Click outside popup closes it
  popup.addEventListener('click', function(e) {
    if (e.target === popup) {
      hideStocksEventPopup();
    }
  });
}

function updateStocksEventCalculation() {
  const stockNameSelect = document.getElementById('stocks-event-name');
  const eventTypeSelect = document.getElementById('stocks-event-type');
  const currentSpan = document.getElementById('stocks-event-current');
  const newSpan = document.getElementById('stocks-event-new');
  
  const stockName = stockNameSelect.value;
  const eventType = eventTypeSelect.value;
  
  if (stockName && stocksAssets[stockName]) {
    const currentQty = stocksAssets[stockName].qty;
    currentSpan.textContent = currentQty;
    
    let newQty;
    if (eventType === 'split') {
      newQty = currentQty * 2;
    } else {
      newQty = Math.ceil(currentQty / 2);
    }
    newSpan.textContent = newQty;
  } else {
    currentSpan.textContent = '0';
    newSpan.textContent = '0';
  }
}

function showStocksEventPopup() {
  // Get the select element and populate it with available stocks
  const stockNameSelect = document.getElementById('stocks-event-name');
  stockNameSelect.innerHTML = '';
  
  // Get all stocks with quantity > 0
  const availableStocks = Object.keys(stocksAssets).filter(name => stocksAssets[name].qty > 0);
  
  if (availableStocks.length === 0) {
    alert('Sie haben keine Aktien für Events verfügbar.');
    return;
  }
  
  // Add placeholder option
  const placeholderOption = document.createElement('option');
  placeholderOption.value = '';
  placeholderOption.textContent = 'Bitte wählen...';
  stockNameSelect.appendChild(placeholderOption);
  
  // Add available stocks to dropdown
  availableStocks.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = `${name} (${stocksAssets[name].qty} Stück)`;
    stockNameSelect.appendChild(option);
  });
  
  // Reset form values
  document.getElementById('stocks-event-type').value = 'split';
  document.getElementById('stocks-event-current').textContent = '0';
  document.getElementById('stocks-event-new').textContent = '0';
  
  // Show popup
  const popup = document.getElementById('stocks-event-popup');
  popup.style.display = 'flex';
}

function hideStocksEventPopup() {
  document.getElementById('stocks-event-popup').style.display = 'none';
}

function addStocksEventToEntries(stockName, eventType, oldQty, newQty) {
  const ul = document.getElementById('entries');
  const entriesChildren = Array.from(ul.children);
  
  // Check if the first element is an empty input field
  const isFirstEntryEmpty = entriesChildren.length > 0 &&
    entriesChildren[0].querySelector('input').type === 'number';
  
  const insertAfterElement = isFirstEntryEmpty ? entriesChildren[0] : null;
  
  // Create entry for stock event
  const li = document.createElement('li');
  const inp = document.createElement('input');
  inp.type = 'text';
  inp.readOnly = true;
  inp.value = window.formatNumberWithSign(0); // Events don't affect balance
  inp.style.color = 'var(--primary)'; // Blue/teal color for events
  
  const eventText = eventType === 'split' ? 'Split' : 'Rückwärtssplit';
  inp.title = `${stockName}: ${eventText} (${oldQty} → ${newQty} Aktien)`;
  
  li.append(inp);
  
  if (insertAfterElement) {
    insertAfterElement.after(li);
  } else {
    ul.prepend(li);
  }
  
  // Set global flag (for bank logic)
  window.lastActionWasManualEntry = true;
}
