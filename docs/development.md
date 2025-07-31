# Development Guide

This guide covers everything needed to set up a development environment, understand the codebase, and contribute to StorageFlow.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Development Environment Setup](#development-environment-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing Guidelines](#testing-guidelines)
- [Debugging](#debugging)
- [Performance Optimization](#performance-optimization)

## Prerequisites

### Required Software

- **Google Chrome**: Version 88+ (latest recommended)
- **Node.js**: Version 16+ (for development tools, optional)
- **Git**: Latest version for version control
- **Code Editor**: VS Code recommended with extensions

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "ms-vscode.vscode-json",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-css-peek",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### Chrome Extension Development Knowledge

- Basic understanding of Chrome Extension Manifest V3
- JavaScript ES6+ features
- CSS Grid and Flexbox
- Async/await patterns
- Chrome Extension APIs

## Development Environment Setup

### 1. Clone Repository

```bash
# Clone the repository
git clone https://github.com/your-username/storageflow.git
cd storageflow

# Create development branch
git checkout -b feature/your-feature-name
```

### 2. Load Extension in Chrome

1. **Open Chrome Extensions Page**

   ```
   chrome://extensions/
   ```

2. **Enable Developer Mode**

   - Toggle the "Developer mode" switch (top-right)

3. **Load Unpacked Extension**

   - Click "Load unpacked"
   - Select the StorageFlow project root directory
   - Extension should appear in the list

4. **Pin Extension**
   - Click the extensions puzzle icon in Chrome toolbar
   - Pin StorageFlow for easy access

### 3. Development Tools Setup

```bash
# Optional: Install development dependencies
npm install -g live-server  # For local file serving
npm install -g prettier     # Code formatting
```

### 4. Editor Configuration

**VS Code Settings** (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll": true
  },
  "css.validate": true,
  "javascript.suggest.autoImports": true,
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  }
}
```

## Project Structure

### Development File Organization

```
StorageFlow/
├── src/                          # Source code
│   ├── background/               # Service Worker
│   │   └── background.js         # Main background script
│   ├── content/                  # Content Scripts
│   │   └── content.js            # Page injection script
│   ├── popup/                    # Extension Popup
│   │   ├── popup.html            # UI structure
│   │   ├── popup-controller.js   # Main application logic
│   │   └── styles/               # CSS modules
│   │       ├── base.css          # Base styles and variables
│   │       ├── utilities.css     # Utility classes
│   │       ├── layout.css        # Layout components
│   │       ├── components.css    # UI components
│   │       ├── themes.css        # Theme system
│   │       ├── main.css          # Main import file
│   │       └── popup.css         # Legacy styles
│   └── assets/                   # Static assets
│       └── icons/                # Extension icons
├── docs/                         # Documentation
├── manifest.json                 # Extension configuration
└── README.md                     # Project overview
```

### Key Development Files

**Primary Development Files**:

- `src/popup/popup-controller.js` - Main application logic
- `src/popup/popup.html` - UI structure
- `src/background/background.js` - Service worker
- `src/content/content.js` - Content script
- `manifest.json` - Extension configuration

**Styling System**:

- `src/popup/styles/main.css` - Primary stylesheet
- Modular CSS files for specific concerns

## Development Workflow

### 1. Making Changes

#### JavaScript Development

```javascript
// Example: Adding a new feature
class NewFeatureManager {
  constructor() {
    this.init();
  }

  init() {
    // Initialize feature
    console.log("NewFeatureManager initialized");
  }

  // Add your methods here
}

// Integration with main controller
class StorageFlowController {
  constructor() {
    // Add to existing components
    this.newFeatureManager = new NewFeatureManager();
  }
}
```

#### CSS Development

```css
/* Add new component styles to components.css */
.new-component {
  /* Use CSS variables for consistency */
  background: var(--color-white);
  border-radius: var(--radius-md);
  padding: var(--spacing-3);

  /* Follow existing patterns */
  transition: all 0.2s;
  box-shadow: var(--shadow-sm);
}

/* Dark mode support in themes.css */
html.dark .new-component {
  background: var(--color-gray-800);
  border-color: var(--color-gray-600);
}
```

#### HTML Development

```html
<!-- Follow existing structure patterns -->
<div class="new-section">
  <h3 class="flex items-center gap-2 font-semibold mb-3">
    <i class="fas fa-new-icon"></i>
    New Feature
  </h3>
  <div class="space-y-2">
    <!-- Content here -->
  </div>
</div>
```

### 2. Testing Changes

#### Manual Testing Process

1. **Save Changes** - All files are saved
2. **Reload Extension** - Go to `chrome://extensions/`, find StorageFlow, click reload
3. **Test Functionality** - Open extension popup and test changes
4. **Check Console** - Look for errors in browser console
5. **Test Edge Cases** - Try error conditions and boundary cases

#### Automated Testing Checklist

- [ ] Extension loads without errors
- [ ] All tabs (Manage/Transfer/Settings) work
- [ ] Storage operations (add/edit/delete) function
- [ ] Import/export operations work
- [ ] Theme switching works
- [ ] Search and filtering work
- [ ] Bulk operations function correctly

### 3. Debugging Workflow

#### Chrome DevTools Integration

```javascript
// Add debugging helpers
const DEBUG = true; // Set to false for production

function debugLog(message, data = null) {
  if (DEBUG) {
    console.log(`[StorageFlow] ${message}`, data);
  }
}

// Usage in code
debugLog("Storage data loaded", this.storageData);
```

#### Extension Debugging

1. **Popup Debugging**

   - Right-click extension icon → "Inspect popup"
   - Use Chrome DevTools normally

2. **Background Script Debugging**

   - Go to `chrome://extensions/`
   - Find StorageFlow → Click "service worker" link
   - Opens DevTools for background script

3. **Content Script Debugging**
   - Open any webpage
   - Press F12 → Console tab
   - Content script logs appear here

## Code Standards

### JavaScript Standards

#### ES6+ Features

```javascript
// Use modern JavaScript features
const storageData = await this.getStorageData();

// Arrow functions for callbacks
items.forEach((item) => this.processItem(item));

// Destructuring
const { key, value } = storageItem;
const [first, ...rest] = dataArray;

// Template literals
const message = `Imported ${count} items successfully`;

// Async/await instead of .then()
async function loadData() {
  try {
    const data = await chrome.storage.local.get("settings");
    return data;
  } catch (error) {
    console.error("Failed to load data:", error);
  }
}
```

#### Error Handling

```javascript
// Comprehensive error handling
async function performOperation() {
  try {
    const result = await riskyOperation();
    return { success: true, data: result };
  } catch (error) {
    console.error("Operation failed:", error);
    this.showToast("Operation failed: " + error.message, "error");
    return { success: false, error: error.message };
  }
}

// Input validation
function validateInput(value, type) {
  if (!value) {
    throw new Error("Value cannot be empty");
  }

  if (type === "key" && value.length > 1024) {
    throw new Error("Key too long: maximum 1024 characters");
  }

  return true;
}
```

#### Class Organization

```javascript
class ComponentManager {
  constructor(options = {}) {
    // Initialize properties
    this.config = { ...defaultConfig, ...options };
    this.state = new Map();

    // Bind methods
    this.handleEvent = this.handleEvent.bind(this);

    this.init();
  }

  // Public methods first
  async init() {
    try {
      await this.loadConfiguration();
      this.setupEventListeners();
      this.render();
    } catch (error) {
      console.error("Initialization failed:", error);
    }
  }

  // Private methods last (prefix with _)
  _validateConfiguration(config) {
    // Validation logic
  }
}
```

### CSS Standards

#### CSS Organization

```css
/* Component structure */
.component-name {
  /* Layout properties */
  display: flex;
  position: relative;

  /* Box model */
  width: 100%;
  padding: var(--spacing-3);
  margin-bottom: var(--spacing-2);

  /* Visual properties */
  background: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-md);

  /* Typography */
  font-size: 0.875rem;
  font-weight: 500;

  /* Effects */
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

/* State variations */
.component-name:hover {
  border-color: var(--color-blue-600);
  box-shadow: var(--shadow-md);
}

.component-name.active {
  background: var(--color-blue-50);
  border-color: var(--color-blue-600);
}
```

#### CSS Variable Usage

```css
/* Always use CSS variables for consistency */
:root {
  --component-spacing: 1rem;
  --component-border-radius: 0.5rem;
}

/* Good */
.component {
  padding: var(--component-spacing);
  border-radius: var(--component-border-radius);
}

/* Avoid hardcoded values */
.component {
  padding: 16px; /* Don't do this */
  border-radius: 8px; /* Don't do this */
}
```

### HTML Standards

#### Semantic HTML

```html
<!-- Use semantic HTML elements -->
<main class="container">
  <header class="header">
    <h1>StorageFlow</h1>
    <nav class="nav-tabs">
      <button role="tab" aria-selected="true">Manage</button>
    </nav>
  </header>

  <section class="tab-content">
    <article class="storage-item">
      <!-- Content -->
    </article>
  </section>
</main>
```

#### Accessibility

```html
<!-- Always include accessibility attributes -->
<button
  class="btn-primary"
  id="addItemBtn"
  aria-label="Add new storage item"
  title="Add new storage item"
>
  <i class="fas fa-plus" aria-hidden="true"></i>
  Add Item
</button>

<!-- Form labels -->
<div class="form-group">
  <label for="itemKey" class="form-label">Storage Key</label>
  <input
    type="text"
    id="itemKey"
    class="form-input"
    aria-describedby="keyHelp"
    required
  />
  <small id="keyHelp">Enter a unique key name</small>
</div>
```

## Testing Guidelines

### Manual Testing Checklist

#### Core Functionality Testing

- [ ] **Extension Loading**

  - Extension loads without console errors
  - Popup opens correctly
  - All UI elements render properly

- [ ] **Storage Operations**

  - Add new storage items
  - Edit existing items
  - Delete items (with confirmation)
  - Clear all storage

- [ ] **Mode Switching**

  - Toggle between localStorage and sessionStorage
  - Data updates correctly on switch
  - UI reflects current mode

- [ ] **Search and Filter**

  - Search by key names
  - Search by values
  - Clear search functionality
  - Real-time filtering

- [ ] **Bulk Operations**
  - Select individual items
  - Select all/deselect all
  - Bulk delete with confirmation
  - Bulk export

#### Import/Export Testing

- [ ] **Export Functions**

  - Export all data
  - Export selected items
  - File downloads correctly
  - JSON format is valid

- [ ] **Import Functions**
  - File upload works
  - Drag and drop works
  - Import preview displays
  - Import confirmation works
  - Error handling for invalid files

#### UI/UX Testing

- [ ] **Theme System**

  - Light theme displays correctly
  - Dark theme displays correctly
  - Auto theme follows system preference
  - Theme persistence across sessions

- [ ] **Responsive Design**
  - UI works at different zoom levels
  - All text is readable
  - Buttons are accessible
  - Scrolling works properly

### Browser Testing

#### Chrome Version Testing

Test on multiple Chrome versions:

- Latest stable Chrome
- Chrome Beta (if available)
- Minimum supported version (Chrome 88+)

#### Cross-Platform Testing

- Windows 10/11
- macOS
- Linux Ubuntu/Fedora
- Chrome OS

### Performance Testing

#### Load Testing

```javascript
// Test with large datasets
async function createTestData(count = 1000) {
  const testData = {};
  for (let i = 0; i < count; i++) {
    testData[`test-key-${i}`] = `test-value-${i}`;
  }
  return testData;
}

// Measure performance
async function measurePerformance(operation, name) {
  const start = performance.now();
  await operation();
  const end = performance.now();
  console.log(`${name}: ${end - start}ms`);
}
```

#### Memory Testing

- Monitor memory usage with large datasets
- Check for memory leaks after operations
- Test garbage collection behavior

## Debugging

### Common Debugging Scenarios

#### Extension Won't Load

```javascript
// Check manifest.json syntax
try {
  JSON.parse(manifestContent);
  console.log("Manifest is valid JSON");
} catch (error) {
  console.error("Manifest JSON error:", error);
}

// Check file paths in manifest
const files = [
  "src/background/background.js",
  "src/content/content.js",
  "src/popup/popup.html",
];

files.forEach((file) => {
  // Verify files exist at specified paths
});
```

#### Popup Not Opening

```javascript
// Check popup HTML validity
// Verify popup-controller.js loads
// Check for JavaScript errors in popup context

// Debug popup loading
document.addEventListener("DOMContentLoaded", () => {
  console.log("Popup DOM loaded");
  console.log("Controller:", window.controller);
});
```

#### Storage Operations Failing

```javascript
// Debug content script injection
async function debugContentScript() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        return {
          localStorage: localStorage.length,
          sessionStorage: sessionStorage.length,
          domain: window.location.hostname,
        };
      },
    });
    console.log("Content script debug:", results[0].result);
  } catch (error) {
    console.error("Content script error:", error);
  }
}
```

### Debug Tools and Techniques

#### Console Debugging

```javascript
// Comprehensive logging system
const Logger = {
  debug: (message, data) => {
    if (DEBUG_MODE) {
      console.log(`🔍 [DEBUG] ${message}`, data);
    }
  },

  info: (message, data) => {
    console.info(`ℹ️ [INFO] ${message}`, data);
  },

  warn: (message, data) => {
    console.warn(`⚠️ [WARN] ${message}`, data);
  },

  error: (message, error) => {
    console.error(`❌ [ERROR] ${message}`, error);
    // Could also send to error tracking service
  },
};
```

#### Chrome DevTools Integration

```javascript
// Add debugging helpers to global scope
if (DEBUG_MODE) {
  window.debugStorageFlow = {
    getState: () => window.controller,
    getStorageData: () => window.controller.storageData,
    simulateError: () => {
      throw new Error("Test error");
    },
    clearStorage: () => window.controller.clearAllStorage(),
  };
}
```

## Performance Optimization

### JavaScript Optimization

#### Efficient DOM Manipulation

```javascript
// Batch DOM updates
function updateStorageItems(items) {
  const container = document.getElementById("storageItems");
  const fragment = document.createDocumentFragment();

  items.forEach((item) => {
    const element = createStorageItemElement(item);
    fragment.appendChild(element);
  });

  // Single DOM update
  container.innerHTML = "";
  container.appendChild(fragment);
}

// Debounce search input
const debouncedSearch = debounce((searchTerm) => {
  this.searchTerm = searchTerm;
  this.filterAndDisplayData();
}, 300);
```

#### Memory Management

```javascript
// Clean up event listeners
class ComponentManager {
  constructor() {
    this.boundHandlers = new Map();
  }

  addEventListener(element, event, handler) {
    const boundHandler = handler.bind(this);
    this.boundHandlers.set(`${element.id}-${event}`, boundHandler);
    element.addEventListener(event, boundHandler);
  }

  removeEventListeners() {
    this.boundHandlers.forEach((handler, key) => {
      const [elementId, event] = key.split("-");
      const element = document.getElementById(elementId);
      if (element) {
        element.removeEventListener(event, handler);
      }
    });
    this.boundHandlers.clear();
  }
}
```

### CSS Optimization

#### Efficient Selectors

```css
/* Efficient - use classes */
.storage-item {
}
.storage-item.selected {
}

/* Less efficient - avoid deep nesting */
.container .tab-content .storage-items .storage-item .item-actions button {
  /* Too specific */
}

/* Better approach */
.item-action-button {
}
```

#### Animation Performance

```css
/* Use transform and opacity for animations */
.modal {
  transform: translateX(-50%) translateY(100%);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal.show {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}

/* Avoid animating layout properties */
.bad-animation {
  transition: width 0.3s ease; /* Causes reflow */
}
```

---

For additional development resources, see:

- [Architecture Guide](./architecture.md) - Technical architecture details
- [API Reference](./api-reference.md) - Chrome API usage
- [File Structure](./file-structure.md) - Detailed file breakdown
