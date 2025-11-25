/**
 * Safari Button Fix Utilities
 * Direct DOM manipulation to ensure buttons work in all Safari versions
 */

export function applySafariButtonFix() {
  // Only run on Safari
  if (typeof window === 'undefined') return;

  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (!isSafari && !isIOS) return;

  console.log('🔧 [Safari Fix] Applying Safari button fixes...');

  // Fix all safari buttons
  const safariButtons = document.querySelectorAll('[data-safari-button]');

  safariButtons.forEach((button) => {
    const buttonElement = button as HTMLButtonElement;

    // Remove existing event listeners to prevent duplicates
    buttonElement.style.cursor = 'pointer';
    buttonElement.style.pointerEvents = 'auto';
    buttonElement.style.touchAction = 'manipulation';

    // Add multiple event handlers for maximum compatibility
    const handleClick = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();

      // Find the original click handler and call it
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });

      // Trigger the React synthetic event
      buttonElement.dispatchEvent(clickEvent);
    };

    // Add touch event for iOS Safari
    buttonElement.addEventListener('touchstart', handleClick, { passive: false });
    buttonElement.addEventListener('touchend', (e) => {
      e.preventDefault();
      handleClick(e);
    }, { passive: false });

    // Add mouse events for desktop Safari
    buttonElement.addEventListener('mousedown', handleClick, { passive: false });

    // Make sure the button is focusable
    if (!buttonElement.hasAttribute('tabindex')) {
      buttonElement.setAttribute('tabindex', '0');
    }

    // Add keyboard support
    buttonElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick(e);
      }
    });
  });

  // Fix Safari dropdown positioning
  const safariDropdowns = document.querySelectorAll('[data-safari-dropdown]');
  safariDropdowns.forEach((dropdown) => {
    const dropdownElement = dropdown as HTMLElement;
    dropdownElement.style.position = 'fixed';
    dropdownElement.style.zIndex = '999999';
    dropdownElement.style.pointerEvents = 'auto';
  });

  console.log(`🔧 [Safari Fix] Fixed ${safariButtons.length} buttons and ${safariDropdowns.length} dropdowns`);
}

/**
 * Force click event on Safari buttons
 */
export function forceSafariButtonClick(buttonSelector: string) {
  const button = document.querySelector(buttonSelector) as HTMLButtonElement;
  if (!button) return;

  // Multiple click attempts for Safari
  const events = ['mousedown', 'mouseup', 'click', 'touchstart', 'touchend'];

  events.forEach(eventType => {
    const event = new MouseEvent(eventType, {
      bubbles: true,
      cancelable: true,
      view: window
    });
    button.dispatchEvent(event);
  });
}

/**
 * Initialize Safari fixes when DOM is ready
 */
export function initSafariFixes() {
  if (typeof window === 'undefined') return;

  const runFixes = () => {
    applySafariButtonFix();

    // Re-run fixes after any DOM changes
    const observer = new MutationObserver((mutations) => {
      let shouldRerun = false;

      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            const element = node as Element;
            if (element.querySelector && element.querySelector('[data-safari-button]')) {
              shouldRerun = true;
            }
          }
        });
      });

      if (shouldRerun) {
        console.log('🔧 [Safari Fix] DOM changed, re-applying fixes...');
        setTimeout(applySafariButtonFix, 100);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runFixes);
  } else {
    runFixes();
  }
}