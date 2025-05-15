// Mobile UI utilities

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
