# Reading Style Adjuster Browser Extension

A browser extension that empowers users to personalize and standardize the appearance of text content across websites. It provides granular control over key typographic properties like font size, font family, line height, word spacing, and text justification, applying these preferences globally or with specific overrides.

## 🚀 Live Demo

Visit our [GitHub Pages website](https://chirag127.github.io/Reading-Style-Adjuster-browser-extension/) to learn more about the extension and view our privacy policy.

## Features

### Core Style Adjustments

-   **Font Size**: Set a specific font size or adjust relative size
-   **Font Family**: Choose from web-safe fonts or dyslexia-friendly fonts
-   **Line Height**: Adjust the spacing between lines of text
-   **Word Spacing**: Control the space between words
-   **Text Alignment**: Force text alignment (left, right, center, justify)

### Profiles & Presets

-   **Default Profile**: Ships with a non-intrusive default setting
-   **User-Defined Profiles**: Save multiple sets of style configurations as named profiles
-   **Profile Switching**: Easily switch between saved profiles
-   **Profile Management**: Create, rename, update, and delete profiles

### Per-Site Settings & Exceptions

-   **Domain-Specific Overrides**: Disable the extension for specific domains
-   **Domain-Specific Profiles**: Assign specific profiles to particular domains

### Settings Management

-   **Reset to Defaults**: Reset current settings, active profile, or all settings
-   **Import/Export**: Export settings to a file and import from a file

## Installation

### From Source

1. Clone this repository
2. Install dependencies: `npm install`
3. Generate icons: `node convert-icons.js`
4. Load the extension in your browser:
    - Chrome: Go to `chrome://extensions/`, enable Developer mode, click "Load unpacked", and select the `extension` folder
    - Firefox: Go to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", and select any file in the `extension` folder
    - Edge: Go to `edge://extensions/`, enable Developer mode, click "Load unpacked", and select the `extension` folder

## Usage

1. Click the extension icon in the toolbar to open the popup
2. Use the controls to adjust text appearance
3. Create and switch between profiles
4. Configure site-specific settings
5. Access advanced options by clicking "Advanced Options"

## Development

### Project Structure

```
reading-style-adjuster/
├── extension/
│   ├── manifest.json
│   ├── icons/
│   ├── popup/
│   ├── options/
│   ├── background/
│   ├── content_scripts/
│   ├── common/
│   └── _locales/
└── README.md
```

### Technologies Used

-   **Manifest V3**: Latest extension manifest format
-   **HTML/CSS/JavaScript**: Core web technologies
-   **Chrome Extension API**: For browser integration
-   **MutationObserver**: For handling dynamic content

## 📸 Screenshots

_Coming soon - Screenshots of the extension in action will be added here._

## Privacy

This extension does not collect, store, or transmit any user browsing history, personal data, or website content. All user-defined settings are stored exclusively on the user's local machine using the browser's storage API.

For more details, please see our [Privacy Policy](https://chirag127.github.io/Reading-Style-Adjuster-browser-extension/privacy-policy.html).

## 👋 Contributing

Contributions are welcome! If you'd like to contribute to this project, please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature-name`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some feature'`)
5. Push to the branch (`git push origin feature/your-feature-name`)
6. Open a Pull Request

## License

MIT License

## Author

Chirag Singhal
