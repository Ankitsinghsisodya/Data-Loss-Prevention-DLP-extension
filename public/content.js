document.addEventListener('DOMContentLoaded', () => {
    // Block file inputs on unauthorized sites
    const checkAndBlockFileInputs = () => {
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => {
        input.addEventListener('click', async (e) => {
          // Check if site is allowed before file selection
          const response = await chrome.runtime.sendMessage({
            type: 'CHECK_SITE',
            url: window.location.hostname
          });
          
          if (response && response.blocked) {
            e.preventDefault();
            e.stopPropagation();
            alert('File uploads are not allowed on this website.');
            return false;
          }
        }, true);
      });
    };
  
    // Initial check
    checkAndBlockFileInputs();
  
    // Watch for dynamically added file inputs
    const observer = new MutationObserver(checkAndBlockFileInputs);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  
    // Block form submissions
    document.addEventListener('change', async (e) => {
      const response = await chrome.runtime.sendMessage({
        type: 'CHECK_SITE',
        url: window.location.hostname
      });
      
      if (response && response.blocked) {
        e.preventDefault();
        e.stopPropagation();
        alert('File uploads are not allowed on this website.');
        return false;
      }
    }, true);
  });