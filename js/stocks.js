// Updated stocks functionality - buying and selling

// Global variables for easy debugging
let stocksBuyBtn, stocksSellBtn;

// Initialize functionality when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  console.log('stocks-fixed.js: DOM ready, initializing stocks functionality');

  // Get button references
  stocksBuyBtn = document.getElementById('btn-buy-stocks');
  stocksSellBtn = document.getElementById('btn-sell-stocks');

  if (stocksBuyBtn) {
    console.log('Found stocks buy button, attaching event listener');
    stocksBuyBtn.addEventListener('click', function () {
      console.log('Stocks buy button clicked');
      showStocksPopup();
    });
  } else {
    console.error('Could not find stocks buy button!');
  }

  if (stocksSellBtn) {
    console.log('Found stocks sell button, attaching event listener');
    stocksSellBtn.addEventListener('click', function () {
      console.log('Stocks sell button clicked');
      const stocksQty = parseInt(document.getElementById('input-asset-stocks-qty').value) || 0;
      if (stocksQty > 0) {
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
});

function setupStocksBuyPopup() {
  console.log('Setting up stocks buy popup');
  const popup = document.getElementById('stocks-popup');
  if (!popup) {
    console.error('Could not find stocks popup!');
    return;
  }

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
    console.log('Stock buy confirm clicked');
    const shares = parseInt(sharesInput.value) || 0;
    let price;

    price = (parseFloat(priceInput.value) || 0) * shares;

    console.log(`Buying ${shares} shares for ${price}`);

    if (shares > 0 && price > 0 && window.CashflowCore.runningBalance() >= price) {
      // Subtract amount from account balance
      window.CashflowCore.setRunningBalance(window.CashflowCore.runningBalance() - price);

      // Add number of shares to stocks
      const currentStocksQty = parseInt(document.getElementById('input-asset-stocks-qty').value) || 0;
      const currentStocksCost = parseInt(document.getElementById('input-asset-stocks-cost').value) || 0;

      document.getElementById('input-asset-stocks-qty').value = currentStocksQty + shares;
      document.getElementById('input-asset-stocks-cost').value = currentStocksCost + price;

      // Update account balance display
      addStocksPurchaseToEntries(shares, price);
      window.CashflowCore.updateDisplayBalance();

      // Update sell button state
      if (typeof window.updateSellButtonStates === 'function') {
        window.updateSellButtonStates();
      } else {
        console.error('updateSellButtonStates function not found!');
        // Enable sell button directly
        const sellBtn = document.getElementById('btn-sell-stocks');
        if (sellBtn) {
          sellBtn.disabled = false;
          sellBtn.classList.remove('btn-disabled');
        }
      }

      // Close popup
      hideStocksPopup();
    } else {
      // Error message for insufficient funds or invalid values
      if (window.CashflowCore.runningBalance() < price) {
        alert('Nicht genügend Guthaben für diesen Kauf!');
      } else {
        alert('Bitte geben Sie gültige Werte ein!');
      }
    }
  });

  // Cancel button
  cancelBtn.addEventListener('click', function () {
    console.log('Stock buy cancel clicked');
    hideStocksPopup();
  });

  // Click outside popup closes it
  popup.addEventListener('click', function (e) {
    if (e.target === popup) {
      hideStocksPopup();
    }
  });
}

function updateStocksPriceCalculation() {
  const sharesInput = document.getElementById('stocks-shares');
  const priceInput = document.getElementById('stocks-price');
  const totalContainer = document.getElementById('stocks-total-container');
  const totalPrice = document.getElementById('stocks-total-price');

  const shares = parseInt(sharesInput.value) || 0;
  const inputPrice = parseFloat(priceInput.value) || 0;

  priceInput.placeholder = 'Preis pro Aktie';
  totalContainer.style.display = 'contents';
  totalPrice.textContent = (inputPrice * shares).toFixed(2) + " €";
}

function showStocksPopup() {
  console.log('Showing stocks popup');
  // Reset and show popup
  document.getElementById('stocks-shares').value = '1';
  document.getElementById('stocks-price').value = '';
  document.getElementById('stocks-price').placeholder = 'Preis pro Aktie';
  document.getElementById('stocks-total-price').textContent = '0.00 €';

  const popup = document.getElementById('stocks-popup');
  popup.style.display = 'flex';
}

function hideStocksPopup() {
  console.log('Hiding stocks popup');
  document.getElementById('stocks-popup').style.display = 'none';
}

function addStocksPurchaseToEntries(shares, price) {
  const ul = document.getElementById('entries');
  const entriesChildren = Array.from(ul.children);
  const lastEntryIndex = entriesChildren.length - 1;

  // Check if the last element is an empty input field
  const isLastEntryEmpty = lastEntryIndex >= 0 &&
    entriesChildren[lastEntryIndex].querySelector('input').type === 'number';

  const insertBeforeElement = isLastEntryEmpty ? entriesChildren[lastEntryIndex] : null;

  // Create entry for stock purchase
  const li = document.createElement('li');
  const inp = document.createElement('input');
  inp.type = 'text';
  inp.readOnly = true;
  inp.value = '-' + price.toFixed(2);
  inp.style.color = 'var(--danger)';
  inp.title = `${shares} Aktie${shares > 1 ? 'n' : ''} gekauft`;

  li.append(inp);

  if (insertBeforeElement) {
    ul.insertBefore(li, insertBeforeElement);
  } else {
    ul.appendChild(li);
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

  if (insertBeforeElement) {
    ul.insertBefore(sumLi, insertBeforeElement);
  } else {
    ul.appendChild(sumLi);
  }

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
    const totalShares = parseInt(document.getElementById('input-asset-stocks-qty').value) || 0;
    const totalCost = parseInt(document.getElementById('input-asset-stocks-cost').value) || 0;
    const sharesToSell = parseInt(sharesInput.value) || 0;
    let price;

    price = (parseFloat(priceInput.value) || 0) * sharesToSell;


    console.log(`Selling ${sharesToSell} of ${totalShares} shares for ${price}`);

    // Check if enough shares are available and the price is valid
    if (sharesToSell > 0 && price > 0 && sharesToSell <= totalShares) {
      // Add proceeds to account balance
      window.CashflowCore.setRunningBalance(window.CashflowCore.runningBalance() + price);

      // Calculate the cost of sold shares (proportional to total cost)
      const costPerShare = totalCost / totalShares;
      const soldSharesCost = costPerShare * sharesToSell;

      // Update stocks
      document.getElementById('input-asset-stocks-qty').value = totalShares - sharesToSell;
      document.getElementById('input-asset-stocks-cost').value = Math.round(totalCost - soldSharesCost);

      // Update account balance display
      addStocksSaleToEntries(sharesToSell, price);
      window.CashflowCore.updateDisplayBalance();

      // Update sell button state
      if (typeof window.updateSellButtonStates === 'function') {
        window.updateSellButtonStates();
      } else {
        console.error('updateSellButtonStates function not found!');
        // Update sell button directly
        const sellBtn = document.getElementById('btn-sell-stocks');
        if (sellBtn && (totalShares - sharesToSell) <= 0) {
          sellBtn.disabled = true;
          sellBtn.classList.add('btn-disabled');
        }
      }

      // Close popup
      hideStocksSellPopup();
    } else {
      // Error message for insufficient shares or invalid values
      if (sharesToSell > totalShares) {
        alert('Sie besitzen nicht genügend Aktien für diesen Verkauf!');
      } else {
        alert('Bitte geben Sie gültige Werte ein!');
      }
    }
  });

  // Cancel button
  cancelBtn.addEventListener('click', function () {
    console.log('Stock sell cancel clicked');
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
  const inputPrice = parseFloat(priceInput.value) || 0;

  priceInput.placeholder = 'Preis pro Aktie';
  totalContainer.style.display = 'contents';
  totalPrice.textContent = (inputPrice * shares).toFixed(2) + " €";

}

function showStocksSellPopup() {
  console.log('Showing stocks sell popup');
  const totalShares = parseInt(document.getElementById('input-asset-stocks-qty').value) || 0;

  // Reset and show popup
  document.getElementById('stocks-sell-shares').value = '1';
  document.getElementById('stocks-sell-price').value = '';
  document.getElementById('stocks-sell-price').placeholder = 'Preis pro Aktie';
  document.getElementById('stocks-total-price').textContent = '0.00 €';
  document.getElementById('stocks-available').textContent = totalShares;

  // Set max value for share count
  document.getElementById('stocks-sell-shares').max = totalShares;

  const popup = document.getElementById('stocks-sell-popup');
  popup.style.display = 'flex';
}

function hideStocksSellPopup() {
  console.log('Hiding stocks sell popup');
  document.getElementById('stocks-sell-popup').style.display = 'none';
}

function addStocksSaleToEntries(shares, price) {
  const ul = document.getElementById('entries');
  const entriesChildren = Array.from(ul.children);
  const lastEntryIndex = entriesChildren.length - 1;

  // Check if the last element is an empty input field
  const isLastEntryEmpty = lastEntryIndex >= 0 &&
    entriesChildren[lastEntryIndex].querySelector('input').type === 'number';

  const insertBeforeElement = isLastEntryEmpty ? entriesChildren[lastEntryIndex] : null;

  // Create entry for stock sale
  const li = document.createElement('li');
  const inp = document.createElement('input');
  inp.type = 'text';
  inp.readOnly = true;
  inp.value = '+' + price.toFixed(2);
  inp.style.color = ''; // Positive amounts in standard color
  inp.title = `${shares} Aktie${shares > 1 ? 'n' : ''} verkauft`;

  li.append(inp);

  if (insertBeforeElement) {
    ul.insertBefore(li, insertBeforeElement);
  } else {
    ul.appendChild(li);
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

  if (insertBeforeElement) {
    ul.insertBefore(sumLi, insertBeforeElement);
  } else {
    ul.appendChild(sumLi);
  }

  // Set global flag (for bank logic)
  window.lastActionWasManualEntry = true;
}

// Make functions available globally
window.showStocksPopup = showStocksPopup;
window.hideStocksPopup = hideStocksPopup;
window.showStocksSellPopup = showStocksSellPopup;
window.hideStocksSellPopup = hideStocksSellPopup;
