/**
 * Utility functions for device detection and mobile optimizations
 */

/**
 * Detects if the current device is a mobile device based on user agent and screen size
 */
export const isMobileDevice = (): boolean => {
  // Check user agent for mobile indicators
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  const isMobileUserAgent = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  
  // Check screen size - consider devices with width <= 768px as mobile
  const isMobileScreen = window.innerWidth <= 768;
  
  // Check for touch support
  const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  return isMobileUserAgent || (isMobileScreen && hasTouchSupport);
};

/**
 * Detects if the current device supports touch input
 */
export const isTouchDevice = (): boolean => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Gets optimized swipe threshold based on device type
 */
export const getSwipeThreshold = (): number => {
  return isMobileDevice() ? 50 : 100; // Lower threshold for mobile for faster response
};

/**
 * Gets optimized swipe velocity threshold based on device type
 */
export const getSwipeVelocity = (): number => {
  return isMobileDevice() ? 0.3 : 0.5; // Lower velocity threshold for mobile
};