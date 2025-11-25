/**
 * Comprehensive Safari Button Fix
 * Uses direct DOM manipulation for maximum compatibility
 */

export function isSafari(): boolean {
  if (typeof window === 'undefined') return false;

  const userAgent = window.navigator.userAgent;
  return /^((?!chrome|android).)*safari/i.test(userAgent) || /iPad|iPhone|iPod/.test(userAgent);
}

export function applySafariButtonFix(): void {
  if (!isSafari()) return;

  console.log('🔧 [Safari Fix] Applying comprehensive Safari button fixes...');

  // Find all buttons on the page
  const allButtons = document.querySelectorAll('button, [role="button"]');

  allButtons.forEach((button) => {
    if (button instanceof HTMLElement) {
      // Remove existing event listeners to prevent duplicates
      button.removeEventListener('touchstart', handleButtonTouch);
      button.removeEventListener('touchend', handleButtonTouch);
      button.removeEventListener('click', handleButtonClick);

      // Apply Safari-specific styles
      button.style.cursor = 'pointer';
      button.style.pointerEvents = 'auto';
      button.style.touchAction = 'manipulation';
      button.style.webkitTouchCallout = 'none';
      button.style.webkitUserSelect = 'none';
      button.style.position = 'relative';
      button.style.zIndex = '1';

      // Add Safari button attribute
      button.setAttribute('data-safari-button', 'true');

      // Add comprehensive event listeners
      button.addEventListener('touchstart', handleButtonTouch, { passive: false });
      button.addEventListener('touchend', handleButtonTouch, { passive: false });
      button.addEventListener('click', handleButtonClick, { passive: false });

      // Disable pointer events on child elements
      const children = button.querySelectorAll('*');
      children.forEach(child => {
        if (child instanceof HTMLElement) {
          child.style.pointerEvents = 'none';
        }
      });
    }
  });

  console.log(`🔧 [Safari Fix] Fixed ${allButtons.length} buttons`);
}

function handleButtonTouch(event: Event): void {
  const button = event.currentTarget as HTMLButtonElement;

  if (event.type === 'touchstart') {
    console.log('🔧 [Safari] Touch start on button');
    // Visual feedback
    button.style.transform = 'scale(0.95)';
  } else if (event.type === 'touchend') {
    console.log('🔧 [Safari] Touch end on button - triggering click');

    // Reset visual feedback
    button.style.transform = '';

    // Prevent default to avoid double-click issues
    event.preventDefault();
    event.stopPropagation();

    // Manually trigger click after a brief delay
    setTimeout(() => {
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      button.dispatchEvent(clickEvent);
    }, 50);
  }
}

function handleButtonClick(event: Event): void {
  console.log('🔧 [Safari] Button clicked');
  // Let the original click handler run
  // Don't prevent default here
}

/**
 * Initialize Safari fixes and set up observers for dynamic content
 */
export function initSafariFixes(): void {
  if (!isSafari()) return;

  // Apply fixes immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applySafariButtonFix);
  } else {
    applySafariButtonFix();
  }

  // Set up mutation observer for dynamically added buttons
  const observer = new MutationObserver((mutations) => {
    let shouldReapply = false;

    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          if (element.matches('button, [role="button"]') ||
              element.querySelector('button, [role="button"]')) {
            shouldReapply = true;
          }
        }
      });
    });

    if (shouldReapply) {
      console.log('🔧 [Safari Fix] New buttons detected, reapplying fixes...');
      setTimeout(applySafariButtonFix, 100);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}