// Global error handler for async message channel errors
// This prevents browser extension errors from breaking the app

(function() {
  'use strict';
  
  // Suppress the specific async message channel error
  const originalError = console.error;
  console.error = function(...args) {
    const errorMessage = args[0]?.toString() || '';
    
    // Filter out known browser extension errors
    if (
      errorMessage.includes('message channel closed') ||
      errorMessage.includes('listener indicated an asynchronous response') ||
      errorMessage.includes('Extension context invalidated')
    ) {
      // Log to console.warn instead for debugging
      console.warn('[Suppressed Extension Error]:', ...args);
      return;
    }
    
    // Pass through all other errors
    originalError.apply(console, args);
  };

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', function(event) {
    const reason = event.reason?.message || event.reason;
    
    if (
      reason?.includes('message channel closed') ||
      reason?.includes('listener indicated an asynchronous response')
    ) {
      event.preventDefault();
      console.warn('[Suppressed Promise Rejection]:', reason);
    }
  });

  // Handle general errors
  window.addEventListener('error', function(event) {
    const message = event.message || '';
    
    if (
      message.includes('message channel closed') ||
      message.includes('listener indicated an asynchronous response')
    ) {
      event.preventDefault();
      console.warn('[Suppressed Error Event]:', message);
    }
  });
})();
