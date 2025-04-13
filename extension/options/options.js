/**
 * Options page script for the Reading Style Adjuster extension
 */

import { ALL_FONTS, TEXT_ALIGNMENTS, DEFAULT_SETTINGS } from '../common/constants.js';
import * as Storage from '../common/storage.js';
import { generateId } from '../common/utils.js';

// DOM Elements - Tabs
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

// DOM Elements - Profiles
const profilesList = document.getElementById('profiles-list');
const newProfileBtn = document.getElementById('new-profile-btn');

// DOM Elements - Site Exceptions
const exceptionsList = document.getElementById('exceptions-list');
const newExceptionInput = document.getElementById('new-exception-input');
const addExceptionBtn = document.getElementById('add-exception-btn');

// DOM Elements - Site Profiles
const siteProfilesList = document.getElementById('site-profiles-list');
const newSiteDomainInput = document.getElementById('new-site-domain-input');
const newSiteProfileSelect = document.getElementById('new-site-profile-select');
const addSiteProfileBtn = document.getElementById('add-site-profile-btn');

// DOM Elements - Import/Export
const exportBtn = document.getElementById('export-btn');
const importFileInput = document.getElementById('import-file-input');
const importBtn = document.getElementById('import-btn');
const resetAllBtn = document.getElementById('reset-all-btn');

// DOM Elements - Edit Profile Dialog
const editProfileDialog = document.getElementById('edit-profile-dialog');
const editProfileTitle = document.getElementById('edit-profile-title');
const editProfileName = document.getElementById('edit-profile-name');
const editProfileFontSize = document.getElementById('edit-profile-font-size');
const editProfileFontSizeValue = document.getElementById('edit-profile-font-size-value');
const editProfileFontFamily = document.getElementById('edit-profile-font-family');
const editProfileLineHeight = document.getElementById('edit-profile-line-height');
const editProfileLineHeightValue = document.getElementById('edit-profile-line-height-value');
const editProfileWordSpacing = document.getElementById('edit-profile-word-spacing');
const editProfileWordSpacingValue = document.getElementById('edit-profile-word-spacing-value');
const editProfileTextAlignment = document.getElementById('edit-profile-text-alignment');
const editProfilePreview = document.getElementById('edit-profile-preview');
const editProfileCancel = document.getElementById('edit-profile-cancel');
const editProfileSave = document.getElementById('edit-profile-save');

// State
let profiles = [];
let activeProfile = null;
let siteExceptions = [];
let siteProfiles = {};
let currentEditingProfile = null;
let isNewProfile = false;

/**
 * Initialize the options page
 */
async function initialize() {
  // Set up tab navigation
  setupTabs();
  
  // Populate font family select in edit profile dialog
  populateFontFamilySelect();
  
  // Load data from storage
  await loadData();
  
  // Set up event listeners
  setupEventListeners();
}

/**
 * Set up tab navigation
 */
function setupTabs() {
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons and panes
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanes.forEach(pane => pane.classList.remove('active'));
      
      // Add active class to clicked button and corresponding pane
      button.classList.add('active');
      const tabId = button.dataset.tab;
      document.getElementById(`${tabId}-tab`).classList.add('active');
    });
  });
}

/**
 * Populate the font family select with available fonts
 */
function populateFontFamilySelect() {
  editProfileFontFamily.innerHTML = '';
  
  ALL_FONTS.forEach(font => {
    const option = document.createElement('option');
    option.value = font;
    option.textContent = font;
    option.style.fontFamily = font;
    editProfileFontFamily.appendChild(option);
  });
}

/**
 * Load data from storage
 */
async function loadData() {
  // Load profiles
  profiles = await Storage.getProfiles();
  activeProfile = await Storage.getActiveProfile();
  
  // Load site exceptions
  siteExceptions = await Storage.getSiteExceptions();
  
  // Load site profiles
  siteProfiles = await Storage.getSiteProfiles();
  
  // Render data
  renderProfiles();
  renderSiteExceptions();
  renderSiteProfiles();
  populateSiteProfileSelect();
}

/**
 * Render profiles list
 */
function renderProfiles() {
  profilesList.innerHTML = '';
  
  profiles.forEach(profile => {
    const listItem = document.createElement('div');
    listItem.className = 'list-item';
    
    const isActive = profile.name === activeProfile.name;
    
    listItem.innerHTML = `
      <div class="list-item-info">
        <div class="list-item-name">${profile.name}${isActive ? ' (Active)' : ''}</div>
        <div class="list-item-description">
          ${profile.settings.fontSize}px, ${profile.settings.fontFamily}, 
          Line height: ${profile.settings.lineHeight}, 
          Word spacing: ${profile.settings.wordSpacing}em, 
          Alignment: ${profile.settings.textAlignment}
        </div>
      </div>
      <div class="list-item-actions">
        ${isActive ? '' : `<button class="secondary-btn set-active-btn" data-profile="${profile.name}">Set Active</button>`}
        <button class="secondary-btn edit-profile-btn" data-profile="${profile.name}">Edit</button>
        ${profile.name === 'Default' ? '' : `<button class="danger-btn delete-profile-btn" data-profile="${profile.name}">Delete</button>`}
      </div>
    `;
    
    profilesList.appendChild(listItem);
  });
  
  // Add event listeners to buttons
  document.querySelectorAll('.set-active-btn').forEach(button => {
    button.addEventListener('click', () => {
      const profileName = button.dataset.profile;
      setActiveProfile(profileName);
    });
  });
  
  document.querySelectorAll('.edit-profile-btn').forEach(button => {
    button.addEventListener('click', () => {
      const profileName = button.dataset.profile;
      openEditProfileDialog(profileName);
    });
  });
  
  document.querySelectorAll('.delete-profile-btn').forEach(button => {
    button.addEventListener('click', () => {
      const profileName = button.dataset.profile;
      deleteProfile(profileName);
    });
  });
}

/**
 * Render site exceptions list
 */
function renderSiteExceptions() {
  exceptionsList.innerHTML = '';
  
  if (siteExceptions.length === 0) {
    exceptionsList.innerHTML = '<div class="empty-list">No site exceptions added yet.</div>';
    return;
  }
  
  siteExceptions.forEach(domain => {
    const listItem = document.createElement('div');
    listItem.className = 'list-item';
    
    listItem.innerHTML = `
      <div class="list-item-info">
        <div class="list-item-name">${domain}</div>
        <div class="list-item-description">
          The extension is disabled on this site.
        </div>
      </div>
      <div class="list-item-actions">
        <button class="danger-btn remove-exception-btn" data-domain="${domain}">Remove</button>
      </div>
    `;
    
    exceptionsList.appendChild(listItem);
  });
  
  // Add event listeners to buttons
  document.querySelectorAll('.remove-exception-btn').forEach(button => {
    button.addEventListener('click', () => {
      const domain = button.dataset.domain;
      removeSiteException(domain);
    });
  });
}

/**
 * Render site profiles list
 */
function renderSiteProfiles() {
  siteProfilesList.innerHTML = '';
  
  const domains = Object.keys(siteProfiles);
  
  if (domains.length === 0) {
    siteProfilesList.innerHTML = '<div class="empty-list">No site-specific profiles added yet.</div>';
    return;
  }
  
  domains.forEach(domain => {
    const profileName = siteProfiles[domain];
    const listItem = document.createElement('div');
    listItem.className = 'list-item';
    
    listItem.innerHTML = `
      <div class="list-item-info">
        <div class="list-item-name">${domain}</div>
        <div class="list-item-description">
          Using profile: ${profileName}
        </div>
      </div>
      <div class="list-item-actions">
        <button class="secondary-btn edit-site-profile-btn" data-domain="${domain}">Change</button>
        <button class="danger-btn remove-site-profile-btn" data-domain="${domain}">Remove</button>
      </div>
    `;
    
    siteProfilesList.appendChild(listItem);
  });
  
  // Add event listeners to buttons
  document.querySelectorAll('.edit-site-profile-btn').forEach(button => {
    button.addEventListener('click', () => {
      const domain = button.dataset.domain;
      editSiteProfile(domain);
    });
  });
  
  document.querySelectorAll('.remove-site-profile-btn').forEach(button => {
    button.addEventListener('click', () => {
      const domain = button.dataset.domain;
      removeSiteProfile(domain);
    });
  });
}

/**
 * Populate site profile select
 */
function populateSiteProfileSelect() {
  newSiteProfileSelect.innerHTML = '';
  
  profiles.forEach(profile => {
    const option = document.createElement('option');
    option.value = profile.name;
    option.textContent = profile.name;
    newSiteProfileSelect.appendChild(option);
  });
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // New profile button
  newProfileBtn.addEventListener('click', () => {
    openNewProfileDialog();
  });
  
  // Add exception button
  addExceptionBtn.addEventListener('click', () => {
    addSiteException();
  });
  
  // Add site profile button
  addSiteProfileBtn.addEventListener('click', () => {
    addSiteProfile();
  });
  
  // Export button
  exportBtn.addEventListener('click', () => {
    exportSettings();
  });
  
  // Import button
  importBtn.addEventListener('click', () => {
    importSettings();
  });
  
  // Reset all button
  resetAllBtn.addEventListener('click', () => {
    resetAllSettings();
  });
  
  // Edit profile dialog
  editProfileCancel.addEventListener('click', () => {
    closeEditProfileDialog();
  });
  
  editProfileSave.addEventListener('click', () => {
    saveProfile();
  });
  
  // Edit profile preview updates
  editProfileFontSize.addEventListener('input', updateEditProfilePreview);
  editProfileFontFamily.addEventListener('change', updateEditProfilePreview);
  editProfileLineHeight.addEventListener('input', updateEditProfilePreview);
  editProfileWordSpacing.addEventListener('input', updateEditProfilePreview);
  editProfileTextAlignment.addEventListener('change', updateEditProfilePreview);
  
  // Update value displays
  editProfileFontSize.addEventListener('input', () => {
    editProfileFontSizeValue.textContent = `${editProfileFontSize.value}px`;
  });
  
  editProfileLineHeight.addEventListener('input', () => {
    editProfileLineHeightValue.textContent = editProfileLineHeight.value;
  });
  
  editProfileWordSpacing.addEventListener('input', () => {
    editProfileWordSpacingValue.textContent = `${editProfileWordSpacing.value}em`;
  });
}

/**
 * Set active profile
 * @param {string} profileName - The name of the profile to set as active
 */
async function setActiveProfile(profileName) {
  const profile = profiles.find(p => p.name === profileName);
  
  if (profile) {
    activeProfile = profile;
    await Storage.setActiveProfile(profile);
    renderProfiles();
  }
}

/**
 * Open edit profile dialog
 * @param {string} profileName - The name of the profile to edit
 */
function openEditProfileDialog(profileName) {
  const profile = profiles.find(p => p.name === profileName);
  
  if (!profile) {
    return;
  }
  
  currentEditingProfile = profile;
  isNewProfile = false;
  
  editProfileTitle.textContent = `Edit Profile: ${profile.name}`;
  editProfileName.value = profile.name;
  editProfileName.disabled = profile.name === 'Default';
  
  const { fontSize, fontFamily, lineHeight, wordSpacing, textAlignment } = profile.settings;
  
  editProfileFontSize.value = fontSize;
  editProfileFontSizeValue.textContent = `${fontSize}px`;
  
  editProfileFontFamily.value = fontFamily;
  
  editProfileLineHeight.value = lineHeight;
  editProfileLineHeightValue.textContent = lineHeight;
  
  editProfileWordSpacing.value = wordSpacing;
  editProfileWordSpacingValue.textContent = `${wordSpacing}em`;
  
  editProfileTextAlignment.value = textAlignment;
  
  updateEditProfilePreview();
  
  editProfileDialog.classList.add('show');
}

/**
 * Open new profile dialog
 */
function openNewProfileDialog() {
  currentEditingProfile = {
    name: '',
    settings: { ...DEFAULT_SETTINGS }
  };
  isNewProfile = true;
  
  editProfileTitle.textContent = 'Create New Profile';
  editProfileName.value = '';
  editProfileName.disabled = false;
  
  const { fontSize, fontFamily, lineHeight, wordSpacing, textAlignment } = DEFAULT_SETTINGS;
  
  editProfileFontSize.value = fontSize;
  editProfileFontSizeValue.textContent = `${fontSize}px`;
  
  editProfileFontFamily.value = fontFamily;
  
  editProfileLineHeight.value = lineHeight;
  editProfileLineHeightValue.textContent = lineHeight;
  
  editProfileWordSpacing.value = wordSpacing;
  editProfileWordSpacingValue.textContent = `${wordSpacing}em`;
  
  editProfileTextAlignment.value = textAlignment;
  
  updateEditProfilePreview();
  
  editProfileDialog.classList.add('show');
}

/**
 * Close edit profile dialog
 */
function closeEditProfileDialog() {
  editProfileDialog.classList.remove('show');
  currentEditingProfile = null;
}

/**
 * Update edit profile preview
 */
function updateEditProfilePreview() {
  const fontSize = editProfileFontSize.value;
  const fontFamily = editProfileFontFamily.value;
  const lineHeight = editProfileLineHeight.value;
  const wordSpacing = editProfileWordSpacing.value;
  const textAlignment = editProfileTextAlignment.value;
  
  editProfilePreview.style.fontSize = `${fontSize}px`;
  editProfilePreview.style.fontFamily = `"${fontFamily}", sans-serif`;
  editProfilePreview.style.lineHeight = lineHeight;
  editProfilePreview.style.wordSpacing = `${wordSpacing}em`;
  editProfilePreview.style.textAlign = textAlignment;
}

/**
 * Save profile
 */
async function saveProfile() {
  const name = editProfileName.value.trim();
  
  if (!name) {
    alert('Please enter a profile name');
    return;
  }
  
  // Check if name already exists (for new profiles)
  if (isNewProfile && profiles.some(p => p.name === name)) {
    alert('A profile with this name already exists');
    return;
  }
  
  // Check if name changed and already exists (for existing profiles)
  if (!isNewProfile && 
      name !== currentEditingProfile.name && 
      profiles.some(p => p.name === name)) {
    alert('A profile with this name already exists');
    return;
  }
  
  const settings = {
    enabled: true,
    fontSize: parseInt(editProfileFontSize.value),
    fontFamily: editProfileFontFamily.value,
    lineHeight: parseFloat(editProfileLineHeight.value),
    wordSpacing: parseFloat(editProfileWordSpacing.value),
    textAlignment: editProfileTextAlignment.value
  };
  
  if (isNewProfile) {
    // Create new profile
    const newProfile = {
      name,
      settings
    };
    
    profiles.push(newProfile);
  } else {
    // Update existing profile
    const oldName = currentEditingProfile.name;
    const profileIndex = profiles.findIndex(p => p.name === oldName);
    
    if (profileIndex !== -1) {
      // Update profile
      profiles[profileIndex] = {
        name,
        settings
      };
      
      // If this is the active profile, update it
      if (activeProfile.name === oldName) {
        activeProfile = profiles[profileIndex];
        await Storage.setActiveProfile(activeProfile);
      }
      
      // If the name changed, update site profiles
      if (name !== oldName) {
        for (const domain in siteProfiles) {
          if (siteProfiles[domain] === oldName) {
            siteProfiles[domain] = name;
          }
        }
        
        await Storage.saveSiteProfiles(siteProfiles);
      }
    }
  }
  
  await Storage.saveProfiles(profiles);
  
  closeEditProfileDialog();
  renderProfiles();
  renderSiteProfiles();
  populateSiteProfileSelect();
}

/**
 * Delete profile
 * @param {string} profileName - The name of the profile to delete
 */
async function deleteProfile(profileName) {
  // Don't allow deleting the default profile
  if (profileName === 'Default') {
    alert('Cannot delete the default profile');
    return;
  }
  
  // Don't allow deleting the active profile
  if (profileName === activeProfile.name) {
    alert('Cannot delete the active profile. Please set another profile as active first.');
    return;
  }
  
  const confirmed = confirm(`Are you sure you want to delete the "${profileName}" profile?`);
  
  if (confirmed) {
    const filteredProfiles = profiles.filter(p => p.name !== profileName);
    
    if (filteredProfiles.length === profiles.length) {
      alert('Profile not found');
      return;
    }
    
    profiles = filteredProfiles;
    await Storage.saveProfiles(profiles);
    
    // Update site profiles to remove references to the deleted profile
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
    
    renderProfiles();
    renderSiteProfiles();
    populateSiteProfileSelect();
  }
}

/**
 * Add site exception
 */
async function addSiteException() {
  const domain = newExceptionInput.value.trim();
  
  if (!domain) {
    alert('Please enter a domain');
    return;
  }
  
  // Check if domain already exists
  if (siteExceptions.includes(domain)) {
    alert('This domain is already in the exceptions list');
    return;
  }
  
  siteExceptions.push(domain);
  await Storage.saveSiteExceptions(siteExceptions);
  
  newExceptionInput.value = '';
  renderSiteExceptions();
}

/**
 * Remove site exception
 * @param {string} domain - The domain to remove from exceptions
 */
async function removeSiteException(domain) {
  const confirmed = confirm(`Are you sure you want to remove "${domain}" from the exceptions list?`);
  
  if (confirmed) {
    siteExceptions = siteExceptions.filter(d => d !== domain);
    await Storage.saveSiteExceptions(siteExceptions);
    renderSiteExceptions();
  }
}

/**
 * Add site profile
 */
async function addSiteProfile() {
  const domain = newSiteDomainInput.value.trim();
  const profileName = newSiteProfileSelect.value;
  
  if (!domain) {
    alert('Please enter a domain');
    return;
  }
  
  if (!profileName) {
    alert('Please select a profile');
    return;
  }
  
  // Check if domain already exists
  if (domain in siteProfiles) {
    alert('This domain already has a specific profile. Please edit or remove it first.');
    return;
  }
  
  siteProfiles[domain] = profileName;
  await Storage.saveSiteProfiles(siteProfiles);
  
  newSiteDomainInput.value = '';
  renderSiteProfiles();
}

/**
 * Edit site profile
 * @param {string} domain - The domain to edit
 */
function editSiteProfile(domain) {
  newSiteDomainInput.value = domain;
  newSiteProfileSelect.value = siteProfiles[domain];
  
  // Scroll to the add site profile section
  document.querySelector('.add-site-profile').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Remove site profile
 * @param {string} domain - The domain to remove
 */
async function removeSiteProfile(domain) {
  const confirmed = confirm(`Are you sure you want to remove the specific profile for "${domain}"?`);
  
  if (confirmed) {
    delete siteProfiles[domain];
    await Storage.saveSiteProfiles(siteProfiles);
    renderSiteProfiles();
  }
}

/**
 * Export settings
 */
async function exportSettings() {
  const settingsJson = await Storage.exportSettings();
  
  // Create a blob and download link
  const blob = new Blob([settingsJson], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'reading-style-adjuster-settings.json';
  a.click();
  
  // Clean up
  URL.revokeObjectURL(url);
}

/**
 * Import settings
 */
async function importSettings() {
  const file = importFileInput.files[0];
  
  if (!file) {
    alert('Please select a file to import');
    return;
  }
  
  const reader = new FileReader();
  
  reader.onload = async (event) => {
    try {
      const settingsJson = event.target.result;
      const success = await Storage.importSettings(settingsJson);
      
      if (success) {
        alert('Settings imported successfully');
        await loadData();
      } else {
        alert('Failed to import settings. The file may be invalid.');
      }
    } catch (error) {
      alert('Error importing settings: ' + error.message);
    }
  };
  
  reader.readAsText(file);
}

/**
 * Reset all settings
 */
async function resetAllSettings() {
  const confirmed = confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.');
  
  if (confirmed) {
    await Storage.resetAllSettings();
    await loadData();
    alert('All settings have been reset to defaults');
  }
}

// Initialize the options page when the DOM is loaded
document.addEventListener('DOMContentLoaded', initialize);
