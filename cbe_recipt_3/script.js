/**
 * Commercial Bank of Ethiopia - Receipt Interactive Script
 * Handles official CBE Processor Loader delay, PDF download, clipboard copy, and utilities
 */

// ============================================================================
// OFFICIAL CBE MOBILE RECEIPT LOADER LOGIC
// Exactly 1.8 seconds (1,800,000 microseconds / 1,800ms) animation stay duration
// ============================================================================
(function initCBELoader() {
  // Clean URL if old test parameters (like ?delay_us=5000000) are lingering in browser
  if (typeof window !== 'undefined' && window.history && window.history.replaceState && window.location.search.includes('delay')) {
    const cleanUrl = window.location.protocol + '//' + window.location.host + window.location.pathname;
    window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
  }

  // Exact target stay duration: 1.8 seconds (1,800 ms / 1,800,000 µs)
  const EXACT_DURATION_MS = 1800;

  function dismissLoader() {
    const loader = document.getElementById('cbeLoader');
    if (!loader) return;

    loader.classList.add('cbe-loader-hidden');
    // Hide completely after transition to allow full interaction
    setTimeout(() => {
      loader.style.display = 'none';
    }, 400);
  }

  // Calculate elapsed time from the instant the document started rendering
  const pageStartTime = (typeof window.__loaderStartTime === 'number') ? window.__loaderStartTime : performance.now();
  const elapsed = performance.now() - pageStartTime;
  const remainingDelay = Math.max(0, EXACT_DURATION_MS - elapsed);

  // Trigger dismissal at exactly 1.8s from page start
  setTimeout(dismissLoader, remainingDelay);

  // Re-trigger loading screen anytime (default: 1.8s)
  // window.simulateCBELoader() or window.simulateCBELoader(1800)
  window.simulateCBELoader = function (customDelay, isMicroseconds = false) {
    const loader = document.getElementById('cbeLoader');
    if (!loader) return;

    let delayMs = EXACT_DURATION_MS;
    if (typeof customDelay === 'number' && customDelay > 0) {
      delayMs = isMicroseconds ? Math.round(customDelay / 1000) : customDelay;
    }

    loader.style.display = 'flex';
    // Force DOM reflow to re-trigger transition
    void loader.offsetWidth;
    loader.classList.remove('cbe-loader-hidden');

    setTimeout(dismissLoader, delayMs);
  };
})();

// Download PDF / Print Handler
function downloadReceiptPDF() {
  window.print();
}

// Copy Reference Number to Clipboard with Toast Notification
function copyReference(refText) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(refText).then(() => {
      showToast("Reference number copied!");
    }).catch(() => {
      fallbackCopy(refText);
    });
  } else {
    fallbackCopy(refText);
  }
}

function fallbackCopy(text) {
  const tempInput = document.createElement("input");
  tempInput.value = text;
  document.body.appendChild(tempInput);
  tempInput.select();
  try {
    document.execCommand("copy");
    showToast("Reference number copied!");
  } catch (err) {
    showToast("Copy failed, please select and copy manually");
  }
  document.body.removeChild(tempInput);
}

// Show Toast Message
function showToast(message) {
  const toast = document.getElementById("toastNotification");
  const toastText = document.getElementById("toastMessage");
  if (!toast || !toastText) return;
  
  toastText.textContent = message;
  toast.classList.add("show");
  
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2400);
}
