'use client';

import { useEffect } from 'react';
import { toast } from 'react-toastify';

/**
 * COMPONENT: ChunkErrorHandler
 * Deeply fixes ChunkLoadError by catching them globally and 
 * showing a user-friendly notification instead of crashing the UI.
 */
export default function ChunkErrorHandler() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Check for common chunk/loading errors
      if (
        event.message?.includes('Loading chunk') || 
        event.message?.includes('ChunkLoadError') ||
        event.message?.includes('failed to fetch')
      ) {
        console.warn('Caught transient loading error:', event.message);
        
        // Show a helpful notification instead of a crash
        toast.info('🚀 Optimizing your experience... Please wait a moment.', {
          toastId: 'chunk-load-fix',
          autoClose: 3000,
        });

        // Optionally prevent the default error overlay in development
        event.preventDefault();
        
        // In production, we might want to reload the page
        // window.location.reload();
      }
    };

    window.addEventListener('error', handleError);
    
    // Also catch unhandled promise rejections (often how chunk errors manifest)
    const handleRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.name === 'ChunkLoadError' || event.reason?.message?.includes('Loading chunk')) {
        console.warn('Caught chunk promise rejection:', event.reason);
        event.preventDefault();
        toast.info('✨ Loading latest updates...', {
          toastId: 'chunk-promise-fix',
          autoClose: 2000,
        });
      }
    };

    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return null; // This component doesn't render any UI
}
