/**
 * DOM Analyzer for the Reading Style Adjuster extension
 * Identifies text elements on the page that should be styled
 */

// Text content selectors (elements that likely contain readable text)
const TEXT_CONTENT_SELECTORS = [
  'p', 'article', 'section', 'div > p', 'main', '.content', '.article', 
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'span', 'blockquote'
];

// Elements to exclude (UI elements, code blocks, etc.)
const EXCLUDE_SELECTORS = [
  'button', 'input', 'select', 'textarea', 'code', 'pre', 
  '.code', '.pre', 'nav', 'header', 'footer', '.navigation'
];

/**
 * Find all text elements on the page
 * @returns {Array<Element>} - Array of text elements
 */
function findTextElements() {
  // Get all potential text elements
  const allTextElements = [];
  
  TEXT_CONTENT_SELECTORS.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      allTextElements.push(element);
    });
  });
  
  // Filter out excluded elements
  const excludeSelector = EXCLUDE_SELECTORS.join(', ');
  const excludedElements = document.querySelectorAll(excludeSelector);
  const excludedSet = new Set(excludedElements);
  
  // Return elements that are not in the excluded set
  return allTextElements.filter(element => !excludedSet.has(element));
}

/**
 * Check if an element is likely to be a main content element
 * @param {Element} element - The element to check
 * @returns {boolean} - True if the element is likely a main content element
 */
function isMainContentElement(element) {
  // Check if the element has a significant amount of text
  const text = element.textContent.trim();
  if (text.length < 100) {
    return false;
  }
  
  // Check if the element is visible
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden') {
    return false;
  }
  
  // Check if the element is in the viewport
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    return false;
  }
  
  // Check if the element has a reasonable size
  if (rect.width < 200 || rect.height < 100) {
    return false;
  }
  
  return true;
}

/**
 * Find the main content element on the page
 * @returns {Element|null} - The main content element or null if not found
 */
function findMainContentElement() {
  // Check for common main content selectors
  const mainSelectors = [
    'main',
    'article',
    '.content',
    '.article',
    '#content',
    '#main',
    '.main',
    '.post',
    '.post-content',
    '.entry-content'
  ];
  
  for (const selector of mainSelectors) {
    const element = document.querySelector(selector);
    if (element && isMainContentElement(element)) {
      return element;
    }
  }
  
  // If no common selector found, look for elements with a lot of text
  const textElements = findTextElements();
  const contentElements = textElements.filter(isMainContentElement);
  
  if (contentElements.length > 0) {
    // Return the element with the most text
    return contentElements.reduce((max, current) => {
      return current.textContent.length > max.textContent.length ? current : max;
    }, contentElements[0]);
  }
  
  return null;
}

/**
 * Analyze the DOM and return information about the page
 * @returns {Object} - Information about the page
 */
function analyzeDom() {
  const textElements = findTextElements();
  const mainContentElement = findMainContentElement();
  
  return {
    textElements,
    mainContentElement,
    hasMainContent: !!mainContentElement,
    textElementCount: textElements.length
  };
}

// Export functions for use in other scripts
window.ReadingStyleAdjuster = window.ReadingStyleAdjuster || {};
window.ReadingStyleAdjuster.DomAnalyzer = {
  findTextElements,
  findMainContentElement,
  analyzeDom,
  isMainContentElement
};
