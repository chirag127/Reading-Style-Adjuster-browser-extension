# Backend

This folder exists for structural consistency, but no backend server is required or permitted for the core functionality of the Reading Style Adjuster browser extension.

All operations are client-side within the browser using the following APIs:
- chrome.storage.local: For persisting user settings, profiles, and exceptions
- chrome.scripting: For injecting CSS and executing content scripts
- chrome.tabs: For querying active tabs and triggering updates
- chrome.runtime: For message passing between service worker, popup, and content scripts

The extension does not collect, store, or transmit any user browsing history, personal data, or website content to any external server.
