# Installation Guide

This guide provides step-by-step instructions for installing StorageFlow Chrome Extension.

## Table of Contents

- [System Requirements](#system-requirements)
- [Installation Methods](#installation-methods)
- [Chrome Web Store Installation](#chrome-web-store-installation)
- [Developer Installation](#developer-installation)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

## System Requirements

### Browser Requirements

- **Google Chrome**: Version 88 or higher
- **Chrome-based Browsers**: Chromium, Microsoft Edge, Brave, Opera (with Chrome extension support)
- **Operating System**: Windows, macOS, Linux, Chrome OS

### Permissions Required

StorageFlow requests the following permissions:

- `activeTab` - Access to the current active tab
- `storage` - Chrome extension storage for settings
- `tabs` - Tab information for cross-tab transfers
- `scripting` - Inject scripts to access page storage
- `contextMenus` - Right-click context menu options
- `notifications` - System notifications for operations
- `downloads` - File download for export functionality
- `clipboardRead/Write` - Clipboard operations for copy/paste

## Installation Methods

### Method 1: Chrome Web Store (Recommended)

> **Note**: Extension is currently under review for Chrome Web Store publication.

1. **Open Chrome Web Store**
   - Navigate to [Chrome Web Store](https://chrome.google.com/webstore/)
2. **Search for StorageFlow**

   - Use the search bar to find "StorageFlow"
   - Look for the official extension by the StorageFlow team

3. **Install Extension**

   - Click "Add to Chrome" button
   - Review permissions in the popup dialog
   - Click "Add extension" to confirm

4. **Pin Extension** (Optional)
   - Click the extensions puzzle icon in Chrome toolbar
   - Find StorageFlow and click the pin icon
   - Extension icon will appear in the toolbar

### Method 2: Developer Installation

This method is for developers or users who want to install from source code.

#### Prerequisites

- Basic familiarity with Chrome extensions
- Access to Chrome Developer Mode

#### Step-by-Step Installation

1. **Download Source Code**

   ```bash
   # Clone from GitHub
   git clone https://github.com/varundeva/storageflow.git
   cd storageflow

   # Or download ZIP file and extract
   ```

2. **Open Chrome Extensions Page**

   - Navigate to `chrome://extensions/`
   - Or use Chrome menu: ⋮ → More tools → Extensions

3. **Enable Developer Mode**

   - Toggle "Developer mode" switch in top-right corner
   - Additional options will appear

4. **Load Unpacked Extension**

   - Click "Load unpacked" button
   - Navigate to the StorageFlow project directory
   - Select the root folder (containing `manifest.json`)
   - Click "Select Folder" or "Open"

5. **Verify Installation**
   - StorageFlow should appear in the extensions list
   - Extension icon should be visible (pin if needed)

#### Alternative: Load from ZIP

1. **Download Release**

   - Download latest release ZIP from GitHub
   - Extract to a permanent location (don't delete after installation)

2. **Follow steps 2-5** from above

## Verification

After installation, verify StorageFlow is working correctly:

### Basic Verification

1. **Check Extension Icon**

   - StorageFlow icon should be visible in toolbar
   - Icon should be clickable

2. **Open Extension Popup**

   - Click the StorageFlow icon
   - Popup should open showing the main interface
   - Current tab domain should be displayed

3. **Test Basic Functionality**
   - Toggle between localStorage and sessionStorage
   - Navigate through different tabs (Manage, Transfer, Settings)
   - Try adding a test storage item

### Advanced Verification

1. **Test Storage Operations**

   - Navigate to any website
   - Add a test localStorage item
   - Verify it appears in StorageFlow
   - Delete the test item

2. **Test Import/Export**

   - Export current storage data
   - Verify JSON file downloads correctly
   - Test import functionality with exported file

3. **Test Context Menu**
   - Right-click on any webpage
   - Verify StorageFlow options appear in context menu

## Troubleshooting

### Common Installation Issues

#### Extension Not Loading

**Problem**: Extension fails to load or shows errors

**Solutions**:

1. Verify `manifest.json` exists in root directory
2. Check Chrome console for errors (`chrome://extensions/` → Developer mode → Errors)
3. Ensure all required files are present
4. Try refreshing the extension page

#### Permissions Denied

**Problem**: Chrome blocks certain permissions

**Solutions**:

1. Review requested permissions carefully
2. Ensure you understand each permission's purpose
3. Install from trusted sources only
4. Check Chrome security settings

#### Extension Icon Missing

**Problem**: StorageFlow icon doesn't appear in toolbar

**Solutions**:

1. Check if extension is enabled in `chrome://extensions/`
2. Pin the extension manually:
   - Click extensions puzzle icon (⋮)
   - Find StorageFlow
   - Click pin icon

#### Popup Won't Open

**Problem**: Clicking extension icon doesn't open popup

**Solutions**:

1. Check browser console for JavaScript errors
2. Verify popup files exist (`src/popup/popup.html`)
3. Reload the extension
4. Restart Chrome browser

### Developer Installation Issues

#### Load Unpacked Fails

**Problem**: "Load unpacked" shows error or won't load

**Solutions**:

1. Ensure you're selecting the correct directory (contains `manifest.json`)
2. Check manifest.json syntax for errors
3. Verify all referenced files exist
4. Check Chrome version compatibility

#### Manifest Errors

**Problem**: Extension shows manifest-related errors

**Solutions**:

1. Validate `manifest.json` syntax
2. Ensure Manifest V3 compliance
3. Check all file paths are correct
4. Verify permission declarations

## Post-Installation Setup

### Initial Configuration

1. **Set Theme Preference**

   - Open StorageFlow popup
   - Go to Settings tab
   - Choose preferred theme (Light/Dark/Auto)

2. **Configure Safety Settings**

   - Enable/disable delete confirmations
   - Set auto-backup preferences

3. **Test Core Features**
   - Try creating a storage item
   - Test export functionality
   - Verify clipboard operations work

### Browser Integration

1. **Pin to Toolbar**

   - Pin StorageFlow for easy access
   - Position among other frequently used extensions

2. **Set Up Context Menu**

   - Right-click on pages to access StorageFlow options
   - Use for quick storage operations

3. **Keyboard Shortcuts** (if applicable)
   - Configure custom keyboard shortcuts in Chrome settings
   - Navigate to `chrome://extensions/shortcuts`

## Updating StorageFlow

### Automatic Updates (Web Store)

- Extensions from Chrome Web Store update automatically
- Check `chrome://extensions/` to see version info
- Enable "Allow automatic updates" in Chrome settings

### Manual Updates (Developer)

1. Download latest version from source
2. Replace existing files
3. Reload extension in `chrome://extensions/`
4. Clear any cached data if needed

## Uninstallation

To remove StorageFlow:

1. **Open Extensions Page**

   - Navigate to `chrome://extensions/`

2. **Find StorageFlow**

   - Locate StorageFlow in the extensions list

3. **Remove Extension**

   - Click "Remove" button
   - Confirm removal in dialog

4. **Clean Up** (Optional)
   - Extension settings are automatically removed
   - Downloaded export files remain in Downloads folder

---

For additional help, see [Troubleshooting Guide](./troubleshooting.md) or create an issue on GitHub.
