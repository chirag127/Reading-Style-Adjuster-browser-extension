/**
 * Popup script for the Reading Style Adjuster extension
 */

import { ALL_FONTS, TEXT_ALIGNMENTS, DEFAULT_SETTINGS } from '../common/constants.js';
import * as Storage from '../common/storage.js';
import { extractDomain, applyStylesToCurrentTab } from '../common/utils.js';

// DOM Elements
const enableToggle = document.getElementById('enable-toggle');
const profileSelect = document.getElementById('profile-select');
const saveProfileBtn = document.getElementById('save-profile-btn');
const newProfileBtn = document.getElementById('new-profile-btn');
const deleteProfileBtn = document.getElementById('delete-profile-btn');
const fontSizeInput = document.getElementById('font-size');
const fontSizeValue = document.getElementById('font-size-value');
const fontFamilySelect = document.getElementById('font-family');
const lineHeightInput = document.getElementById('line-height');
const lineHeightValue = document.getElementById('line-height-value');
const wordSpacingInput = document.getElementById('word-spacing');
const wordSpacingValue = document.getElementById('word-spacing-value');
const textAlignmentSelect = document.getElementById('text-alignment');
const previewText = document.getElementById('preview-text');
const currentSiteSpan = document.getElementById('current-site');
const siteExceptionBtn = document.getElementById('site-exception-btn');
const siteProfileBtn = document.getElementById('site-profile-btn');
const optionsBtn = document.getElementById('options-btn');
const resetBtn = document.getElementById('reset-btn');

// Dialog Elements
const newProfileDialog = document.getElementById('new-profile-dialog');
const newProfileNameInput = document.getElementById('new-profile-name');
const newProfileCancelBtn = document.getElementById('new-profile-cancel');
const newProfileSaveBtn = document.getElementById('new-profile-save');
const siteProfileDialog = document.getElementById('site-profile-dialog');
const siteProfileDomainP = document.getElementById('site-profile-domain');
const siteProfileSelect = document.getElementById('site-profile-select');
const siteProfileRemoveBtn = document.getElementById('site-profile-remove');
const siteProfileCancelBtn = document.getElementById('site-profile-cancel');
const siteProfileSaveBtn = document.getElementById('site-profile-save');

// State
let currentSettings = { ...DEFAULT_SETTINGS };
let currentProfiles = [];
let activeProfile = null;
let currentDomain = '';
let siteExceptions = [];
let siteProfiles = {};
let isInitialized = false;

/**
 * Initialize the popup
 */
async function initialize() {
  // Populate font family select
  populateFontFamilySelect();
  
  // Get current tab information
  const tab = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab[0]?.url || '';
  currentDomain = extractDomain(url);
  currentSiteSpan.textContent = `Current site: ${currentDomain}`;
  
  // Load profiles and settings
  await loadProfiles();
  await loadSiteExceptions();
  await loadSiteProfiles();
  
  // Determine which settings to use for the current site
  await loadSettingsForCurrentSite();
  
  // Update UI with current settings
  updateUI();
  
  // Set up event listeners
  setupEventListeners();
  
  // Update preview
  updatePreview();
  
  isInitialized = true;
}

/**
 * Populate the font family select with available fonts
 */
function populateFontFamilySelect() {
  fontFamilySelect.innerHTML = '';
  
  ALL_FONTS.forEach(font => {
    const option = document.createElement('option');
    option.value = font;
    option.textContent = font;
    option.style.fontFamily = font;
    fontFamilySelect.appendChild(option);
  });
}

/**
 * Load profiles from storage
 */
async function loadProfiles() {
  currentProfiles = await Storage.getProfiles();
  activeProfile = await Storage.getActiveProfile();
  
  // Populate profile select
  profileSelect.innerHTML = '';
  
  currentProfiles.forEach(profile => {
    const option = document.createElement('option');
    option.value = profile.name;
    option.textContent = profile.name;
    profileSelect.appendChild(option);
  });
  
  // Set the active profile
  profileSelect.value = activeProfile.name;
}

/**
 * Load site exceptions from storage
 */
async function loadSiteExceptions() {
  siteExceptions = await Storage.getSiteExceptions();
  
  // Update site exception button text
  if (siteExceptions.includes(currentDomain)) {
    siteExceptionBtn.textContent = 'Enable for this site';
  } else {
    siteExceptionBtn.textContent = 'Disable for this site';
  }
}

/**
 * Load site profiles from storage
 */
async function loadSiteProfiles() {
  siteProfiles = await Storage.getSiteProfiles();
}

/**
 * Load settings for the current site
 */
async function loadSettingsForCurrentSite() {
  // Check if the site is excepted
  if (siteExceptions.includes(currentDomain)) {
    enableToggle.checked = false;
    currentSettings = { ...activeProfile.settings, enabled: false };
    return;
  }
  
  // Check if the site has a specific profile
  const profileName = siteProfiles[currentDomain];
  
  if (profileName) {
    const profile = currentProfiles.find(p => p.name === profileName);
    
    if (profile) {
      currentSettings = { ...profile.settings };
      profileSelect.value = profile.name;
      return;
    }
  }
  
  // Otherwise, use the active profile settings
  currentSettings = { ...activeProfile.settings };
}

/**
 * Update the UI with current settings
 */
function updateUI() {
  // Update toggle
  enableToggle.checked = currentSettings.enabled;
  
  // Update sliders and values
  fontSizeInput.value = currentSettings.fontSize;
  fontSizeValue.textContent = `${currentSettings.fontSize}px`;
  
  fontFamilySelect.value = currentSettings.fontFamily;
  
  lineHeightInput.value = currentSettings.lineHeight;
  lineHeightValue.textContent = currentSettings.lineHeight;
  
  wordSpacingInput.value = currentSettings.wordSpacing;
  wordSpacingValue.textContent = `${currentSettings.wordSpacing}em`;
  
  textAlignmentSelect.value = currentSettings.textAlignment;
}

/**
 * Update the preview with current settings
 */
function updatePreview() {
  previewText.style.fontSize = `${currentSettings.fontSize}px`;
  previewText.style.fontFamily = `"${currentSettings.fontFamily}", sans-serif`;
  previewText.style.lineHeight = currentSettings.lineHeight;
  previewText.style.wordSpacing = `${currentSettings.wordSpacing}em`;
  previewText.style.textAlign = currentSettings.textAlignment;
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Enable toggle
  enableToggle.addEventListener('change', async () => {
    currentSettings.enabled = enableToggle.checked;
    await saveSettings();
    updatePreview();
  });
  
  // Profile select
  profileSelect.addEventListener('change', async () => {
    const profileName = profileSelect.value;
    const profile = currentProfiles.find(p => p.name === profileName);
    
    if (profile) {
      currentSettings = { ...profile.settings };
      activeProfile = profile;
      await Storage.setActiveProfile(profile);
      updateUI();
      updatePreview();
      await applyStylesToCurrentTab(currentSettings);
    }
  });
  
  // Save profile button
  saveProfileBtn.addEventListener('click', async () => {
    const profileName = profileSelect.value;
    const profile = currentProfiles.find(p => p.name === profileName);
    
    if (profile) {
      profile.settings = { ...currentSettings };
      await Storage.saveProfiles(currentProfiles);
      await Storage.setActiveProfile(profile);
    }
  });
  
  // New profile button
  newProfileBtn.addEventListener('click', () => {
    newProfileNameInput.value = '';
    newProfileDialog.classList.add('show');
  });
  
  // Delete profile button
  deleteProfileBtn.addEventListener('click', async () => {
    const profileName = profileSelect.value;
    
    // Don't allow deleting the default profile
    if (profileName === 'Default') {
      alert('Cannot delete the default profile');
      return;
    }
    
    const confirmed = confirm(`Are you sure you want to delete the "${profileName}" profile?`);
    
    if (confirmed) {
      const filteredProfiles = currentProfiles.filter(p => p.name !== profileName);
      
      if (filteredProfiles.length === currentProfiles.length) {
        alert('Profile not found');
        return;
      }
      
      await Storage.saveProfiles(filteredProfiles);
      
      // If the active profile was deleted, set the default profile as active
      if (activeProfile.name === profileName) {
        activeProfile = filteredProfiles.find(p => p.name === 'Default');
        await Storage.setActiveProfile(activeProfile);
      }
      
      // Reload profiles
      await loadProfiles();
      
      // Update settings
      currentSettings = { ...activeProfile.settings };
      updateUI();
      updatePreview();
      await applyStylesToCurrentTab(currentSettings);
    }
  });
  
  // Font size input
  fontSizeInput.addEventListener('input', () => {
    const value = parseInt(fontSizeInput.value);
    fontSizeValue.textContent = `${value}px`;
    currentSettings.fontSize = value;
    updatePreview();
  });
  
  fontSizeInput.addEventListener('change', async () => {
    await saveSettings();
  });
  
  // Font family select
  fontFamilySelect.addEventListener('change', async () => {
    currentSettings.fontFamily = fontFamilySelect.value;
    updatePreview();
    await saveSettings();
  });
  
  // Line height input
  lineHeightInput.addEventListener('input', () => {
    const value = parseFloat(lineHeightInput.value);
    lineHeightValue.textContent = value;
    currentSettings.lineHeight = value;
    updatePreview();
  });
  
  lineHeightInput.addEventListener('change', async () => {
    await saveSettings();
  });
  
  // Word spacing input
  wordSpacingInput.addEventListener('input', () => {
    const value = parseFloat(wordSpacingInput.value);
    wordSpacingValue.textContent = `${value}em`;
    currentSettings.wordSpacing = value;
    updatePreview();
  });
  
  wordSpacingInput.addEventListener('change', async () => {
    await saveSettings();
  });
  
  // Text alignment select
  textAlignmentSelect.addEventListener('change', async () => {
    currentSettings.textAlignment = textAlignmentSelect.value;
    updatePreview();
    await saveSettings();
  });
  
  // Site exception button
  siteExceptionBtn.addEventListener('click', async () => {
    if (siteExceptions.includes(currentDomain)) {
      // Remove from exceptions
      const filteredExceptions = siteExceptions.filter(d => d !== currentDomain);
      await Storage.saveSiteExceptions(filteredExceptions);
      siteExceptions = filteredExceptions;
      siteExceptionBtn.textContent = 'Disable for this site';
      
      // Apply active profile settings
      currentSettings = { ...activeProfile.settings };
      updateUI();
      updatePreview();
      await applyStylesToCurrentTab(currentSettings);
    } else {
      // Add to exceptions
      siteExceptions.push(currentDomain);
      await Storage.saveSiteExceptions(siteExceptions);
      siteExceptionBtn.textContent = 'Enable for this site';
      
      // Disable styles for this site
      currentSettings.enabled = false;
      await applyStylesToCurrentTab({ enabled: false });
    }
  });
  
  // Site profile button
  siteProfileBtn.addEventListener('click', () => {
    // Populate site profile dialog
    siteProfileDomainP.textContent = `Domain: ${currentDomain}`;
    
    // Populate profile select
    siteProfileSelect.innerHTML = '';
    
    // Add a "Use Global Profile" option
    const globalOption = document.createElement('option');
    globalOption.value = '';
    globalOption.textContent = 'Use Global Profile';
    siteProfileSelect.appendChild(globalOption);
    
    // Add all profiles
    currentProfiles.forEach(profile => {
      const option = document.createElement('option');
      option.value = profile.name;
      option.textContent = profile.name;
      siteProfileSelect.appendChild(option);
    });
    
    // Set the current site profile if it exists
    siteProfileSelect.value = siteProfiles[currentDomain] || '';
    
    // Show the dialog
    siteProfileDialog.classList.add('show');
  });
  
  // Options button
  optionsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  // Reset button
  resetBtn.addEventListener('click', async () => {
    const confirmed = confirm('Are you sure you want to reset all settings to defaults?');
    
    if (confirmed) {
      await Storage.resetAllSettings();
      
      // Reload everything
      await loadProfiles();
      await loadSiteExceptions();
      await loadSiteProfiles();
      await loadSettingsForCurrentSite();
      
      updateUI();
      updatePreview();
      await applyStylesToCurrentTab(currentSettings);
    }
  });
  
  // New profile dialog
  newProfileCancelBtn.addEventListener('click', () => {
    newProfileDialog.classList.remove('show');
  });
  
  newProfileSaveBtn.addEventListener('click', async () => {
    const profileName = newProfileNameInput.value.trim();
    
    if (!profileName) {
      alert('Please enter a profile name');
      return;
    }
    
    // Check if profile name already exists
    if (currentProfiles.some(p => p.name === profileName)) {
      alert('A profile with this name already exists');
      return;
    }
    
    // Create new profile
    const newProfile = {
      name: profileName,
      settings: { ...currentSettings }
    };
    
    // Add to profiles
    currentProfiles.push(newProfile);
    await Storage.saveProfiles(currentProfiles);
    
    // Set as active profile
    activeProfile = newProfile;
    await Storage.setActiveProfile(newProfile);
    
    // Reload profiles
    await loadProfiles();
    
    // Hide dialog
    newProfileDialog.classList.remove('show');
  });
  
  // Site profile dialog
  siteProfileCancelBtn.addEventListener('click', () => {
    siteProfileDialog.classList.remove('show');
  });
  
  siteProfileRemoveBtn.addEventListener('click', async () => {
    // Remove site profile
    delete siteProfiles[currentDomain];
    await Storage.saveSiteProfiles(siteProfiles);
    
    // Reload settings
    await loadSettingsForCurrentSite();
    updateUI();
    updatePreview();
    await applyStylesToCurrentTab(currentSettings);
    
    // Hide dialog
    siteProfileDialog.classList.remove('show');
  });
  
  siteProfileSaveBtn.addEventListener('click', async () => {
    const profileName = siteProfileSelect.value;
    
    if (profileName) {
      // Set site profile
      siteProfiles[currentDomain] = profileName;
      await Storage.saveSiteProfiles(siteProfiles);
      
      // Load the profile settings
      const profile = currentProfiles.find(p => p.name === profileName);
      
      if (profile) {
        currentSettings = { ...profile.settings };
        updateUI();
        updatePreview();
        await applyStylesToCurrentTab(currentSettings);
      }
    } else {
      // Remove site profile
      delete siteProfiles[currentDomain];
      await Storage.saveSiteProfiles(siteProfiles);
      
      // Use active profile settings
      currentSettings = { ...activeProfile.settings };
      updateUI();
      updatePreview();
      await applyStylesToCurrentTab(currentSettings);
    }
    
    // Hide dialog
    siteProfileDialog.classList.remove('show');
  });
}

/**
 * Save current settings
 */
async function saveSettings() {
  if (!isInitialized) {
    return;
  }
  
  // Update active profile with current settings
  activeProfile.settings = { ...currentSettings };
  await Storage.setActiveProfile(activeProfile);
  
  // Update the profile in the profiles list
  const profileIndex = currentProfiles.findIndex(p => p.name === activeProfile.name);
  
  if (profileIndex !== -1) {
    currentProfiles[profileIndex] = activeProfile;
    await Storage.saveProfiles(currentProfiles);
  }
  
  // Apply styles to current tab
  await applyStylesToCurrentTab(currentSettings);
}

// Initialize the popup when the DOM is loaded
document.addEventListener('DOMContentLoaded', initialize);
