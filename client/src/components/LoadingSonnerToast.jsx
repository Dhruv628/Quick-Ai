import { toast } from 'sonner';

/**
 * A utility function that wraps an async action with sonner toast notifications
 * @param {Object} params - Configuration object
 * @param {Function} params.action - The async function to execute
 * @param {string} params.loadingText - Text to show during loading
 * @param {string} params.successText - Text to show on success
 * @param {string} params.errorText - Text to show on error
 * @returns {Promise} - The result of the action function
 */
export default async function LoadingSonnerToast({
  action,
  loadingText = 'Loading...', 
  successText = 'Success!', 
  errorText = 'Error!'
}) {
  if (!action || typeof action !== 'function') {
    throw new Error('LoadingSonnerToast requires an action function');
  }

  return toast.promise(action(), {
    loading: loadingText,
    success: (data) => {
      return successText;
    },
    error: (error) => {
      console.error('LoadingSonnerToast error:', error);
      return errorText;
    },
  });
}