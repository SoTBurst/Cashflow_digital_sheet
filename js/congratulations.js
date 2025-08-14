// Congratulations popup functionality for financial freedom achievement

let hasShownCongratulations = false;
let lastPassiveIncome = 0;
let lastTotalExpenses = 0;

// Function to check if financial freedom is achieved
function checkFinancialFreedom(passiveIncome, totalExpenses) {
  // Only show congratulations once per session and when passive income actually exceeds expenses
  if (!hasShownCongratulations && passiveIncome > 0 && totalExpenses > 0 && passiveIncome > totalExpenses) {
    // Additional check: make sure this is a new achievement and meaningful amounts
    const isSignificantAchievement = passiveIncome >= 100 && totalExpenses >= 100; // Avoid showing for tiny amounts
    const isNewAchievement = passiveIncome > lastPassiveIncome || totalExpenses < lastTotalExpenses;
    
    if (isSignificantAchievement && (isNewAchievement || lastPassiveIncome === 0)) {
      showCongratulationsPopup(passiveIncome, totalExpenses);
      hasShownCongratulations = true;
    }
  }
  
  // Update tracking values
  lastPassiveIncome = passiveIncome;
  lastTotalExpenses = totalExpenses;
}

// Function to create fireworks animation
function createFireworks() {
  const popup = document.getElementById('congratulations-popup');
  const fireworksContainer = document.createElement('div');
  fireworksContainer.className = 'fireworks-container';
  fireworksContainer.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: hidden;
    z-index: 1;
  `;
  
  popup.appendChild(fireworksContainer);
  
  // Create multiple firework bursts
  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      createFireworkBurst(fireworksContainer);
    }, i * 500);
  }
  
  // Clean up after animation
  setTimeout(() => {
    if (fireworksContainer.parentNode) {
      fireworksContainer.parentNode.removeChild(fireworksContainer);
    }
  }, 5000);
}

function createFireworkBurst(container) {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8'];
  const x = Math.random() * container.offsetWidth;
  const y = Math.random() * (container.offsetHeight * 0.6) + (container.offsetHeight * 0.2);
  
  // Create burst center
  const burst = document.createElement('div');
  burst.style.cssText = `
    position: absolute;
    left: ${x}px;
    top: ${y}px;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    pointer-events: none;
  `;
  
  container.appendChild(burst);
  
  // Create particles
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const angle = (i / 20) * Math.PI * 2;
    const velocity = 50 + Math.random() * 50;
    const size = 2 + Math.random() * 4;
    
    particle.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: 50%;
      pointer-events: none;
      animation: firework-particle 1.5s ease-out forwards;
      --dx: ${Math.cos(angle) * velocity}px;
      --dy: ${Math.sin(angle) * velocity}px;
    `;
    
    container.appendChild(particle);
    
    // Remove particle after animation
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, 1500);
  }
  
  // Remove burst center
  setTimeout(() => {
    if (burst.parentNode) {
      burst.parentNode.removeChild(burst);
    }
  }, 100);
}

// Function to play celebration sound
function playCelebrationSound() {
  try {
    // Create a simple celebratory sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create a sequence of ascending notes
    const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      
      const startTime = audioContext.currentTime + (index * 0.2);
      const endTime = startTime + 0.3;
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, endTime);
      
      oscillator.start(startTime);
      oscillator.stop(endTime);
    });
  } catch (error) {
    console.log('Could not play celebration sound:', error);
  }
}

// Function to show congratulations popup
function showCongratulationsPopup(passiveIncome, totalExpenses) {
  const popup = document.getElementById('congratulations-popup');
  const surplus = passiveIncome - totalExpenses;
  
  // Update the displayed values
  document.getElementById('congrats-passive-income').textContent = window.formatCurrency(passiveIncome);
  document.getElementById('congrats-total-expenses').textContent = window.formatCurrency(totalExpenses);
  document.getElementById('congrats-surplus').textContent = window.formatCurrency(surplus);
  
  // Show the popup
  popup.style.display = 'flex';
  
  // Add a slight delay before starting fireworks for better effect
  setTimeout(() => {
    popup.classList.add('show-fireworks');
    createFireworks();
  }, 300);
  
  // Play celebration sound
  playCelebrationSound();

  // Optional auto-forward after some seconds (user can still click manually sooner)
  if (!popup.dataset.autoForwardSet) {
    popup.dataset.autoForwardSet = 'true';
    setTimeout(() => {
      if (popup.style.display === 'flex') {
        goToFreedomMode();
      }
    }, 6000);
  }
}

// Function to hide congratulations popup
function hideCongratulationsPopup() {
  const popup = document.getElementById('congratulations-popup');
  popup.style.display = 'none';
  popup.classList.remove('show-fireworks');
}

// Function to reset the congratulations flag (useful for testing or profile changes)
function resetCongratulationsFlag() {
  hasShownCongratulations = false;
  lastPassiveIncome = 0;
  lastTotalExpenses = 0;
}

// Setup event listeners for congratulations popup
function setupCongratulationsPopup() {
  const closeBtn = document.getElementById('congratulations-close');
  const continueBtn = document.getElementById('congratulations-continue');
  const popup = document.getElementById('congratulations-popup');
  
  if (closeBtn) {
    closeBtn.addEventListener('click', hideCongratulationsPopup);
  }
  if (continueBtn) {
    continueBtn.addEventListener('click', (e) => {
      e.preventDefault();
      goToFreedomMode();
    });
  }
  
  // Allow clicking outside popup to close it
  if (popup) {
    popup.addEventListener('click', (e) => {
      if (e.target === popup) {
        hideCongratulationsPopup();
      }
    });
  }
  
  // Allow ESC key to close popup
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popup && popup.style.display === 'flex') {
      hideCongratulationsPopup();
    }
  });
}

function goToFreedomMode() {
  // Ensure popup hidden first
  hideCongratulationsPopup();
  // Redirect to simplified freedom mode page
  try {
    // Passives Einkommen auf Index-Seite auslesen (Anzeige enthält Währung)
    const passiveEl = document.getElementById('sum-passive');
    if (passiveEl) {
      const raw = passiveEl.textContent || '0';
      const passive = window.parseFormattedNumber ? (window.parseFormattedNumber(raw) || 0) : parseFloat(raw.replace(/[^0-9]/g,'')) || 0;
      // Auf nächsten 1000er aufrunden und *100
      let base = Math.ceil(Math.max(passive, 0) / 1000) * 1000;
      base = base * 100; // Skalierung wie gefordert
      sessionStorage.setItem('freedomBaseCashflow', String(base));
    }
  } catch(e) { /* ignore */ }
  window.location.href = 'freedom.html';
}

// Initialize congratulations functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  setupCongratulationsPopup();
});

// Export functions for use in other modules
window.CongratulationsPopup = {
  checkFinancialFreedom,
  showCongratulationsPopup,
  hideCongratulationsPopup,
  resetCongratulationsFlag
  , goToFreedomMode
};
