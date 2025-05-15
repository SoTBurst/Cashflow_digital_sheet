// Check if the stock functionality is working properly
console.log("Running verify-stocks.js");

function verifyStocksSetup() {
  // Check that all required elements exist
  const requiredElements = [
    'btn-buy-stocks',
    'btn-sell-stocks',
    'stocks-popup',
    'stocks-buy-type',
    'stocks-shares',
    'stocks-price',
    'stocks-total-container',
    'stocks-total-price',
    'stocks-buy-confirm',
    'stocks-buy-cancel',
    'stocks-sell-popup',
    'stocks-sell-type',
    'stocks-sell-shares',
    'stocks-sell-price',
    'stocks-sell-total-container',
    'stocks-sell-total-price',
    'stocks-sell-confirm',
    'stocks-sell-cancel',
    'stocks-available'
  ];
  
  let success = true;
  
  // Check for missing elements
  for (const id of requiredElements) {
    const element = document.getElementById(id);
    if (!element) {
      console.error(`Missing element: ${id}`);
      success = false;
    }
  }
  
  // Check that the buy button has a click handler
  const buyButton = document.getElementById('btn-buy-stocks');
  if (buyButton) {
    // The most reliable way to test if an event listener is attached would be to programmatically click it
    console.log('Found buy button, will trigger click in 2 seconds...');
    setTimeout(() => {
      console.log('Triggering buy button click');
      buyButton.click();
      
      // Check if popup appeared
      setTimeout(() => {
        const popup = document.getElementById('stocks-popup');
        if (popup && popup.style.display === 'flex') {
          console.log('Success: Buy button click opened popup');
          
          // Now hide it again
          setTimeout(() => {
            const cancelButton = document.getElementById('stocks-buy-cancel');
            if (cancelButton) {
              console.log('Clicking cancel button');
              cancelButton.click();
            }
          }, 500);
        } else {
          console.error('Failed: Buy button click did not open popup');
        }
      }, 300);
    }, 2000);
  }
  
  if (success) {
    console.log('All required elements for stocks functionality are present');
  } else {
    console.error('Some required elements for stocks functionality are missing');
  }
}

// Wait for DOM to be fully loaded before testing
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM ready in verify-stocks.js, starting verification');
  setTimeout(verifyStocksSetup, 1000);
});
