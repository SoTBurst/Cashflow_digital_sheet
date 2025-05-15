// Fix for the stocks functionality
console.log('Executing direct-fix script');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded in direct-fix script');
    
    // Direct event listener for the stock buy button
    const stockBuyButton = document.getElementById('btn-buy-stocks');
    if (stockBuyButton) {
        console.log('Found stock buy button, attaching listener');
        stockBuyButton.addEventListener('click', function() {
            console.log('Stock buy button clicked!');
            // Find and show the stocks popup
            const stocksPopup = document.getElementById('stocks-popup');
            if (stocksPopup) {
                console.log('Found stocks popup, displaying it');
                // Reset popup values
                document.getElementById('stocks-buy-type').value = 'total';
                document.getElementById('stocks-shares').value = '1';
                document.getElementById('stocks-price').value = '';
                document.getElementById('stocks-price').placeholder = 'Gesamtpreis';
                document.getElementById('stocks-total-container').style.display = 'none';
                
                // Show popup
                stocksPopup.style.display = 'flex';
            } else {
                console.error('Could not find stocks popup element!');
                alert('Error: Could not find stocks popup element!');
            }
        });
    } else {
        console.error('Could not find stock buy button!');
    }
});
