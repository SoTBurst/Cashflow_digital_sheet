// Export updateSellButtonStates to make it available globally
window.updateSellButtonStates = updateSellButtonStates;
window.setupBuyButtons = setupBuyButtons;
window.setupSellButtons = setupSellButtons;
window.updateMetalsFieldStyling = updateMetalsFieldStyling;

// Metals functionality - buying and selling

function setupBuyButtons() {
  console.log('Setting up buy buttons');
  // Edelmetalle Kauf-Button
  document.getElementById('btn-buy-metals').addEventListener('click', () => {
    showMetalsPopup();
  });
  // Aktien Kauf-Button
  document.getElementById('btn-buy-stocks').addEventListener('click', () => {
    console.log('Stock buy button clicked');
    if (typeof window.showStocksPopup === 'function') {
      window.showStocksPopup();
    } else {
      console.error('showStocksPopup function not found');
    }
  });
  
  // Aktien Event-Button
  document.getElementById('btn-stocks-event').addEventListener('click', () => {
    const hasStocks = window.stocksAssets ? Object.values(window.stocksAssets).some(asset => asset.qty > 0) : false;
    if (hasStocks) {
      if (typeof window.showStocksEventPopup === 'function') {
        window.showStocksEventPopup();
      } else {
        console.error('showStocksEventPopup function not found');
      }
    } else {
      alert('Sie haben keine Aktien für Events verfügbar.');
    }
  });
  
  // Immobilien Kauf-Button (noch ohne Funktion)
  document.getElementById('btn-buy-property').addEventListener('click', () => {
    // Functionality to be implemented
  });
  
  // Unternehmen Kauf-Button
  document.getElementById('btn-buy-business').addEventListener('click', () => {
    if (typeof window.showBusinessPopup === 'function') {
      window.showBusinessPopup();
    } else {
      console.error('showBusinessPopup function not found');
    }
  });
}

function setupMetalsPopup() {
  const popup = document.getElementById('metals-popup');
  const buyTypeSelect = document.getElementById('metals-buy-type');
  const coinsInput = document.getElementById('metals-coins');
  const priceInput = document.getElementById('metals-price');
  const totalContainer = document.getElementById('metals-total-container');
  const totalPrice = document.getElementById('metals-total-price');
  const confirmBtn = document.getElementById('metals-buy-confirm');
  const cancelBtn = document.getElementById('metals-buy-cancel');
  
  // Entferne bestehende Event-Listener um Duplikate zu vermeiden
  const newConfirmBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
  const newCancelBtn = cancelBtn.cloneNode(true);
  cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
  
  // Kaufart-Wechsel
  buyTypeSelect.removeEventListener('change', updateMetalsPriceCalculation);
  buyTypeSelect.addEventListener('change', updateMetalsPriceCalculation);
  
  // Input-Änderungen
  coinsInput.removeEventListener('input', updateMetalsPriceCalculation);
  coinsInput.addEventListener('input', updateMetalsPriceCalculation);
  priceInput.removeEventListener('input', updateMetalsPriceCalculation);
  priceInput.addEventListener('input', updateMetalsPriceCalculation);
  
  // Buttons
  newConfirmBtn.addEventListener('click', () => {
    const coins = parseInt(coinsInput.value) || 0;
    let price;
      if (buyTypeSelect.value === 'total') {
      price = window.parseFormattedNumber(priceInput.value) || 0;
    } else {
      price = (window.parseFormattedNumber(priceInput.value) || 0) * coins;
    }
    
    if (coins > 0 && price > 0 && window.CashflowCore.runningBalance() >= price) {
      // Betrag vom Kontostand abziehen
      window.CashflowCore.setRunningBalance(window.CashflowCore.runningBalance() - price);
      
      // Anzahl der Münzen zu den Edelmetallen hinzufügen
      const currentMetals = parseInt(document.getElementById('input-asset-metals').value) || 0;
      document.getElementById('input-asset-metals').value = currentMetals + coins;      // Kontostandanzeige aktualisieren
      addMetalsPurchaseToEntries(coins, price);
      window.CashflowCore.updateDisplayBalance();
      window.updateSellButtonStates();
      updateMetalsFieldStyling();
      
      // Popup schließen
      hideMetalsPopup();
    } else {
      // Fehlermeldung bei unzureichendem Guthaben oder ungültigen Werten
      if (window.CashflowCore.runningBalance() < price) {
        alert('Nicht genügend Guthaben für diesen Kauf!');
      } else {
        alert('Bitte geben Sie gültige Werte ein!');
      }
    }
  });
  
  newCancelBtn.addEventListener('click', hideMetalsPopup);
  
  // Klick außerhalb des Popups schließt es
  popup.addEventListener('click', (e) => {
    if (e.target === popup) {
      hideMetalsPopup();
    }
  });
}

function updateMetalsPriceCalculation() {
  const buyTypeSelect = document.getElementById('metals-buy-type');
  const coinsInput = document.getElementById('metals-coins');
  const priceInput = document.getElementById('metals-price');
  const totalContainer = document.getElementById('metals-total-container');
  const totalPrice = document.getElementById('metals-total-price');
  
  const coins = parseInt(coinsInput.value) || 0;
  const inputPrice = window.parseFormattedNumber(priceInput.value) || 0;
    if (buyTypeSelect.value === 'total') {
    // Gesamtpreis ausgewählt
    priceInput.placeholder = 'Gesamtpreis';
    totalContainer.style.display = 'none';
  } else {
    // Preis pro Münze ausgewählt
    priceInput.placeholder = 'Preis pro Münze';
    totalContainer.style.display = 'contents';
    totalPrice.textContent = window.formatCurrency(inputPrice * coins);
  }
}

function showMetalsPopup() {
  // Popup zurücksetzen und anzeigen
  document.getElementById('metals-buy-type').value = 'total';
  document.getElementById('metals-coins').value = '1';
  document.getElementById('metals-price').value = '';
  document.getElementById('metals-price').placeholder = 'Gesamtpreis';
  document.getElementById('metals-total-container').style.display = 'none';
  
  const popup = document.getElementById('metals-popup');
  popup.style.display = 'flex';
}

function hideMetalsPopup() {
  document.getElementById('metals-popup').style.display = 'none';
}

function addMetalsPurchaseToEntries(coins, price) {
  const ul = document.getElementById('entries');
  const entriesChildren = Array.from(ul.children);
  
  // Prüfen, ob das erste Element ein leeres Eingabefeld ist
  const isFirstEntryEmpty = entriesChildren.length > 0 && 
                         entriesChildren[0].querySelector('input').type === 'number';
  
  const insertAfterElement = isFirstEntryEmpty ? entriesChildren[0] : null;
  
  // Eintrag für den Edelmetallkauf erstellen
  const li = document.createElement('li');
  const inp = document.createElement('input');
  inp.type = 'text';
  inp.readOnly = true;
  inp.value = window.formatNumberWithSign(-price);
  inp.style.color = 'var(--danger)';
  inp.title = `${coins} Edelmetall-Münze${coins > 1 ? 'n' : ''} gekauft`;
  
  li.append(inp);
  
  if (insertAfterElement) {
    insertAfterElement.after(li);
  } else {
    ul.prepend(li);
  }    // Aktualisierte Kontostandsanzeige
  const sumLi = document.createElement('li');
  const sumInp = document.createElement('input');
  sumInp.type = 'text';
  sumInp.readOnly = true;
  sumInp.value = window.formatNumberWithSign(window.CashflowCore.runningBalance());
  sumInp.style.background = '#eee';
  
  if (window.CashflowCore.runningBalance() < 0) {
    sumInp.style.color = 'var(--danger)';
  }    sumLi.append(sumInp);
    // Kontostand-Eintrag vor dem Kauf-Eintrag einfügen
  li.before(sumLi);
  
  // Globale Flag setzen (für die Bank-Logik)
  window.lastActionWasManualEntry = true;
}

// Funktion zum Aktualisieren der "Verkaufen"-Buttons
function updateSellButtonStates() {
  // Edelmetalle
  const metalsAmount = parseInt(document.getElementById('input-asset-metals').value) || 0;
  const btnSellMetals = document.getElementById('btn-sell-metals');
  btnSellMetals.disabled = metalsAmount <= 0;
  if (btnSellMetals.disabled) {
    btnSellMetals.classList.add('btn-disabled');
    btnSellMetals.title = 'Keine Edelmetalle zum Verkaufen vorhanden';
  } else {
    btnSellMetals.classList.remove('btn-disabled');
    btnSellMetals.title = 'Edelmetalle verkaufen';
  }
    // Aktien - use the actual stocksAssets object instead of non-existent input field
  const stocksQty = window.stocksAssets ? Object.values(window.stocksAssets).reduce((sum, asset) => sum + asset.qty, 0) : 0;
  const btnSellStocks = document.getElementById('btn-sell-stocks');
  btnSellStocks.disabled = stocksQty <= 0;
  if (btnSellStocks.disabled) {
    btnSellStocks.classList.add('btn-disabled');
    btnSellStocks.title = 'Keine Aktien zum Verkaufen vorhanden';
  } else {
    btnSellStocks.classList.remove('btn-disabled');
    btnSellStocks.title = 'Aktien verkaufen';
  }
  
  // Aktien Event-Button
  const btnStocksEvent = document.getElementById('btn-stocks-event');
  btnStocksEvent.disabled = stocksQty <= 0;
  if (btnStocksEvent.disabled) {
    btnStocksEvent.classList.add('btn-disabled');
    btnStocksEvent.title = 'Keine Aktien für Events vorhanden';
  } else {
    btnStocksEvent.classList.remove('btn-disabled');
    btnStocksEvent.title = 'Aktien Event (Split/Rückwärtssplit)';
  }// Immobilien - use the actual propertyAssets object
  const hasProperties = window.propertyAssets ? Object.keys(window.propertyAssets).length > 0 : false;
  const btnSellProperty = document.getElementById('btn-sell-property');
  btnSellProperty.disabled = !hasProperties;
  if (btnSellProperty.disabled) {
    btnSellProperty.classList.add('btn-disabled');
    btnSellProperty.title = 'Keine Immobilien zum Verkaufen vorhanden';
  } else {
    btnSellProperty.classList.remove('btn-disabled');
    btnSellProperty.title = 'Immobilien verkaufen';
  }
    // Unternehmen
  const hasBusinesses = window.businessAssets ? Object.keys(window.businessAssets).length > 0 : false;
  const btnSellBusiness = document.getElementById('btn-sell-business');
  btnSellBusiness.disabled = !hasBusinesses;
  if (btnSellBusiness.disabled) {
    btnSellBusiness.classList.add('btn-disabled');
    btnSellBusiness.title = 'Keine Unternehmen zum Verkaufen vorhanden';
  } else {
    btnSellBusiness.classList.remove('btn-disabled');
    btnSellBusiness.title = 'Unternehmen verkaufen';
  }
}

function setupSellButtons() {
  // Verkauf-Buttons mit den Popup-Funktionen
  document.getElementById('btn-sell-metals').addEventListener('click', () => {
    const metalsAmount = parseInt(document.getElementById('input-asset-metals').value) || 0;
    if (metalsAmount > 0) {
      showMetalsSellPopup();
    }
  });  document.getElementById('btn-sell-stocks').addEventListener('click', () => {
    // Check if we have any stocks with quantity > 0
    const hasStocks = window.stocksAssets ? Object.values(window.stocksAssets).some(asset => asset.qty > 0) : false;
    if (hasStocks) {
      if (typeof window.showStocksSellPopup === 'function') {
        window.showStocksSellPopup();
      } else {
        console.error('showStocksSellPopup function not found');
      }
    } else {
      alert('Sie haben keine Aktien zum Verkaufen.');
    }
  });    document.getElementById('btn-sell-property').addEventListener('click', () => {
    const hasProperties = window.propertyAssets ? Object.keys(window.propertyAssets).length > 0 : false;
    if (hasProperties) {
      if (typeof window.showPropertySellPopup === 'function') {
        window.showPropertySellPopup();
      } else {
        console.error('showPropertySellPopup function not found');
      }
    } else {
      alert('Sie haben keine Immobilien zum Verkaufen.');
    }
  });
    document.getElementById('btn-sell-business').addEventListener('click', () => {
    const hasBusinesses = window.businessAssets ? Object.keys(window.businessAssets).length > 0 : false;
    if (hasBusinesses) {
      if (typeof window.showBusinessSellPopup === 'function') {
        window.showBusinessSellPopup();
      } else {
        console.error('showBusinessSellPopup function not found');
      }
    } else {
      alert('Sie haben keine Unternehmen zum Verkaufen.');
    }
  });
}

function setupMetalsSellPopup() {
  const popup = document.getElementById('metals-sell-popup');
  const sellTypeSelect = document.getElementById('metals-sell-type');
  const coinsInput = document.getElementById('metals-sell-coins');
  const priceInput = document.getElementById('metals-sell-price');
  const totalContainer = document.getElementById('metals-sell-total-container');
  const totalPrice = document.getElementById('metals-sell-total-price');
  const confirmBtn = document.getElementById('metals-sell-confirm');
  const cancelBtn = document.getElementById('metals-sell-cancel');
  
  // Entferne bestehende Event-Listener um Duplikate zu vermeiden
  const newConfirmBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
  const newCancelBtn = cancelBtn.cloneNode(true);
  cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
  
  // Verkaufsart-Wechsel
  sellTypeSelect.removeEventListener('change', updateMetalsSellPriceCalculation);
  sellTypeSelect.addEventListener('change', updateMetalsSellPriceCalculation);
  
  // Input-Änderungen
  coinsInput.removeEventListener('input', updateMetalsSellPriceCalculation);
  coinsInput.addEventListener('input', updateMetalsSellPriceCalculation);
  priceInput.removeEventListener('input', updateMetalsSellPriceCalculation);
  priceInput.addEventListener('input', updateMetalsSellPriceCalculation);
  
  // Buttons
  newConfirmBtn.addEventListener('click', () => {
    const totalMetals = parseInt(document.getElementById('input-asset-metals').value) || 0;
    const coinsToSell = parseInt(coinsInput.value) || 0;
    let price;
      if (sellTypeSelect.value === 'total') {
      price = window.parseFormattedNumber(priceInput.value) || 0;
    } else {
      price = (window.parseFormattedNumber(priceInput.value) || 0) * coinsToSell;
    }
    
    // Prüfen, ob genügend Münzen vorhanden sind und der Preis gültig ist
    if (coinsToSell > 0 && price > 0 && coinsToSell <= totalMetals) {
      // Erlös zum Kontostand hinzufügen
      window.CashflowCore.setRunningBalance(window.CashflowCore.runningBalance() + price);
      
      // Anzahl der Münzen von den Edelmetallen abziehen
      document.getElementById('input-asset-metals').value = totalMetals - coinsToSell;
        // Kontostandanzeige aktualisieren
      addMetalsSaleToEntries(coinsToSell, price);
      window.CashflowCore.updateDisplayBalance();
      window.updateSellButtonStates();
      updateMetalsFieldStyling();
      
      // Popup schließen
      hideMetalsSellPopup();
    } else {
      // Fehlermeldung bei unzureichenden Münzen oder ungültigen Werten
      if (coinsToSell > totalMetals) {
        alert('Sie besitzen nicht genügend Münzen für diesen Verkauf!');
      } else {
        alert('Bitte geben Sie gültige Werte ein!');
      }
    }
  });
  
  newCancelBtn.addEventListener('click', hideMetalsSellPopup);
  
  // Klick außerhalb des Popups schließt es
  popup.addEventListener('click', (e) => {
    if (e.target === popup) {
      hideMetalsSellPopup();
    }
  });
}

function updateMetalsSellPriceCalculation() {
  const sellTypeSelect = document.getElementById('metals-sell-type');
  const coinsInput = document.getElementById('metals-sell-coins');
  const priceInput = document.getElementById('metals-sell-price');
  const totalContainer = document.getElementById('metals-sell-total-container');
  const totalPrice = document.getElementById('metals-sell-total-price');
  
  const coins = parseInt(coinsInput.value) || 0;
  const inputPrice = window.parseFormattedNumber(priceInput.value) || 0;
  
  if (sellTypeSelect.value === 'total') {
    // Gesamtpreis ausgewählt
    priceInput.placeholder = 'Gesamterlös';
    totalContainer.style.display = 'none';  } else {
    // Preis pro Münze ausgewählt
    priceInput.placeholder = 'Preis pro Münze';
    totalContainer.style.display = 'contents';
    totalPrice.textContent = window.formatCurrency(inputPrice * coins);
  }
}

function showMetalsSellPopup() {
  const totalMetals = parseInt(document.getElementById('input-asset-metals').value) || 0;
  
  // Popup zurücksetzen und anzeigen
  document.getElementById('metals-sell-type').value = 'total';
  document.getElementById('metals-sell-coins').value = '1';
  document.getElementById('metals-sell-price').value = '';
  document.getElementById('metals-sell-price').placeholder = 'Gesamterlös';
  document.getElementById('metals-sell-total-container').style.display = 'none';
  document.getElementById('metals-available').textContent = totalMetals;
  
  // Max-Wert für die Coin-Anzahl setzen
  document.getElementById('metals-sell-coins').max = totalMetals;
  
  const popup = document.getElementById('metals-sell-popup');
  popup.style.display = 'flex';
}

function hideMetalsSellPopup() {
  document.getElementById('metals-sell-popup').style.display = 'none';
}

function addMetalsSaleToEntries(coins, price) {
  const ul = document.getElementById('entries');
  const entriesChildren = Array.from(ul.children);
  
  // Prüfen, ob das erste Element ein leeres Eingabefeld ist
  const isFirstEntryEmpty = entriesChildren.length > 0 && 
                         entriesChildren[0].querySelector('input').type === 'number';
  
  const insertAfterElement = isFirstEntryEmpty ? entriesChildren[0] : null;
  
  // Eintrag für den Edelmetallverkauf erstellen
  const li = document.createElement('li');
  const inp = document.createElement('input');
  inp.type = 'text';
  inp.readOnly = true;
  inp.value = window.formatNumberWithSign(price);
  inp.style.color = ''; // Positive Beträge in Standardfarbe
  inp.title = `${coins} Edelmetall-Münze${coins > 1 ? 'n' : ''} verkauft`;
  
  li.append(inp);
  
  if (insertAfterElement) {
    insertAfterElement.after(li);
  } else {
    ul.prepend(li);
  }
    // Aktualisierte Kontostandsanzeige
  const sumLi = document.createElement('li');
  const sumInp = document.createElement('input');
  sumInp.type = 'text';
  sumInp.readOnly = true;  sumInp.value = window.formatNumberWithSign(window.CashflowCore.runningBalance());
  sumInp.style.background = '#eee';
  
  if (window.CashflowCore.runningBalance() < 0) {
    sumInp.style.color = 'var(--danger)';
  }    sumLi.append(sumInp);    // Kontostand-Eintrag vor dem Verkauf-Eintrag einfügen
  li.before(sumLi);
  
  // Globale Flag setzen (für die Bank-Logik)
  window.lastActionWasManualEntry = true;
}

// Funktion zur Aktualisierung des Edelmetalle-Feld-Stylings
function updateMetalsFieldStyling() {
  const metalsInput = document.getElementById('input-asset-metals');
  const metalsAmount = parseInt(metalsInput.value) || 0;
  
  if (metalsAmount <= 0) {
    // Leeres Feld - Dummy-Styling anwenden
    metalsInput.classList.add('empty-metals');
    metalsInput.value = '';
  } else {
    // Feld hat Wert - normales Styling
    metalsInput.classList.remove('empty-metals');
  }
}
