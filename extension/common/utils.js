/**
 * Utility functions for the Reading Style Adjuster extension
 */

/**
 * Extract the domain from a URL
 * @param {string} url - The URL to extract the domain from
 * @returns {string} - The domain
 */
export const extractDomain = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    console.error('Error extracting domain:', error);
    return '';
  }
};

/**
 * Generate a unique ID
 * @returns {string} - A unique ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

/**
 * Deep clone an object
 * @param {Object} obj - The object to clone
 * @returns {Object} - A deep clone of the object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if a font is installed on the user's system
 * @param {string} fontName - The name of the font to check
 * @returns {boolean} - True if the font is installed
 */
export const isFontInstalled = (fontName) => {
  // Create a span with the font
  const span = document.createElement('span');
  span.style.fontFamily = `'${fontName}', monospace`;
  span.style.fontSize = '72px';
  span.textContent = 'mmmmmmmmmmlli';
  document.body.appendChild(span);
  
  // Measure the width
  const width = span.offsetWidth;
  
  // Change to a fallback font
  span.style.fontFamily = 'monospace';
  
  // Compare the width
  const isFontAvailable = width !== span.offsetWidth;
  
  // Clean up
  document.body.removeChild(span);
  
  return isFontAvailable;
};

/**
 * Generate CSS for the current settings
 * @param {Object} settings - The settings to generate CSS for
 * @returns {string} - The generated CSS
 */
export const generateCSS = (settings) => {
  if (!settings || !settings.enabled) {
    return '';
  }
  
  const { fontSize, fontFamily, lineHeight, wordSpacing, textAlignment } = settings;
  
  return `
    p, article, section, div > p, main, .content, .article, 
    h1, h2, h3, h4, h5, h6, li, span, blockquote {
      font-size: ${fontSize}px !important;
      font-family: "${fontFamily}", sans-serif !important;
      line-height: ${lineHeight} !important;
      word-spacing: ${wordSpacing}em !important;
      text-align: ${textAlignment} !important;
    }
  `;
};

/**
 * Debounce a function
 * @param {Function} func - The function to debounce
 * @param {number} wait - The debounce wait time in milliseconds
 * @returns {Function} - The debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Send a message to the background script
 * @param {Object} message - The message to send
 * @returns {Promise<any>} - The response from the background script
 */
export const sendMessage = async (message) => {
  try {
    return await chrome.runtime.sendMessage(message);
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
};

/**
 * Get the current tab
 * @returns {Promise<chrome.tabs.Tab|null>} - The current tab or null if not found
 */
export const getCurrentTab = async () => {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    return tabs[0] || null;
  } catch (error) {
    console.error('Error getting current tab:', error);
    return null;
  }
};

/**
 * Apply styles to the current tab
 * @param {Object} settings - The settings to apply
 * @returns {Promise<boolean>} - True if styles were applied successfully
 */
export const applyStylesToCurrentTab = async (settings) => {
  try {
    const tab = await getCurrentTab();
    
    if (!tab || !tab.id) {
      return false;
    }
    
    const css = generateCSS(settings);
    
    if (!css) {
      return false;
    }
    
    await chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      css
    });
    
    return true;
  } catch (error) {
    console.error('Error applying styles to current tab:', error);
    return false;
  }
};
