/**
 * Background Service Worker for the Reading Style Adjuster extension
 * Handles events, storage management, and message routing
 */

import * as Storage from '../common/storage.js';
import { extractDomain } from '../common/utils.js';

/**
 * Initialize the extension
 */
async function initialize() {
  // Set up initial storage if needed
  const profiles = await Storage.getProfiles();
  
  if (!profiles || profiles.length === 0) {
    await Storage.resetAllSettings();
  }
  
  // Set up listeners
  setupMessageListeners();
  setupTabListeners();
}

/**
 * Set up message listeners
 */
function setupMessageListeners() {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Handle different message types
    switch (message.type) {
      case 'GET_SETTINGS':
        handleGetSettings(sender.tab?.url).then(sendResponse);
        break;
        
      case 'SET_SETTINGS':
        handleSetSettings(message.settings).then(sendResponse);
        break;
        
      case 'GET_PROFILES':
        handleGetProfiles().then(sendResponse);
        break;
        
      case 'SET_ACTIVE_PROFILE':
        handleSetActiveProfile(message.profile).then(sendResponse);
        break;
        
      case 'SAVE_PROFILE':
        handleSaveProfile(message.profile).then(sendResponse);
        break;
        
      case 'DELETE_PROFILE':
        handleDeleteProfile(message.profileName).then(sendResponse);
        break;
        
      case 'GET_SITE_EXCEPTIONS':
        handleGetSiteExceptions().then(sendResponse);
        break;
        
      case 'ADD_SITE_EXCEPTION':
        handleAddSiteException(message.domain).then(sendResponse);
        break;
        
      case 'REMOVE_SITE_EXCEPTION':
        handleRemoveSiteException(message.domain).then(sendResponse);
        break;
        
      case 'GET_SITE_PROFILES':
        handleGetSiteProfiles().then(sendResponse);
        break;
        
      case 'SET_SITE_PROFILE':
        handleSetSiteProfile(message.domain, message.profileName).then(sendResponse);
        break;
        
      case 'REMOVE_SITE_PROFILE':
        handleRemoveSiteProfile(message.domain).then(sendResponse);
        break;
        
      case 'EXPORT_SETTINGS':
        handleExportSettings().then(sendResponse);
        break;
        
      case 'IMPORT_SETTINGS':
        handleImportSettings(message.settingsJson).then(sendResponse);
        break;
        
      case 'RESET_ALL_SETTINGS':
        handleResetAllSettings().then(sendResponse);
        break;
        
      default:
        sendResponse({ error: 'Unknown message type' });
    }
    
    // Return true to indicate we will send a response asynchronously
    return true;
  });
}

/**
 * Set up tab listeners
 */
function setupTabListeners() {
  // Apply styles when a tab is updated
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // Only apply styles when the tab has completed loading
    if (changeInfo.status === 'complete' && tab.url) {
      const settings = await getSettingsForUrl(tab.url);
      
      if (settings && settings.enabled) {
        // Apply styles to the tab
        try {
          await chrome.tabs.sendMessage(tabId, {
            type: 'APPLY_STYLES',
            settings
          });
        } catch (error) {
          // Content script might not be loaded yet, which is fine
          console.log('Could not send message to tab, content script might not be loaded yet');
        }
      }
    }
  });
}

/**
 * Get settings for a specific URL
 * @param {string} url - The URL to get settings for
 * @returns {Promise<Object|null>} - The settings for the URL or null if the site is excepted
 */
async function getSettingsForUrl(url) {
  if (!url) {
    return null;
  }
  
  const domain = extractDomain(url);
  
  // Check if the site is in the exceptions list
  const isExcepted = await Storage.isSiteExcepted(domain);
  
  if (isExcepted) {
    return null;
  }
  
  // Check if the site has a specific profile
  const siteProfile = await Storage.getSiteProfile(domain);
  
  if (siteProfile) {
    return siteProfile.settings;
  }
  
  // Otherwise, use the active profile
  const activeProfile = await Storage.getActiveProfile();
  return activeProfile.settings;
}

/**
 * Handle GET_SETTINGS message
 * @param {string} url - The URL to get settings for
 * @returns {Promise<Object>} - Response with settings
 */
async function handleGetSettings(url) {
  const settings = await getSettingsForUrl(url);
  return { settings };
}

/**
 * Handle SET_SETTINGS message
 * @param {Object} settings - The settings to save
 * @returns {Promise<Object>} - Response indicating success
 */
async function handleSetSettings(settings) {
  const activeProfile = await Storage.getActiveProfile();
  activeProfile.settings = settings;
  await Storage.setActiveProfile(activeProfile);
  
  // Update the profile in the profiles list
  const profiles = await Storage.getProfiles();
  const profileIndex = profiles.findIndex(p => p.name === activeProfile.name);
  
  if (profileIndex !== -1) {
    profiles[profileIndex] = activeProfile;
    await Storage.saveProfiles(profiles);
  }
  
  return { success: true };
}

/**
 * Handle GET_PROFILES message
 * @returns {Promise<Object>} - Response with profiles
 */
async function handleGetProfiles() {
  const profiles = await Storage.getProfiles();
  return { profiles };
}

/**
 * Handle SET_ACTIVE_PROFILE message
 * @param {Object} profile - The profile to set as active
 * @returns {Promise<Object>} - Response indicating success
 */
async function handleSetActiveProfile(profile) {
  await Storage.setActiveProfile(profile);
  return { success: true };
}

/**
 * Handle SAVE_PROFILE message
 * @param {Object} profile - The profile to save
 * @returns {Promise<Object>} - Response indicating success
 */
async function handleSaveProfile(profile) {
  const profiles = await Storage.getProfiles();
  const profileIndex = profiles.findIndex(p => p.name === profile.name);
  
  if (profileIndex !== -1) {
    // Update existing profile
    profiles[profileIndex] = profile;
  } else {
    // Add new profile
    profiles.push(profile);
  }
  
  await Storage.saveProfiles(profiles);
  return { success: true };
}

/**
 * Handle DELETE_PROFILE message
 * @param {string} profileName - The name of the profile to delete
 * @returns {Promise<Object>} - Response indicating success
 */
async function handleDeleteProfile(profileName) {
  const profiles = await Storage.getProfiles();
  const activeProfile = await Storage.getActiveProfile();
  
  // Don't allow deleting the active profile
  if (activeProfile.name === profileName) {
    return { success: false, error: 'Cannot delete the active profile' };
  }
  
  // Don't allow deleting the default profile
  if (profileName === 'Default') {
    return { success: false, error: 'Cannot delete the default profile' };
  }
  
  const filteredProfiles = profiles.filter(p => p.name !== profileName);
  
  if (filteredProfiles.length === profiles.length) {
    return { success: false, error: 'Profile not found' };
  }
  
  await Storage.saveProfiles(filteredProfiles);
  
  // Update site profiles to remove references to the deleted profile
  const siteProfiles = await Storage.getSiteProfiles();
  let siteProfilesUpdated = false;
  
  for (const domain in siteProfiles) {
    if (siteProfiles[domain] === profileName) {
      delete siteProfiles[domain];
      siteProfilesUpdated = true;
    }
  }
  
  if (siteProfilesUpdated) {
    await Storage.saveSiteProfiles(siteProfiles);
  }
  
  return { success: true };
}

/**
 * Handle GET_SITE_EXCEPTIONS message
 * @returns {Promise<Object>} - Response with site exceptions
 */
async function handleGetSiteExceptions() {
  const exceptions = await Storage.getSiteExceptions();
  return { exceptions };
}

/**
 * Handle ADD_SITE_EXCEPTION message
 * @param {string} domain - The domain to add to exceptions
 * @returns {Promise<Object>} - Response indicating success
 */
async function handleAddSiteException(domain) {
  const exceptions = await Storage.getSiteExceptions();
  
  if (!exceptions.includes(domain)) {
    exceptions.push(domain);
    await Storage.saveSiteExceptions(exceptions);
  }
  
  return { success: true };
}

/**
 * Handle REMOVE_SITE_EXCEPTION message
 * @param {string} domain - The domain to remove from exceptions
 * @returns {Promise<Object>} - Response indicating success
 */
async function handleRemoveSiteException(domain) {
  const exceptions = await Storage.getSiteExceptions();
  const filteredExceptions = exceptions.filter(d => d !== domain);
  
  if (filteredExceptions.length !== exceptions.length) {
    await Storage.saveSiteExceptions(filteredExceptions);
  }
  
  return { success: true };
}

/**
 * Handle GET_SITE_PROFILES message
 * @returns {Promise<Object>} - Response with site profiles
 */
async function handleGetSiteProfiles() {
  const siteProfiles = await Storage.getSiteProfiles();
  return { siteProfiles };
}

/**
 * Handle SET_SITE_PROFILE message
 * @param {string} domain - The domain to set a profile for
 * @param {string} profileName - The name of the profile to set
 * @returns {Promise<Object>} - Response indicating success
 */
async function handleSetSiteProfile(domain, profileName) {
  const siteProfiles = await Storage.getSiteProfiles();
  siteProfiles[domain] = profileName;
  await Storage.saveSiteProfiles(siteProfiles);
  return { success: true };
}

/**
 * Handle REMOVE_SITE_PROFILE message
 * @param {string} domain - The domain to remove a profile for
 * @returns {Promise<Object>} - Response indicating success
 */
async function handleRemoveSiteProfile(domain) {
  const siteProfiles = await Storage.getSiteProfiles();
  
  if (domain in siteProfiles) {
    delete siteProfiles[domain];
    await Storage.saveSiteProfiles(siteProfiles);
  }
  
  return { success: true };
}

/**
 * Handle EXPORT_SETTINGS message
 * @returns {Promise<Object>} - Response with settings JSON
 */
async function handleExportSettings() {
  const settingsJson = await Storage.exportSettings();
  return { settingsJson };
}

/**
 * Handle IMPORT_SETTINGS message
 * @param {string} settingsJson - The settings JSON to import
 * @returns {Promise<Object>} - Response indicating success
 */
async function handleImportSettings(settingsJson) {
  const success = await Storage.importSettings(settingsJson);
  return { success };
}

/**
 * Handle RESET_ALL_SETTINGS message
 * @returns {Promise<Object>} - Response indicating success
 */
async function handleResetAllSettings() {
  await Storage.resetAllSettings();
  return { success: true };
}

// Initialize the extension when the service worker starts
initialize();
