/**
 * Haptic feedback utility using the Web Vibration API.
 * Patterns are designed to be subtle and professional.
 */

const haptics = {
    /**
     * Subtle tap feedback (15ms)
     */
    light: () => {
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(15);
        }
    },

    /**
     * Medium feedback for primary actions (30ms)
     */
    medium: () => {
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(30);
        }
    },

    /**
     * Success feedback pattern
     */
    success: () => {
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(35);
        }
    },

    /**
     * Error feedback pattern (Double pulse)
     */
    error: () => {
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate([50, 30, 50]);
        }
    },

    /**
     * Heavy feedback for security alerts (70ms)
     */
    heavy: () => {
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(70);
        }
    }
};

export default haptics;
