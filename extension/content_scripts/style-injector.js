/**
 * Style Injector for the Reading Style Adjuster extension
 * Applies styles to the page based on user settings
 */

// Get DOM analyzer functions
const { findTextElements, findMainContentElement, analyzeDom } = window.ReadingStyleAdjuster.DomAnalyzer;

// Style element ID
const STYLE_ELEMENT_ID = 'reading-style-adjuster-styles';

/**
 * Create or get the style element
 * @returns {HTMLStyleElement} - The style element
 */
function getStyleElement() {
  let styleElement = document.getElementById(STYLE_ELEMENT_ID);
  
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = STYLE_ELEMENT_ID;
    document.head.appendChild(styleElement);
  }
  
  return styleElement;
}

/**
 * Generate CSS for the given settings
 * @param {Object} settings - The settings to generate CSS for
 * @returns {string} - The generated CSS
 */
function generateCSS(settings) {
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
}

/**
 * Apply styles to the page
 * @param {Object} settings - The settings to apply
 */
function applyStyles(settings) {
  const styleElement = getStyleElement();
  const css = generateCSS(settings);
  styleElement.textContent = css;
}

/**
 * Remove styles from the page
 */
function removeStyles() {
  const styleElement = document.getElementById(STYLE_ELEMENT_ID);
  
  if (styleElement) {
    styleElement.textContent = '';
  }
}

/**
 * Initialize the style injector
 */
function initialize() {
  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'APPLY_STYLES') {
      applyStyles(message.settings);
      sendResponse({ success: true });
    } else if (message.type === 'REMOVE_STYLES') {
      removeStyles();
      sendResponse({ success: true });
    } else if (message.type === 'GET_PAGE_INFO') {
      const pageInfo = {
        url: window.location.href,
        domain: window.location.hostname,
        title: document.title,
        domAnalysis: analyzeDom()
      };
      sendResponse(pageInfo);
    }
    
    return true; // Keep the message channel open for async response
  });
  
  // Request current settings from the background script
  chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (response) => {
    if (response && response.settings) {
      applyStyles(response.settings);
    }
  });
  
  // Set up MutationObserver to handle dynamic content
  setupMutationObserver();
}

/**
 * Set up a MutationObserver to handle dynamic content
 */
function setupMutationObserver() {
  // Create a MutationObserver to watch for changes to the DOM
  const observer = new MutationObserver((mutations) => {
    let shouldReapplyStyles = false;
    
    // Check if any mutations added new text elements
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // If a significant element was added, reapply styles
            if (node.tagName === 'P' || 
                node.tagName === 'ARTICLE' || 
                node.tagName === 'SECTION' || 
                node.tagName === 'DIV') {
              shouldReapplyStyles = true;
              break;
            }
          }
        }
      }
      
      if (shouldReapplyStyles) {
        break;
      }
    }
    
    if (shouldReapplyStyles) {
      // Request current settings again and reapply
      chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (response) => {
        if (response && response.settings) {
          applyStyles(response.settings);
        }
      });
    }
  });
  
  // Start observing the document with the configured parameters
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Initialize when the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
