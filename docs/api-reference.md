# API Reference

Complete reference for Chrome Extension APIs used by StorageFlow and internal API documentation.

## Table of Contents

- [Chrome Extension APIs](#chrome-extension-apis)
- [Internal APIs](#internal-apis)
- [Message Passing](#message-passing)
- [Storage APIs](#storage-apis)
- [Content Script APIs](#content-script-apis)
- [Background Script APIs](#background-script-apis)
- [Error Handling](#error-handling)

## Chrome Extension APIs

StorageFlow utilizes multiple Chrome Extension APIs for comprehensive browser storage management.

### chrome.runtime

#### `chrome.runtime.onMessage`

**Purpose**: Inter-component communication  
**Usage**: Message routing between popup, background, and content scripts

```javascript
// Background script - Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "getTabInfo":
      this.getTabInfo(sendResponse);
      return true; // Keep channel open for async response

    case "transferData":
      this.handleDataTransfer(message, sendResponse);
      return true;

    default:
      sendResponse({ error: "Unknown message type" });
  }
});

// Popup script - Send message
const response = await chrome.runtime.sendMessage({
  type: "getTabInfo",
});
```

#### `chrome.runtime.onInstalled`

**Purpose**: Extension lifecycle management  
**Usage**: Initial setup and configuration

```javascript
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    // Set default settings
    chrome.storage.sync.set({
      localManagerSettings: {
        theme: "auto",
        confirmDelete: true,
        autoBackup: false,
      },
    });

    // Show welcome notification
    chrome.notifications.create("welcome", {
      type: "basic",
      iconUrl: "src/assets/icons/icon16.png",
      title: "StorageFlow Installed",
      message: "Click the extension icon to get started!",
    });
  }
});
```

### chrome.tabs

#### `chrome.tabs.query`

**Purpose**: Get information about browser tabs  
**Usage**: Cross-tab operations and current tab detection

```javascript
// Get current active tab
async getCurrentTab() {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });
  return tab;
}

// Get all tabs
async getAllTabs() {
  const tabs = await chrome.tabs.query({});
  return tabs.map(tab => ({
    id: tab.id,
    title: tab.title,
    url: tab.url,
    domain: new URL(tab.url).hostname
  }));
}
```

#### `chrome.tabs.sendMessage`

**Purpose**: Send messages to content scripts in specific tabs  
**Usage**: Execute storage operations on web pages

```javascript
// Send message to content script
async executeStorageOperation(tabId, operation, key, value) {
  try {
    const response = await chrome.tabs.sendMessage(tabId, {
      action: operation,
      key: key,
      value: value
    });

    if (!response.success) {
      throw new Error(response.error);
    }

    return response.data;
  } catch (error) {
    console.error('Storage operation failed:', error);
    throw error;
  }
}
```

#### `chrome.tabs.onUpdated`

**Purpose**: Monitor tab changes  
**Usage**: Track tab navigation and update tab information

```javascript
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    try {
      const domain = new URL(tab.url).hostname;
      this.activeTabs.set(tabId, {
        id: tabId,
        domain: domain,
        url: tab.url,
        lastActive: Date.now(),
      });
    } catch (error) {
      // Invalid URL, ignore
    }
  }
});
```

### chrome.scripting

#### `chrome.scripting.executeScript`

**Purpose**: Inject and execute scripts in web pages  
**Usage**: Access localStorage/sessionStorage from content scripts

```javascript
// Execute storage operation
async loadStorageData(storageMode, currentTab) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: currentTab.id },
      func: (storageMode) => {
        const storage = storageMode === 'localStorage'
          ? localStorage
          : sessionStorage;

        const data = {};
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          const value = storage.getItem(key);
          data[key] = value;
        }

        return data;
      },
      args: [storageMode]
    });

    return results[0]?.result || {};
  } catch (error) {
    console.error('Failed to load storage data:', error);
    throw error;
  }
}
```

#### Content Script Injection Patterns

```javascript
// Set storage item
async setStorageItem(key, value, storageMode, currentTab) {
  const results = await chrome.scripting.executeScript({
    target: { tabId: currentTab.id },
    func: (storageMode, key, value) => {
      const storage = storageMode === 'localStorage'
        ? localStorage
        : sessionStorage;

      try {
        storage.setItem(key, value);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    args: [storageMode, key, value]
  });

  return results[0]?.result;
}

// Remove storage item
async removeStorageItem(key, storageMode, currentTab) {
  return chrome.scripting.executeScript({
    target: { tabId: currentTab.id },
    func: (storageMode, key) => {
      const storage = storageMode === 'localStorage'
        ? localStorage
        : sessionStorage;

      storage.removeItem(key);
      return { success: true };
    },
    args: [storageMode, key]
  });
}
```

### chrome.storage

#### `chrome.storage.local`

**Purpose**: Store extension data locally  
**Usage**: Persist user settings and preferences

```javascript
// Save settings
async saveSettings(settings) {
  try {
    await chrome.storage.local.set({
      storageFlowSettings: settings
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Load settings
async loadSettings() {
  try {
    const result = await chrome.storage.local.get('storageFlowSettings');
    return result.storageFlowSettings || {
      theme: 'light',
      confirmDelete: true,
      autoBackup: false
    };
  } catch (error) {
    console.error('Failed to load settings:', error);
    return null;
  }
}
```

#### `chrome.storage.sync`

**Purpose**: Sync data across devices  
**Usage**: Sync user preferences across Chrome instances

```javascript
// Sync theme preference
async setTheme(theme) {
  await chrome.storage.sync.set({ theme });
  this.currentTheme = theme;
}

// Get synced theme
async getTheme() {
  const result = await chrome.storage.sync.get('theme');
  return result.theme || 'light';
}
```

### chrome.contextMenus

#### Context Menu Creation

**Purpose**: Add right-click menu options  
**Usage**: Quick access to StorageFlow functions

```javascript
createContextMenu() {
  chrome.contextMenus.removeAll(() => {
    // Main menu item
    chrome.contextMenus.create({
      id: 'openStorageFlow',
      title: 'Open StorageFlow',
      contexts: ['page']
    });

    // Export option
    chrome.contextMenus.create({
      id: 'exportCurrentPage',
      title: 'Export Storage Data',
      contexts: ['page']
    });

    // Clear option
    chrome.contextMenus.create({
      id: 'clearCurrentPage',
      title: 'Clear Storage Data',
      contexts: ['page']
    });
  });

  // Handle menu clicks
  chrome.contextMenus.onClicked.addListener(this.handleContextMenu.bind(this));
}
```

#### Context Menu Handler

```javascript
async handleContextMenu(info, tab) {
  switch (info.menuItemId) {
    case 'openStorageFlow':
      // Open extension popup
      chrome.action.openPopup();
      break;

    case 'exportCurrentPage':
      await this.exportPageStorage(tab);
      break;

    case 'clearCurrentPage':
      await this.clearPageStorage(tab);
      break;
  }
}
```

### chrome.notifications

#### Notification System

**Purpose**: Show system notifications  
**Usage**: User feedback for background operations

```javascript
// Success notification
showSuccessNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'src/assets/icons/icon16.png',
    title: title,
    message: message
  });
}

// Error notification
showErrorNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'src/assets/icons/icon16.png',
    title: title,
    message: message,
    priority: 2 // High priority
  });
}

// Progress notification
showProgressNotification(title, message, progress) {
  chrome.notifications.create({
    type: 'progress',
    iconUrl: 'src/assets/icons/icon16.png',
    title: title,
    message: message,
    progress: progress
  });
}
```

### chrome.downloads

#### File Download API

**Purpose**: Download exported files  
**Usage**: Export storage data as JSON files

```javascript
// Export data to file
async exportToFile(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });

  const url = URL.createObjectURL(blob);

  try {
    await chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: true
    });

    // Clean up object URL
    setTimeout(() => URL.revokeObjectURL(url), 100);

    return { success: true };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}
```

## Internal APIs

StorageFlow's internal API structure for component communication and data management.

### StorageFlowController

#### Core Controller Methods

```javascript
class StorageFlowController {
  constructor() {
    this.currentMode = STORAGE_MODES.LOCAL;
    this.currentTab = null;
    this.storageData = {};
    this.selectedItems = new Set();
  }

  // Initialization
  async init() {
    await this.getCurrentTab();
    this.setupEventListeners();
    await this.loadStorageData();
  }

  // Storage operations
  async loadStorageData() {
    this.storageData = await this.storageManager.loadStorageData(
      this.currentMode,
      this.currentTab
    );
    this.displayStorageData(this.storageData);
  }

  async saveItem(key, value) {
    await this.storageManager.setStorageItem(
      key,
      value,
      this.currentMode,
      this.currentTab
    );
    await this.loadStorageData();
  }

  async deleteItem(key) {
    await this.storageManager.removeStorageItem(
      key,
      this.currentMode,
      this.currentTab
    );
    await this.loadStorageData();
  }
}
```

### StorageManager

#### Storage Operation Abstraction

```javascript
class StorageManager {
  // Load all storage data
  async loadStorageData(storageMode, currentTab) {
    if (!currentTab) return {};

    const results = await chrome.scripting.executeScript({
      target: { tabId: currentTab.id },
      func: this._getStorageDataScript,
      args: [storageMode],
    });

    return results[0]?.result || {};
  }

  // Set storage item
  async setStorageItem(key, value, storageMode, currentTab) {
    if (!currentTab) throw new Error("No active tab");

    const results = await chrome.scripting.executeScript({
      target: { tabId: currentTab.id },
      func: this._setStorageItemScript,
      args: [storageMode, key, value],
    });

    return results[0]?.result;
  }

  // Remove storage item
  async removeStorageItem(key, storageMode, currentTab) {
    if (!currentTab) throw new Error("No active tab");

    const results = await chrome.scripting.executeScript({
      target: { tabId: currentTab.id },
      func: this._removeStorageItemScript,
      args: [storageMode, key],
    });

    return results[0]?.result;
  }

  // Utility methods
  getValueType(value) {
    if (typeof value === "string") {
      try {
        JSON.parse(value);
        return "JSON";
      } catch {
        return "String";
      }
    }
    return typeof value;
  }

  calculateSize(value) {
    const bytes = new Blob([value]).size;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  // Private script functions
  _getStorageDataScript(storageMode) {
    const storage =
      storageMode === "localStorage" ? localStorage : sessionStorage;
    const data = {};
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      data[key] = storage.getItem(key);
    }
    return data;
  }

  _setStorageItemScript(storageMode, key, value) {
    const storage =
      storageMode === "localStorage" ? localStorage : sessionStorage;
    try {
      storage.setItem(key, value);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  _removeStorageItemScript(storageMode, key) {
    const storage =
      storageMode === "localStorage" ? localStorage : sessionStorage;
    storage.removeItem(key);
    return { success: true };
  }
}
```

### ThemeManager

#### Theme Management API

```javascript
class ThemeManager {
  constructor() {
    this.currentTheme = "light";
    this.systemMediaQuery = null;
  }

  async init() {
    await this.loadTheme();
    this.setupSystemThemeDetection();
  }

  // Theme operations
  async setTheme(theme) {
    this.currentTheme = theme;
    await this.saveTheme(theme);
    this.applyTheme(theme);
    this.updateThemeSelect();
  }

  applyTheme(theme) {
    const html = document.documentElement;
    html.classList.remove("dark", "light");

    if (theme === "dark") {
      html.classList.add("dark");
    } else if (theme === "light") {
      html.classList.add("light");
    } else if (theme === "auto") {
      const isDark = this.systemMediaQuery?.matches || false;
      html.classList.add(isDark ? "dark" : "light");
    }

    this.updateThemeIcon();
  }

  // System theme detection
  setupSystemThemeDetection() {
    if (window.matchMedia) {
      this.systemMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      this.systemMediaQuery.addListener(() => {
        if (this.currentTheme === "auto") {
          this.applyTheme("auto");
        }
      });
    }
  }

  // Persistence
  async saveTheme(theme) {
    try {
      await chrome.storage.local.set({ theme });
    } catch (error) {
      console.error("Failed to save theme:", error);
    }
  }

  async loadTheme() {
    try {
      const result = await chrome.storage.local.get("theme");
      this.currentTheme = result.theme || "light";
      this.applyTheme(this.currentTheme);
    } catch (error) {
      console.error("Failed to load theme:", error);
      this.currentTheme = "light";
      this.applyTheme("light");
    }
  }
}
```

### ImportExport

#### Import/Export API

```javascript
class ImportExport {
  // Export to file
  exportDataToFile(data, currentTab, storageMode, prefix = "storageflow") {
    const exportData = {
      version: "2.0",
      timestamp: new Date().toISOString(),
      domain: currentTab ? new URL(currentTab.url).hostname : "unknown",
      storageMode: storageMode,
      data: data,
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${prefix}-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Import from file
  async importFromFile(file, callback) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      let importData = data;
      if (data.data && typeof data.data === "object") {
        importData = data.data; // Extract data from export format
      }

      callback(importData);
    } catch (error) {
      console.error("Import failed:", error);
      throw new Error("Invalid file format");
    }
  }

  // Validate import data
  validateImportData(data) {
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      throw new Error("Invalid data format: expected object");
    }

    const keys = Object.keys(data);
    if (keys.length === 0) {
      throw new Error("No data found in file");
    }

    // Validate each item
    for (const [key, value] of Object.entries(data)) {
      if (typeof key !== "string") {
        throw new Error(`Invalid key type: ${typeof key}`);
      }
      if (key.length > 1024) {
        throw new Error("Key too long: maximum 1024 characters");
      }
    }

    return true;
  }
}
```

## Message Passing

### Message Types

#### Background to Content Script Messages

```javascript
// Message types sent from background script to content scripts
const BACKGROUND_MESSAGES = {
  STORAGE_UPDATED: "storageUpdated",
  TAB_ACTIVATED: "tabActivated",
  TRANSFER_REQUEST: "transferRequest",
};

// Example usage
chrome.tabs.sendMessage(tabId, {
  type: BACKGROUND_MESSAGES.STORAGE_UPDATED,
  domain: message.domain,
  action: message.action,
  key: message.key,
  value: message.value,
});
```

#### Popup to Background Messages

```javascript
// Message types sent from popup to background script
const POPUP_MESSAGES = {
  GET_TAB_INFO: "getTabInfo",
  TRANSFER_DATA: "transferData",
  GET_TRANSFER_LOGS: "getTransferLogs",
};

// Example usage
const response = await chrome.runtime.sendMessage({
  type: POPUP_MESSAGES.GET_TAB_INFO,
});
```

#### Content Script to Background Messages

```javascript
// Message types sent from content scripts to background
const CONTENT_MESSAGES = {
  PAGE_READY: "pageReady",
  STORAGE_CHANGED: "localStorageChanged",
  OPERATION_COMPLETE: "operationComplete",
};

// Example usage
chrome.runtime.sendMessage({
  type: CONTENT_MESSAGES.PAGE_READY,
  domain: window.location.hostname,
  url: window.location.href,
});
```

### Message Response Patterns

#### Synchronous Response

```javascript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getStorageData") {
    const data = getLocalStorageData();
    sendResponse({ success: true, data });
    return false; // Synchronous response
  }
});
```

#### Asynchronous Response

```javascript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "transferData") {
    handleDataTransfer(message)
      .then((result) => sendResponse({ success: true, result }))
      .catch((error) => sendResponse({ success: false, error: error.message }));

    return true; // Keep channel open for async response
  }
});
```

#### Error Response Pattern

```javascript
// Standardized error response format
function createErrorResponse(error) {
  return {
    success: false,
    error: {
      message: error.message,
      code: error.code || "UNKNOWN_ERROR",
      timestamp: new Date().toISOString(),
    },
  };
}

// Usage
sendResponse(createErrorResponse(new Error("Operation failed")));
```

## Storage APIs

### localStorage Operations

#### Direct Access Pattern

```javascript
// Content script localStorage operations
const LocalStorageAPI = {
  // Get all data
  getAll() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      data[key] = localStorage.getItem(key);
    }
    return data;
  },

  // Get single item
  get(key) {
    return localStorage.getItem(key);
  },

  // Set item
  set(key, value) {
    try {
      localStorage.setItem(key, value);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Remove item
  remove(key) {
    localStorage.removeItem(key);
    return { success: true };
  },

  // Clear all
  clear() {
    localStorage.clear();
    return { success: true };
  },

  // Get metadata
  getInfo() {
    const data = this.getAll();
    return {
      keyCount: Object.keys(data).length,
      totalSize: JSON.stringify(data).length,
      domain: window.location.hostname,
      url: window.location.href,
    };
  },
};
```

### sessionStorage Operations

#### Session Storage API

```javascript
// Content script sessionStorage operations
const SessionStorageAPI = {
  // Same interface as localStorage but for sessionStorage
  getAll() {
    const data = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      data[key] = sessionStorage.getItem(key);
    }
    return data;
  },

  get(key) {
    return sessionStorage.getItem(key);
  },

  set(key, value) {
    try {
      sessionStorage.setItem(key, value);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  remove(key) {
    sessionStorage.removeItem(key);
    return { success: true };
  },

  clear() {
    sessionStorage.clear();
    return { success: true };
  },
};
```

### Unified Storage Interface

```javascript
// Unified interface for both storage types
class UnifiedStorageAPI {
  constructor(storageType = "localStorage") {
    this.storage =
      storageType === "localStorage" ? localStorage : sessionStorage;
    this.storageType = storageType;
  }

  // All operations use the same interface regardless of storage type
  async getAll() {
    const data = {};
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      data[key] = this.storage.getItem(key);
    }
    return data;
  }

  async get(key) {
    return this.storage.getItem(key);
  }

  async set(key, value) {
    try {
      this.storage.setItem(key, value);
      this.notifyChange("set", key, value);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async remove(key) {
    this.storage.removeItem(key);
    this.notifyChange("remove", key);
    return { success: true };
  }

  async clear() {
    this.storage.clear();
    this.notifyChange("clear");
    return { success: true };
  }

  // Change notification
  notifyChange(action, key = null, value = null) {
    // Send change notification to background script
    chrome.runtime
      .sendMessage({
        type: "storageChanged",
        storageType: this.storageType,
        action,
        key,
        value,
        domain: window.location.hostname,
        timestamp: Date.now(),
      })
      .catch(() => {
        // Extension might not be listening
      });

    // Dispatch custom event for page scripts
    window.dispatchEvent(
      new CustomEvent("storageChanged", {
        detail: { storageType: this.storageType, action, key, value },
      })
    );
  }
}
```

## Content Script APIs

### Page Integration

#### Storage Monitoring

```javascript
// Monitor storage changes from other sources
class StorageMonitor {
  constructor() {
    this.originalMethods = {};
    this.setupMonitoring();
  }

  setupMonitoring() {
    // Override localStorage methods
    this.overrideStorageMethods(localStorage, "localStorage");
    this.overrideStorageMethods(sessionStorage, "sessionStorage");
  }

  overrideStorageMethods(storage, storageType) {
    const original = {
      setItem: storage.setItem.bind(storage),
      removeItem: storage.removeItem.bind(storage),
      clear: storage.clear.bind(storage),
    };

    this.originalMethods[storageType] = original;

    // Override setItem
    storage.setItem = (key, value) => {
      original.setItem(key, value);
      this.notifyChange(storageType, "set", key, value);
    };

    // Override removeItem
    storage.removeItem = (key) => {
      original.removeItem(key);
      this.notifyChange(storageType, "remove", key);
    };

    // Override clear
    storage.clear = () => {
      original.clear();
      this.notifyChange(storageType, "clear");
    };
  }

  notifyChange(storageType, action, key = null, value = null) {
    chrome.runtime
      .sendMessage({
        type: "storageChanged",
        storageType,
        action,
        key,
        value,
        domain: window.location.hostname,
        timestamp: Date.now(),
      })
      .catch(() => {
        // Extension might not be listening
      });
  }

  restore() {
    // Restore original methods
    Object.entries(this.originalMethods).forEach(([storageType, methods]) => {
      const storage =
        storageType === "localStorage" ? localStorage : sessionStorage;
      Object.assign(storage, methods);
    });
  }
}
```

## Background Script APIs

### Tab Management

#### Active Tab Tracking

```javascript
class TabManager {
  constructor() {
    this.activeTabs = new Map();
    this.setupListeners();
  }

  setupListeners() {
    chrome.tabs.onUpdated.addListener(this.handleTabUpdated.bind(this));
    chrome.tabs.onRemoved.addListener(this.handleTabRemoved.bind(this));
    chrome.tabs.onActivated.addListener(this.handleTabActivated.bind(this));
  }

  handleTabUpdated(tabId, changeInfo, tab) {
    if (changeInfo.status === "complete" && tab.url) {
      try {
        const domain = new URL(tab.url).hostname;
        this.activeTabs.set(tabId, {
          id: tabId,
          domain,
          url: tab.url,
          title: tab.title,
          lastActive: Date.now(),
        });
      } catch (error) {
        // Invalid URL
      }
    }
  }

  handleTabRemoved(tabId) {
    this.activeTabs.delete(tabId);
  }

  handleTabActivated(activeInfo) {
    const tabInfo = this.activeTabs.get(activeInfo.tabId);
    if (tabInfo) {
      tabInfo.lastActive = Date.now();
    }
  }

  getTabInfo(tabId) {
    return this.activeTabs.get(tabId);
  }

  getAllTabs() {
    return Array.from(this.activeTabs.values());
  }

  // Cleanup old tabs
  cleanup() {
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    const now = Date.now();

    for (const [tabId, tabInfo] of this.activeTabs.entries()) {
      if (now - tabInfo.lastActive > maxAge) {
        this.activeTabs.delete(tabId);
      }
    }
  }
}
```

## Error Handling

### Error Types and Handling

#### Storage Errors

```javascript
class StorageError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = "StorageError";
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

// Error codes
const STORAGE_ERROR_CODES = {
  QUOTA_EXCEEDED: "QUOTA_EXCEEDED",
  INVALID_KEY: "INVALID_KEY",
  INVALID_VALUE: "INVALID_VALUE",
  ACCESS_DENIED: "ACCESS_DENIED",
  STORAGE_UNAVAILABLE: "STORAGE_UNAVAILABLE",
};

// Error handling wrapper
async function handleStorageOperation(operation) {
  try {
    return await operation();
  } catch (error) {
    if (error.name === "QuotaExceededError") {
      throw new StorageError(
        "Storage quota exceeded",
        STORAGE_ERROR_CODES.QUOTA_EXCEEDED,
        { originalError: error }
      );
    }

    if (error.name === "SecurityError") {
      throw new StorageError(
        "Storage access denied",
        STORAGE_ERROR_CODES.ACCESS_DENIED,
        { originalError: error }
      );
    }

    throw new StorageError("Storage operation failed", "UNKNOWN_ERROR", {
      originalError: error,
    });
  }
}
```

#### Network Errors

```javascript
class NetworkError extends Error {
  constructor(message, code, statusCode = null) {
    super(message);
    this.name = "NetworkError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

// Handle Chrome API errors
function handleChromeAPIError(error, operation) {
  if (chrome.runtime.lastError) {
    throw new NetworkError(
      `Chrome API error during ${operation}: ${chrome.runtime.lastError.message}`,
      "CHROME_API_ERROR"
    );
  }

  if (error) {
    throw new NetworkError(
      `Operation failed: ${error.message}`,
      "OPERATION_ERROR"
    );
  }
}
```

#### Global Error Handler

```javascript
// Global error handling
class ErrorHandler {
  static handleError(error, context = "unknown") {
    console.error(`[StorageFlow] Error in ${context}:`, error);

    // Log error details
    const errorInfo = {
      message: error.message,
      name: error.name,
      code: error.code || "UNKNOWN",
      context,
      timestamp: new Date().toISOString(),
      stack: error.stack,
    };

    // Store error log locally
    this.logError(errorInfo);

    // Show user-friendly message
    this.showUserError(error, context);
  }

  static logError(errorInfo) {
    chrome.storage.local.get("errorLogs").then((result) => {
      const logs = result.errorLogs || [];
      logs.unshift(errorInfo);

      // Keep only last 50 errors
      if (logs.length > 50) {
        logs.splice(50);
      }

      chrome.storage.local.set({ errorLogs: logs });
    });
  }

  static showUserError(error, context) {
    // Show toast notification or update UI
    if (window.controller && window.controller.showToast) {
      window.controller.showToast(
        this.getUserFriendlyMessage(error, context),
        "error"
      );
    }
  }

  static getUserFriendlyMessage(error, context) {
    const friendlyMessages = {
      QUOTA_EXCEEDED: "Storage space is full. Please clear some data.",
      ACCESS_DENIED: "Cannot access storage on this page.",
      INVALID_KEY: "Invalid storage key format.",
      NETWORK_ERROR: "Network operation failed. Please try again.",
      CHROME_API_ERROR: "Browser API error. Please reload the extension.",
    };

    return (
      friendlyMessages[error.code] || `An error occurred: ${error.message}`
    );
  }
}

// Global error handler setup
window.addEventListener("error", (event) => {
  ErrorHandler.handleError(event.error, "global");
});

window.addEventListener("unhandledrejection", (event) => {
  ErrorHandler.handleError(event.reason, "promise");
});
```

---

For implementation examples, see:

- [Development Guide](./development.md) - Development setup and patterns
- [Architecture Guide](./architecture.md) - System architecture details
- [File Structure](./file-structure.md) - Code organization
