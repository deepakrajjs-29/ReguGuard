/**
 * ReguGuard AI - Toast Notification System
 * Provides non-intrusive alerts for user feedback.
 */

const Toast = (() => {
  let container = null;

  function _getContainer() {
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  /**
   * Show a toast notification
   * @param {string} message - Message to display
   * @param {string} type - 'success' | 'error' | 'warning' | 'info'
   * @param {number} duration - Auto-dismiss time in ms (default 4000)
   */
  function show(message, type = 'info', duration = 4000) {
    const c = _getContainer();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span style="flex:1">${message}</span>
      <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
    `;

    c.appendChild(toast);

    // Auto-remove
    if (duration > 0) {
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, duration);
    }

    return toast;
  }

  return { show };
})();
