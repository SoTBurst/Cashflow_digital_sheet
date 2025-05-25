// Initialize functionality when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('Metals-init.js: DOM ready, setting up buttons');
  
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

  // Initial styling update for metals field
  if (typeof updateMetalsFieldStyling === 'function') {
    updateMetalsFieldStyling();
  }
});
