# Installation Guide for Reading Style Adjuster

This guide will help you install and set up the Reading Style Adjuster browser extension from source.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- npm (comes with Node.js)
- A modern web browser (Chrome, Firefox, or Edge)

## Installation Steps

1. **Clone the Repository**

   ```bash
   git clone https://github.com/chirag127/Reading-Style-Adjuster-browser-extension.git
   cd Reading-Style-Adjuster-browser-extension
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Generate Icons**

   ```bash
   npm run generate-icons
   ```

4. **Load the Extension in Your Browser**

   ### Chrome
   
   1. Open Chrome and navigate to `chrome://extensions/`
   2. Enable "Developer mode" by toggling the switch in the top right corner
   3. Click "Load unpacked"
   4. Select the `extension` folder from the repository
   
   ### Firefox
   
   1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
   2. Click "Load Temporary Add-on"
   3. Select any file in the `extension` folder
   
   ### Edge
   
   1. Open Edge and navigate to `edge://extensions/`
   2. Enable "Developer mode" by toggling the switch in the left sidebar
   3. Click "Load unpacked"
   4. Select the `extension` folder from the repository

## Verifying the Installation

1. After loading the extension, you should see the Reading Style Adjuster icon in your browser's toolbar
2. Click the icon to open the popup interface
3. Try adjusting the settings and see the changes applied to the current webpage

## Troubleshooting

- If the extension doesn't appear in the toolbar, try restarting your browser
- If the styles aren't applied, check if the extension is enabled and the current site isn't in the exceptions list
- If you encounter any errors during installation, make sure you have the correct version of Node.js installed

## Building for Production

This repository contains the development version of the extension. For production use, you would typically:

1. Package the extension for the Chrome Web Store, Firefox Add-ons, or Microsoft Edge Add-ons
2. Submit it for review to the respective stores
3. Once approved, users can install it directly from the store

However, this process is not covered in this guide as it requires developer accounts with the respective platforms.
