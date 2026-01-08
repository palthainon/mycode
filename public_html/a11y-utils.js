/**
 * Accessibility Utilities for OldWeb.tech
 * Lightweight vanilla JavaScript accessibility helpers
 * WCAG 2.1 Level AA compliant
 * Size: ~2KB minified
 */

const A11yUtils = (function() {
  'use strict';

  let liveRegion = null;

  /**
   * Initialize accessibility utilities
   * Creates the ARIA live region for announcements
   */
  function init() {
    createLiveRegion();
  }

  /**
   * Create a screen reader-only live region for announcements
   * @private
   */
  function createLiveRegion() {
    if (liveRegion) return;

    liveRegion = document.createElement('div');
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'a11y-live-region';

    document.body.appendChild(liveRegion);
  }

  /**
   * Announce a message to screen readers
   * @param {string} message - Message to announce
   * @param {string} priority - 'polite' (default) or 'assertive'
   */
  function announce(message, priority = 'polite') {
    if (!liveRegion) createLiveRegion();

    // Validate priority
    const validPriority = ['polite', 'assertive'].includes(priority) ? priority : 'polite';
    liveRegion.setAttribute('aria-live', validPriority);

    // Clear and set new message (with slight delay for screen reader detection)
    liveRegion.textContent = '';
    setTimeout(() => {
      liveRegion.textContent = message;
    }, 100);
  }

  /**
   * Show error message for an input field
   * @param {HTMLElement} input - Input element
   * @param {string} message - Error message
   */
  function showError(input, message) {
    if (!input || !input.id) {
      console.warn('A11yUtils.showError: Input must have an id attribute');
      return;
    }

    const errorId = input.id + '-error';
    let errorEl = document.getElementById(errorId);

    // Create error element if it doesn't exist
    if (!errorEl) {
      errorEl = document.createElement('span');
      errorEl.id = errorId;
      errorEl.className = 'error-message';
      errorEl.setAttribute('role', 'alert');
      input.parentNode.appendChild(errorEl);
    }

    // Set error message and ARIA attributes
    errorEl.textContent = message;
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', errorId);
    input.classList.add('error');

    // Also announce to screen readers
    announce(message, 'assertive');
  }

  /**
   * Clear error message for an input field
   * @param {HTMLElement} input - Input element
   */
  function clearError(input) {
    if (!input || !input.id) return;

    const errorId = input.id + '-error';
    const errorEl = document.getElementById(errorId);

    if (errorEl) {
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }

    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
    input.classList.remove('error');
  }

  /**
   * Validate a required field
   * @param {HTMLElement} input - Input element
   * @param {string} customMessage - Optional custom error message
   * @returns {boolean} - True if valid
   */
  function validateRequired(input, customMessage) {
    const value = input.value ? input.value.trim() : '';

    if (!value) {
      const message = customMessage ||
                     input.dataset.errorEmpty ||
                     'This field is required';
      showError(input, message);
      return false;
    }

    clearError(input);
    return true;
  }

  /**
   * Validate field against a pattern
   * @param {HTMLElement} input - Input element
   * @param {string|RegExp} pattern - Pattern to test against
   * @param {string} errorMessage - Error message to display
   * @returns {boolean} - True if valid
   */
  function validatePattern(input, pattern, errorMessage) {
    const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
    const value = input.value ? input.value.trim() : '';

    if (value && !regex.test(value)) {
      showError(input, errorMessage);
      return false;
    }

    clearError(input);
    return true;
  }

  /**
   * Add skip link functionality
   * @param {string} targetId - ID of element to skip to
   * @param {string} linkText - Text for skip link (default: "Skip to main content")
   */
  function addSkipLink(targetId = 'main-content', linkText = 'Skip to main content') {
    // Check if skip link already exists
    if (document.querySelector('.skip-link')) return;

    const skipLink = document.createElement('a');
    skipLink.href = '#' + targetId;
    skipLink.className = 'skip-link';
    skipLink.textContent = linkText;

    // Add to beginning of body
    document.body.insertBefore(skipLink, document.body.firstChild);

    // Ensure target element exists and has tabindex for focus
    skipLink.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.getElementById(targetId);
      if (target) {
        target.setAttribute('tabindex', '-1');
        target.focus();
        // Scroll to target
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  /**
   * Announce when copy to clipboard succeeds
   * @param {string} itemName - Name of item copied (e.g., "IP address", "password")
   */
  function announceCopied(itemName = 'text') {
    announce(`${itemName} copied to clipboard`, 'polite');
  }

  /**
   * Set busy state on element during async operations
   * @param {HTMLElement} element - Element to mark as busy
   * @param {boolean} isBusy - True to set busy, false to clear
   */
  function setBusy(element, isBusy) {
    if (!element) return;

    if (isBusy) {
      element.setAttribute('aria-busy', 'true');
      element.classList.add('busy');
    } else {
      element.removeAttribute('aria-busy');
      element.classList.remove('busy');
    }
  }

  // Public API
  return {
    init,
    announce,
    showError,
    clearError,
    validateRequired,
    validatePattern,
    addSkipLink,
    announceCopied,
    setBusy
  };
})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', A11yUtils.init);
} else {
  A11yUtils.init();
}
