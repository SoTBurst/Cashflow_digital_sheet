// Mobile UI utilities

// Zahlenformatierung mit Tausendertrennzeichen (Punkte)
function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }
  
  const rounded = Math.round(num);
  return Math.abs(rounded).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function formatCurrency(num) {
  return formatNumber(num) + ' €';
}

function formatNumberWithSign(num) {
  if (num === null || num === undefined || isNaN(num)) {
    return '+0';
  }
  
  const rounded = Math.round(num);
  const sign = rounded >= 0 ? '+' : '-';
  return sign + formatNumber(Math.abs(rounded));
}

function formatCurrencyWithSign(num) {
  return formatNumberWithSign(num) + ' €';
}

// Parsing-Funktion für formatierte Zahlen
function parseFormattedNumber(str) {
  if (typeof str !== 'string') {
    return parseFloat(str) || 0;
  }
  
  // Entferne alle Formatierungszeichen außer Komma und Minus
  const cleaned = str.replace(/[+€\s\.]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

// Export functions to window for global access
window.formatNumber = formatNumber;
window.formatCurrency = formatCurrency;
window.formatNumberWithSign = formatNumberWithSign;
window.formatCurrencyWithSign = formatCurrencyWithSign;
window.parseFormattedNumber = parseFormattedNumber;

// Mobile scroll functionality for hiding taskbar
function setupMobileScroll() {
  // Only set up on mobile devices
  if (window.innerWidth > 768) {
    return;
  }
  
  const body = document.body;
  let touchStartY = 0;
  let touchEndY = 0;
  
  // Handle for showing taskbar again
  const mobileHandle = document.getElementById('mobile-handle');
  mobileHandle.addEventListener('click', () => {
    body.classList.remove('taskbar-hidden');
  });
  
  // Touch events for the whole page
  body.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, false);
  
  body.addEventListener('touchend', (e) => {
    touchEndY = e.changedTouches[0].clientY;
    handleSwipe();
  }, false);
  
  function handleSwipe() {
    // Detect direction
    const swipeDistance = touchEndY - touchStartY;
    
    // Upward swipe (hide taskbar)
    if (swipeDistance < -50 && !body.classList.contains('taskbar-hidden')) {
      body.classList.add('taskbar-hidden');
    }
    
    // Downward swipe (show taskbar)
    if (swipeDistance > 50 && body.classList.contains('taskbar-hidden')) {
      body.classList.remove('taskbar-hidden');
    }
  }
}
