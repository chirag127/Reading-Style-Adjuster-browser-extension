/**
 * Storage utility for the Reading Style Adjuster extension
 * Provides a wrapper around chrome.storage.local API
 */

import { DEFAULT_PROFILES, DEFAULT_PROFILE, STORAGE_KEYS } from './constants.js';

/**
 * Get a value from storage
 * @param {string} key - The key to get
 * @param {any} defaultValue - The default value if the key doesn't exist
 * @returns {Promise<any>} - The value from storage or the default value
 */
export const getValue = async (key, defaultValue) => {
  try {
    const result = await chrome.storage.local.get(key);
    return result[key] !== undefined ? result[key] : defaultValue;
  } catch (error) {
    console.error(`Error getting ${key} from storage:`, error);
    return defaultValue;
  }
};

/**
 * Set a value in storage
 * @param {string} key - The key to set
 * @param {any} value - The value to set
 * @returns {Promise<void>}
 */
export const setValue = async (key, value) => {
  try {
    await chrome.storage.local.set({ [key]: value });
  } catch (error) {
    console.error(`Error setting ${key} in storage:`, error);
  }
};

/**
 * Get all profiles from storage
 * @returns {Promise<Array>} - Array of profiles
 */
export const getProfiles = async () => {
  return await getValue(STORAGE_KEYS.PROFILES, DEFAULT_PROFILES);
};

/**
 * Save profiles to storage
 * @param {Array} profiles - Array of profiles to save
 * @returns {Promise<void>}
 */
export const saveProfiles = async (profiles) => {
  await setValue(STORAGE_KEYS.PROFILES, profiles);
};

/**
 * Get the active profile from storage
 * @returns {Promise<Object>} - The active profile
 */
export const getActiveProfile = async () => {
  return await getValue(STORAGE_KEYS.ACTIVE_PROFILE, DEFAULT_PROFILE);
};

/**
 * Set the active profile in storage
 * @param {Object} profile - The profile to set as active
 * @returns {Promise<void>}
 */
export const setActiveProfile = async (profile) => {
  await setValue(STORAGE_KEYS.ACTIVE_PROFILE, profile);
};

/**
 * Get site exceptions from storage
 * @returns {Promise<Array>} - Array of site exceptions
 */
export const getSiteExceptions = async () => {
  return await getValue(STORAGE_KEYS.SITE_EXCEPTIONS, []);
};

/**
 * Save site exceptions to storage
 * @param {Array} exceptions - Array of site exceptions to save
 * @returns {Promise<void>}
 */
export const saveSiteExceptions = async (exceptions) => {
  await setValue(STORAGE_KEYS.SITE_EXCEPTIONS, exceptions);
};

/**
 * Get site-specific profiles from storage
 * @returns {Promise<Object>} - Object mapping site domains to profile names
 */
export const getSiteProfiles = async () => {
  return await getValue(STORAGE_KEYS.SITE_PROFILES, {});
};

/**
 * Save site-specific profiles to storage
 * @param {Object} siteProfiles - Object mapping site domains to profile names
 * @returns {Promise<void>}
 */
export const saveSiteProfiles = async (siteProfiles) => {
  await setValue(STORAGE_KEYS.SITE_PROFILES, siteProfiles);
};

/**
 * Check if a site is in the exceptions list
 * @param {string} domain - The domain to check
 * @returns {Promise<boolean>} - True if the site is in the exceptions list
 */
export const isSiteExcepted = async (domain) => {
  const exceptions = await getSiteExceptions();
  return exceptions.includes(domain);
};

/**
 * Get the profile for a specific site
 * @param {string} domain - The domain to get the profile for
 * @returns {Promise<Object|null>} - The profile for the site or null if not found
 */
export const getSiteProfile = async (domain) => {
  const siteProfiles = await getSiteProfiles();
  const profileName = siteProfiles[domain];
  
  if (!profileName) {
    return null;
  }
  
  const profiles = await getProfiles();
  return profiles.find(profile => profile.name === profileName) || null;
};

/**
 * Export all settings to a JSON string
 * @returns {Promise<string>} - JSON string of all settings
 */
export const exportSettings = async () => {
  const profiles = await getProfiles();
  const activeProfile = await getActiveProfile();
  const siteExceptions = await getSiteExceptions();
  const siteProfiles = await getSiteProfiles();
  
  const settings = {
    profiles,
    activeProfile,
    siteExceptions,
    siteProfiles
  };
  
  return JSON.stringify(settings, null, 2);
};

/**
 * Import settings from a JSON string
 * @param {string} jsonString - JSON string of settings to import
 * @returns {Promise<boolean>} - True if import was successful
 */
export const importSettings = async (jsonString) => {
  try {
    const settings = JSON.parse(jsonString);
    
    if (settings.profiles) {
      await saveProfiles(settings.profiles);
    }
    
    if (settings.activeProfile) {
      await setActiveProfile(settings.activeProfile);
    }
    
    if (settings.siteExceptions) {
      await saveSiteExceptions(settings.siteExceptions);
    }
    
    if (settings.siteProfiles) {
      await saveSiteProfiles(settings.siteProfiles);
    }
    
    return true;
  } catch (error) {
    console.error('Error importing settings:', error);
    return false;
  }
};

/**
 * Reset all settings to defaults
 * @returns {Promise<void>}
 */
export const resetAllSettings = async () => {
  await saveProfiles(DEFAULT_PROFILES);
  await setActiveProfile(DEFAULT_PROFILE);
  await saveSiteExceptions([]);
  await saveSiteProfiles({});
};
