// property.js - Real estate functionality for buying and selling properties

// Global variables for easy debugging
let propertyBuyBtn, propertySellBtn;
// Objekt zum Speichern der Immobilien und ihrer Daten
let propertyAssets = {}; // Mehrere Immobilien erlaubt

// Immobilientypen mit deutschen Namen
const propertyTypes = {
  'efh': { name: 'Einfamilienhaus (EFH)', units: 1 },
  'dp': { name: 'Doppelhaus (DP)', units: 2 },
  'mfh': { name: 'Mehrfamilienhaus (MFH)', units: 0 }, // wird dynamisch gesetzt
  'etw': { name: 'Eigentumswohnung (ETW)', units: 1 },
  'ah': { name: 'Appartmenthaus (AH)', units: 0 } // wird dynamisch gesetzt
};

// Funktion zur Aktualisierung der Asset-Liste im Frontend
function updatePropertyAssetsList() {
  const container = document.getElementById('property-assets-list');
  container.innerHTML = '';
  
  const propertyEntries = Object.entries(propertyAssets);
  
  if (propertyEntries.length === 0) {
    // Zeige Dummy-Kästchen wenn keine Immobilien vorhanden sind
    createDummyPropertyRow(container);
  } else {
    // Zeige echte Immobilien-Daten
    propertyEntries.forEach(([id, asset]) => {
      const row = document.createElement('div');
      row.classList.add('asset-item');
        // Typ
      const typeInput = document.createElement('input');
      typeInput.type = 'text';
      typeInput.readOnly = true;
      typeInput.value = propertyTypes[asset.type]?.name || asset.type;
      
      // Monatlicher Cashflow
      const cashflowInput = document.createElement('input');
      cashflowInput.type = 'number';
      cashflowInput.readOnly = true;
      cashflowInput.value = (asset.cashflow || 0).toFixed(2);
      
      // Eigenanteil
      const downInput = document.createElement('input');
      downInput.type = 'number';
      downInput.readOnly = true;
      downInput.value = asset.down.toFixed(2);
      
      // Kaufpreis
      const priceInput = document.createElement('input');
      priceInput.type = 'number';
      priceInput.readOnly = true;
      priceInput.value = asset.price.toFixed(2);
      
      // Zeile zusammenbauen
      row.append(typeInput, cashflowInput, downInput, priceInput);
      container.appendChild(row);
    });
    
    // Aktualisiere die Summen in den Input-Feldern
    updatePropertyTotals();
  }
}

// Hilfsfunktion zum Erstellen von Dummy-Kästchen
function createDummyPropertyRow(container) {
  const row = document.createElement('div');
  row.classList.add('asset-item', 'dummy-property-row');
  
  // Dummy Typ-Feld
  const typeInput = document.createElement('input');
  typeInput.type = 'text';
  typeInput.readOnly = true;
  typeInput.value = '';
  typeInput.placeholder = 'Typ';
  typeInput.style.opacity = '0.5';
  
  // Dummy Eigenanteil-Feld
  const downInput = document.createElement('input');
  downInput.type = 'number';
  downInput.readOnly = true;
  downInput.value = '';
  downInput.placeholder = '0.00€';
  downInput.style.opacity = '0.5';
    // Dummy Kaufpreis-Feld
  const priceInput = document.createElement('input');
  priceInput.type = 'number';
  priceInput.readOnly = true;
  priceInput.value = '';
  priceInput.placeholder = '0.00€';
  priceInput.style.opacity = '0.5';
  
  // Dummy Cashflow-Feld
  const cashflowInput = document.createElement('input');
  cashflowInput.type = 'number';
  cashflowInput.readOnly = true;
  cashflowInput.value = '';
  cashflowInput.placeholder = '0.00€';
  cashflowInput.style.opacity = '0.5';
    // Zeile zusammenbauen
  row.append(typeInput, cashflowInput, downInput, priceInput);
  container.appendChild(row);
}

// Funktion zur Aktualisierung der Gesamtsummen
function updatePropertyTotals() {
  let totalDown = 0;
  let totalPrice = 0;
  let totalCashflow = 0;
  
  Object.values(propertyAssets).forEach(asset => {
    totalDown += asset.down;
    totalPrice += asset.price;
    totalCashflow += asset.cashflow || 0;
  });
  
  // Aktualisiere die Input-Felder
  document.getElementById('input-asset-property-down').value = totalDown.toFixed(2);
  document.getElementById('input-asset-property-cost').value = totalPrice.toFixed(2);
  document.getElementById('input-income-property').value = totalCashflow.toFixed(2);
}

// Setup-Funktion für Kaufen-Button
function setupPropertyBuyButton() {
  propertyBuyBtn = document.getElementById('btn-buy-property');
  if (propertyBuyBtn) {
    propertyBuyBtn.addEventListener('click', () => {
      showPropertyBuyPopup();
    });
  }
}

// Setup-Funktion für Verkaufen-Button
function setupPropertySellButton() {
  propertySellBtn = document.getElementById('btn-sell-property');
  if (propertySellBtn) {
    propertySellBtn.addEventListener('click', () => {
      const hasProperties = Object.keys(propertyAssets).length > 0;
      if (hasProperties) {
        showPropertySellPopup();
      } else {
        alert('Sie haben keine Immobilien zum Verkaufen.');
      }
    });
  }
}

// Popup für Immobilien-Kauf anzeigen
function showPropertyBuyPopup() {
  const popup = document.getElementById('property-popup');
  if (!popup) {
    console.error('Property buy popup not found');
    return;
  }
  
  // Reset form
  document.getElementById('property-type').value = 'efh';
  document.getElementById('property-down').value = '';
  document.getElementById('property-price').value = '';
  document.getElementById('property-cashflow').value = '';
  document.getElementById('property-units').value = '1';
    // Handle units field visibility
  handlePropertyTypeChange();
  
  popup.style.display = 'flex';
}

// Popup für Immobilien-Verkauf anzeigen
function showPropertySellPopup() {
  const popup = document.getElementById('property-sell-popup');
  if (!popup) {
    console.error('Property sell popup not found');
    return;
  }
  
  // Populate property dropdown
  const selectElement = document.getElementById('property-sell-name');
  selectElement.innerHTML = '';
  
  Object.entries(propertyAssets).forEach(([id, asset]) => {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = propertyTypes[asset.type]?.name || asset.type;
    selectElement.appendChild(option);
  });
  
  if (selectElement.options.length > 0) {
    selectElement.selectedIndex = 0;
    handlePropertySellSelectionChange();  }
  
  popup.style.display = 'flex';
}

// Handle property type change (show/hide units field)
function handlePropertyTypeChange() {
  const typeSelect = document.getElementById('property-type');
  const unitsContainer = document.getElementById('property-units-container');
  const unitsInput = document.getElementById('property-units');
  
  const selectedType = typeSelect.value;
  
  if (selectedType === 'mfh' || selectedType === 'ah') {
    unitsContainer.style.display = 'contents';
    unitsInput.value = selectedType === 'mfh' ? '4' : '24'; // Default values
  } else {
    unitsContainer.style.display = 'none';
    unitsInput.value = propertyTypes[selectedType]?.units || 1;
  }
}

// Handle property sell selection change
function handlePropertySellSelectionChange() {
  const selectElement = document.getElementById('property-sell-name');
  const selectedId = selectElement.value;
  
  if (selectedId && propertyAssets[selectedId]) {
    const asset = propertyAssets[selectedId];
    document.getElementById('property-sell-price').value = '';
    document.getElementById('property-current-down').textContent = asset.down.toFixed(2) + ' €';
    document.getElementById('property-current-price').textContent = asset.price.toFixed(2) + ' €';
    document.getElementById('property-current-cashflow').textContent = (asset.cashflow || 0).toFixed(2) + ' €';
  }
}

// Setup-Funktion für Kauf-Popup
function setupPropertyBuyPopup() {
  // Typ-Änderung
  const typeSelect = document.getElementById('property-type');
  if (typeSelect) {
    typeSelect.addEventListener('change', handlePropertyTypeChange);
  }
  
  // Bestätigen-Button
  const confirmBtn = document.getElementById('property-buy-confirm');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      const type = document.getElementById('property-type').value;
      const down = parseFloat(document.getElementById('property-down').value) || 0;
      const price = parseFloat(document.getElementById('property-price').value) || 0;
      const cashflow = parseFloat(document.getElementById('property-cashflow').value) || 0;
      const units = parseInt(document.getElementById('property-units').value) || 1;
      
      if (down > 0 && price > 0 && down <= window.CashflowCore.runningBalance()) {
        // Unique ID für die Immobilie generieren
        const propertyId = `${type}_${Date.now()}`;
        
        // Asset hinzufügen
        propertyAssets[propertyId] = {
          type: type,
          down: down,
          price: price,
          cashflow: cashflow,
          units: units
        };
        
        // Kontostand anpassen
        window.CashflowCore.setRunningBalance(window.CashflowCore.runningBalance() - down);
        
        // Eintrag zur Bargeldkonto-Liste hinzufügen
        addPropertyPurchaseToEntries(type, down, price);
        
        // UI aktualisieren
        updatePropertyAssetsList();
        window.CashflowCore.updateDisplayBalance();
        window.CashflowCore.updateSummary();
        window.CashflowCore.updatePayButtonStates();
        
        // Popup schließen
        document.getElementById('property-popup').style.display = 'none';
      } else if (down > window.CashflowCore.runningBalance()) {
        alert('Nicht genügend Geld für den Eigenanteil!');
      } else {
        alert('Bitte geben Sie gültige Werte ein!');
      }
    });
  }
  
  // Abbrechen-Button
  const cancelBtn = document.getElementById('property-buy-cancel');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      document.getElementById('property-popup').style.display = 'none';
    });
  }
}

// Setup-Funktion für Verkauf-Popup
function setupPropertySellPopup() {
  // Auswahl-Änderung
  const selectElement = document.getElementById('property-sell-name');
  if (selectElement) {
    selectElement.addEventListener('change', handlePropertySellSelectionChange);
  }
  
  // Bestätigen-Button
  const confirmBtn = document.getElementById('property-sell-confirm');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      const propertyId = document.getElementById('property-sell-name').value;
      const sellPrice = parseFloat(document.getElementById('property-sell-price').value) || 0;
      
      if (!propertyId || !propertyAssets[propertyId]) {
        alert('Bitte wählen Sie eine Immobilie zum Verkaufen aus!');
        return;
      }
      
      const asset = propertyAssets[propertyId];
      
      if (sellPrice > 0) {
        // Kontostand updaten
        window.CashflowCore.setRunningBalance(window.CashflowCore.runningBalance() + sellPrice);
        
        // Eintrag zur Bargeldkonto-Liste hinzufügen
        addPropertySaleToEntries(asset.type, sellPrice);
        
        // Asset entfernen
        delete propertyAssets[propertyId];
        
        // UI aktualisieren
        updatePropertyAssetsList();
        window.CashflowCore.updateDisplayBalance();
        window.CashflowCore.updateSummary();
        window.CashflowCore.updatePayButtonStates();
        
        // Popup schließen
        document.getElementById('property-sell-popup').style.display = 'none';
      } else {
        alert('Bitte geben Sie einen gültigen Verkaufspreis ein!');
      }
    });
  }
  
  // Abbrechen-Button
  const cancelBtn = document.getElementById('property-sell-cancel');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      document.getElementById('property-sell-popup').style.display = 'none';
    });
  }
}

// Funktion zum Hinzufügen eines Immobilienkaufs zur Bargeldkonto-Liste
function addPropertyPurchaseToEntries(type, down, price) {
  const ul = document.getElementById('entries');
  const emptyInput = ul.querySelector('input[value=""]');
  const insertAfterElement = emptyInput ? emptyInput.parentNode : null;
  
  // Neuen Eintrag für den Immobilienkauf erstellen
  const li = document.createElement('li');
  const inp = document.createElement('input');
  inp.type = 'text';
  inp.readOnly = true;
  inp.value = `-${down.toFixed(2)}`;
  inp.style.color = 'var(--danger)';
  
  const typeName = propertyTypes[type]?.name || type;
  inp.title = `${typeName} gekauft - Eigenanteil: ${down.toFixed(2)} €, Kaufpreis: ${price.toFixed(2)} €`;
  
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
  sumInp.readOnly = true;
  sumInp.value = (window.CashflowCore.runningBalance() >= 0 ? '+' : '-') + Math.abs(window.CashflowCore.runningBalance()).toFixed(2);
  sumInp.style.background = '#eee';
  
  if (window.CashflowCore.runningBalance() < 0) {
    sumInp.style.color = 'var(--danger)';
  }
  
  sumLi.append(sumInp);
  
  // Kontostand-Eintrag nach dem Kauf-Eintrag einfügen
  li.after(sumLi);
  
  // Globale Flag setzen
  window.lastActionWasManualEntry = true;
}

// Funktion zum Hinzufügen eines Immobilienverkaufs zur Bargeldkonto-Liste
function addPropertySaleToEntries(type, price) {
  const ul = document.getElementById('entries');
  const emptyInput = ul.querySelector('input[value=""]');
  const insertAfterElement = emptyInput ? emptyInput.parentNode : null;
  
  // Neuen Eintrag für den Immobilienverkauf erstellen
  const li = document.createElement('li');
  const inp = document.createElement('input');
  inp.type = 'text';
  inp.readOnly = true;
  inp.value = `+${price.toFixed(2)}`;
  
  const typeName = propertyTypes[type]?.name || type;
  inp.title = `${typeName} verkauft für ${price.toFixed(2)} €`;
  
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
  sumInp.readOnly = true;
  sumInp.value = (window.CashflowCore.runningBalance() >= 0 ? '+' : '-') + Math.abs(window.CashflowCore.runningBalance()).toFixed(2);
  sumInp.style.background = '#eee';
  
  if (window.CashflowCore.runningBalance() < 0) {
    sumInp.style.color = 'var(--danger)';
  }
  
  sumLi.append(sumInp);
  
  // Kontostand-Eintrag nach dem Verkauf-Eintrag einfügen
  li.after(sumLi);
  
  // Globale Flag setzen
  window.lastActionWasManualEntry = true;
}

// Hauptinitialisierungsfunktion
function initProperty() {
  setupPropertyBuyButton();
  setupPropertySellButton();
  setupPropertyBuyPopup();
  setupPropertySellPopup();
  updatePropertyAssetsList();
}

// Globale Funktionen für andere Module verfügbar machen
window.showPropertyBuyPopup = showPropertyBuyPopup;
window.showPropertySellPopup = showPropertySellPopup;
window.propertyAssets = propertyAssets;
window.updatePropertyAssetsList = updatePropertyAssetsList;

// Auto-initialization wenn DOM geladen ist
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProperty);
} else {
  initProperty();
}
