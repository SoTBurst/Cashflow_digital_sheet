// Initialize functionality when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('Metals-init.js: DOM ready, setting up buttons');
  
  // Test if button event handlers are working properly
  document.getElementById('btn-buy-stocks').addEventListener('click', function() {
    console.log('Stock buy button clicked from metals-init.js');
    if (typeof window.showStocksPopup === 'function') {
      window.showStocksPopup();
    } else {
      console.error('showStocksPopup function not found in metals-init.js');
      alert('Error: showStocksPopup function not found. Check the console for details.');
    }
  });
  
  // Continue with the normal setup
  if (typeof setupBuyButtons === 'function') {
    setupBuyButtons();
  } else {
    console.error('setupBuyButtons function not found');
  }
  
  if (typeof setupSellButtons === 'function') {
    setupSellButtons();
  } else {
    console.error('setupSellButtons function not found');
  }
  
  if (typeof setupMetalsPopup === 'function') {
    setupMetalsPopup();
  }
  
  if (typeof setupMetalsSellPopup === 'function') {
    setupMetalsSellPopup();
  }
});
