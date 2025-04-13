/**
 * Constants for the Reading Style Adjuster extension
 */

// Web-safe fonts
export const WEB_SAFE_FONTS = [
  'Arial',
  'Verdana',
  'Helvetica',
  'Tahoma',
  'Trebuchet MS',
  'Times New Roman',
  'Georgia',
  'Garamond',
  'Courier New',
  'Brush Script MT'
];

// Dyslexia-friendly fonts
export const DYSLEXIA_FRIENDLY_FONTS = [
  'OpenDyslexic',
  'Lexend',
  'Comic Sans MS',
  'Dyslexie',
  'Sylexiad',
  'Read Regular',
  'Tiresias'
];

// All available fonts (combined)
export const ALL_FONTS = [...WEB_SAFE_FONTS, ...DYSLEXIA_FRIENDLY_FONTS];

// Text alignment options
export const TEXT_ALIGNMENTS = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'center', label: 'Center' },
  { value: 'justify', label: 'Justify' }
];

// Default settings
export const DEFAULT_SETTINGS = {
  enabled: true,
  fontSize: 18,
  fontFamily: 'Arial',
  lineHeight: 1.5,
  wordSpacing: 0.1,
  textAlignment: 'left'
};

// Default profile
export const DEFAULT_PROFILE = {
  name: 'Default',
  settings: DEFAULT_SETTINGS
};

// Dyslexia-friendly profile
export const DYSLEXIA_PROFILE = {
  name: 'Dyslexia Assist',
  settings: {
    enabled: true,
    fontSize: 20,
    fontFamily: 'OpenDyslexic',
    lineHeight: 1.8,
    wordSpacing: 0.2,
    textAlignment: 'left'
  }
};

// Night reading profile
export const NIGHT_PROFILE = {
  name: 'Night Reading',
  settings: {
    enabled: true,
    fontSize: 18,
    fontFamily: 'Georgia',
    lineHeight: 1.6,
    wordSpacing: 0.15,
    textAlignment: 'left'
  }
};

// Default profiles
export const DEFAULT_PROFILES = [
  DEFAULT_PROFILE,
  DYSLEXIA_PROFILE,
  NIGHT_PROFILE
];

// CSS selectors for text content
export const TEXT_CONTENT_SELECTORS = [
  'p', 'article', 'section', 'div > p', 'main', '.content', '.article', 
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'span', 'blockquote'
];

// CSS selectors to exclude
export const EXCLUDE_SELECTORS = [
  'button', 'input', 'select', 'textarea', 'code', 'pre', 
  '.code', '.pre', 'nav', 'header', 'footer', '.navigation'
];

// Storage keys
export const STORAGE_KEYS = {
  ACTIVE_PROFILE: 'activeProfile',
  PROFILES: 'profiles',
  SITE_EXCEPTIONS: 'siteExceptions',
  SITE_PROFILES: 'siteProfiles',
  SETTINGS: 'settings'
};
