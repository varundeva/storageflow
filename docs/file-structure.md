# File Structure Documentation

This document provides a comprehensive breakdown of all files in the StorageFlow project, their purposes, and relationships.

## Table of Contents

- [Project Overview](#project-overview)
- [Root Directory](#root-directory)
- [Source Directory (`src/`)](#source-directory-src)
- [Documentation Directory (`docs/`)](#documentation-directory-docs)
- [File Dependencies](#file-dependencies)
- [Build Artifacts](#build-artifacts)

## Project Overview

```
StorageFlow/
├── manifest.json                 # Chrome Extension configuration
├── README.md                     # Main project documentation
├── LICENSE                       # MIT License file
├── src/                         # Source code directory
│   ├── background/              # Background script (Service Worker)
│   ├── content/                 # Content scripts
│   ├── popup/                   # Extension popup UI
│   └── assets/                  # Static assets (icons, images)
├── docs/                        # Comprehensive documentation
└── [build artifacts]           # Generated/temporary files
```

## Root Directory

### `manifest.json`

**Purpose**: Chrome Extension configuration and metadata  
**Type**: JSON Configuration  
**Critical**: Yes - Required for extension loading

**Key Contents**:

```json
{
  "manifest_version": 3,
  "name": "StorageFlow - Professional Browser Storage Manager",
  "version": "2.0.0",
  "permissions": ["activeTab", "storage", "tabs", "scripting", ...],
  "action": { "default_popup": "src/popup/popup.html" },
  "background": { "service_worker": "src/background/background.js" },
  "content_scripts": [...]
}
```

**Dependencies**: Referenced by all other extension files

### `README.md`

**Purpose**: Main project documentation and overview  
**Type**: Markdown Documentation  
**Audience**: Users, developers, contributors

**Contents**:

- Project overview and features
- Installation instructions
- Quick start guide
- Architecture summary
- Contributing guidelines
- License information

### `LICENSE`

**Purpose**: MIT License file  
**Type**: Legal Document  
**Importance**: Defines usage rights and restrictions

## Source Directory (`src/`)

### Background Script Directory (`src/background/`)

#### `background.js`

**Purpose**: Extension service worker - handles background tasks  
**Type**: JavaScript Module  
**Architecture**: Singleton service pattern  
**Size**: ~350 lines of code

**Key Responsibilities**:

- Extension lifecycle management
- Cross-tab communication coordination
- Context menu creation and handling
- System notifications
- Storage change monitoring
- Tab management and cleanup

**Main Classes/Functions**:

```javascript
class LocalManagerBackground {
  constructor()                    // Initialize service worker
  handleInstalled()               // Extension installation setup
  handleMessage()                 // Message routing hub
  handleDataTransfer()            // Cross-tab data transfer
  createContextMenu()             // Right-click menu setup
  exportPageStorage()             // Context menu export
  clearPageStorage()              // Context menu clear
  cleanupOldTabs()               // Periodic cleanup
}
```

**Chrome APIs Used**:

- `chrome.runtime` - Messaging and lifecycle
- `chrome.tabs` - Tab management and querying
- `chrome.storage` - Settings persistence
- `chrome.contextMenus` - Right-click integration
- `chrome.notifications` - System notifications
- `chrome.downloads` - File export

**Message Types Handled**:

- `pageReady` - Page load notification
- `localStorageChanged` - Storage change events
- `getTabInfo` - Tab information requests
- `transferData` - Cross-tab transfer operations

### Content Script Directory (`src/content/`)

#### `content.js`

**Purpose**: Injected script for page storage interaction  
**Type**: Content Script  
**Execution Context**: Web page context  
**Size**: ~150 lines of code

**Key Responsibilities**:

- Direct localStorage/sessionStorage access
- Storage operation execution (CRUD operations)
- Real-time storage change monitoring
- Page readiness detection
- Storage proxy for extension popup

**Main Functions**:

```javascript
getLocalStorageData(); // Retrieve all storage data
setLocalStorageItem(); // Set storage key-value pair
removeLocalStorageItem(); // Delete storage item
clearLocalStorage(); // Clear all storage
getStorageInfo(); // Get storage metadata
notifyExtension(); // Send change notifications
```

**Storage Operations**:

- `getLocalStorage` - Read all localStorage data
- `setLocalStorageItem` - Write individual items
- `removeLocalStorageItem` - Delete specific items
- `clearLocalStorage` - Clear all data
- `getStorageInfo` - Metadata (count, size, domain)

**Security Features**:

- Input validation and sanitization
- Error boundary implementation
- Same-origin policy compliance
- Graceful failure handling

### Popup Directory (`src/popup/`)

#### `popup.html`

**Purpose**: Main user interface structure  
**Type**: HTML Document  
**Size**: ~500 lines of markup

**Structure Overview**:

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- CSS imports and metadata -->
  </head>
  <body>
    <div class="container">
      <!-- Header with logo and controls -->
      <div class="header">...</div>

      <!-- Navigation tabs -->
      <div class="nav-tabs">...</div>

      <!-- Manage Tab Content -->
      <div class="tab-content" id="manage-tab">...</div>

      <!-- Transfer Tab Content -->
      <div class="tab-content" id="transfer-tab">...</div>

      <!-- Settings Tab Content -->
      <div class="tab-content" id="settings-tab">...</div>

      <!-- Modal dialogs -->
      <div class="modal" id="editModal">...</div>
      <!-- Additional modals -->
    </div>
  </body>
</html>
```

**Key UI Sections**:

- **Header**: Logo, theme toggle, storage mode switch
- **Navigation**: Tab switching (Manage/Transfer/Settings)
- **Manage Tab**: Storage item list, search, bulk operations
- **Transfer Tab**: Import/export, cross-tab transfer
- **Settings Tab**: Theme, safety, advanced options
- **Modals**: Edit items, import preview, paste input

**External Dependencies**:

- Font Awesome 6.0.0 (icons)
- Inter font family (typography)
- Modular CSS files (styling)

#### `popup-controller.js`

**Purpose**: Main application logic and state management  
**Type**: JavaScript Module  
**Architecture**: MVC pattern with component composition  
**Size**: ~2000 lines of code

**Main Controller Class**:

```javascript
class StorageFlowController {
  constructor() {
    // State management
    this.currentMode = STORAGE_MODES.LOCAL;
    this.storageData = {};
    this.selectedItems = new Set();

    // Component composition
    this.storageManager = new StorageManager();
    this.modalManager = new ModalManager();
    this.themeManager = new ThemeManager();
    this.importExport = new ImportExport();
  }
}
```

**Component Classes**:

**ThemeManager**:

- Theme switching (light/dark/auto)
- System theme detection
- Persistent theme storage
- CSS class management

**StorageManager**:

- Storage operation abstraction
- Chrome scripting API integration
- Data type detection and formatting
- Size calculation utilities

**ModalManager**:

- Modal window lifecycle
- Form state management
- Input validation

**ImportExport**:

- File I/O operations
- JSON serialization/deserialization
- Export file generation
- Import validation and preview

**Key Methods**:

```javascript
// Initialization
init(); // Controller initialization
getCurrentTab(); // Get active browser tab
setupEventListeners(); // DOM event binding

// Storage Operations
loadStorageData(); // Fetch storage from content script
saveItem(); // Create/update storage items
deleteItem(); // Remove storage items
switchStorageMode(); // Toggle localStorage/sessionStorage

// UI Management
displayStorageData(); // Render storage items
updateStats(); // Update counters and metrics
showToast(); // Display notifications
filterAndDisplayData(); // Search and filter

// Import/Export
exportData(); // Generate export files
handleFileImport(); // Process import files
showImportPreview(); // Display import preview
confirmImport(); // Execute import operation

// Bulk Operations
toggleSelectAll(); // Select/deselect all items
deleteSelectedItems(); // Bulk delete operation
exportSelectedData(); // Export selected items
copySelectedToClipboard(); // Clipboard operations
```

### Popup Styles Directory (`src/popup/styles/`)

#### `base.css`

**Purpose**: CSS reset, variables, and base typography  
**Type**: CSS Stylesheet  
**Size**: ~80 lines

**Contents**:

- CSS reset and box-sizing
- CSS custom properties (variables)
- Base typography (Inter font)
- Color system definition
- Spacing and sizing variables
- Border radius and shadow definitions

**CSS Variables Defined**:

```css
:root {
  --color-white: #ffffff;
  --color-gray-50: #f9fafb;
  --color-blue-600: #2563eb;
  --spacing-1: 0.25rem;
  --radius-md: 0.5rem;
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
```

#### `utilities.css`

**Purpose**: Utility classes (Tailwind CSS-inspired)  
**Type**: CSS Utilities  
**Size**: ~200 lines

**Utility Categories**:

- Layout utilities (flexbox, grid, positioning)
- Spacing utilities (margin, padding)
- Color utilities (background, text colors)
- Typography utilities (font size, weight)
- Display utilities (show/hide, overflow)

**Example Utilities**:

```css
.flex {
  display: flex;
}
.items-center {
  align-items: center;
}
.gap-2 {
  gap: var(--spacing-2);
}
.text-sm {
  font-size: 0.875rem;
}
.bg-blue-600 {
  background-color: var(--color-blue-600);
}
```

#### `layout.css`

**Purpose**: Layout components and structural styles  
**Type**: CSS Layout  
**Size**: ~300 lines

**Layout Components**:

- Main container and viewport
- Header layout and positioning
- Navigation tab system
- Tab content areas
- Storage item grid/list layout
- Search and filter layout
- Statistics grid layout

**Key Layouts**:

```css
.container {
  width: 450px;
  min-height: 600px;
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%);
  padding: 0.75rem 1.25rem;
}

.nav-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
}
```

#### `components.css`

**Purpose**: Reusable UI component styles  
**Type**: CSS Components  
**Size**: ~400 lines

**Component Categories**:

- Button variants (primary, secondary, danger)
- Card and panel components
- Modal dialog systems
- Form components (inputs, labels)
- Storage item components
- Action button groups
- Badge and indicator components

**Button System**:

```css
.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  transition: all 0.2s;
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}
```

#### `themes.css`

**Purpose**: Dark mode and theme-specific overrides  
**Type**: CSS Themes  
**Size**: ~150 lines

**Theme Implementation**:

- Dark mode variable overrides
- Component theme variations
- Accessibility considerations
- Smooth theme transitions

**Dark Mode Overrides**:

```css
html.dark {
  --color-white: #1f2937;
  --color-gray-50: #111827;
  --color-gray-100: #1f2937;
}

html.dark .card {
  background: #374151;
  border-color: #4b5563;
}
```

#### `main.css`

**Purpose**: Main stylesheet with imports and additional styles  
**Type**: CSS Import Hub  
**Size**: ~200 lines

**Import Order**:

```css
@import url("./base.css");
@import url("./utilities.css");
@import url("./layout.css");
@import url("./components.css");
@import url("./themes.css");
```

**Additional Styles**:

- Modal system styles
- Toast notification system
- Scrollbar customization
- Animation definitions
- Print styles (if applicable)

#### `popup.css`

**Purpose**: Legacy styles (being migrated to modular system)  
**Type**: CSS Legacy  
**Size**: ~800 lines

**Contents**:

- Original monolithic styles
- Utility class definitions
- Component styles (duplicate with components.css)
- Layout definitions (duplicate with layout.css)

**Migration Status**:

- ⚠️ Being gradually migrated to modular system
- Some styles may be duplicated
- Will be removed in future versions

#### `complete.css`

**Purpose**: Currently empty - reserved for future use  
**Type**: CSS Placeholder  
**Size**: Empty file

### Assets Directory (`src/assets/`)

#### Icons Directory (`src/assets/icons/`)

**`icon.svg`**

- **Purpose**: Scalable vector icon source
- **Type**: SVG Vector Graphics
- **Usage**: Source file for generating bitmap icons
- **Dimensions**: Scalable vector format

**`icon16.png`**

- **Purpose**: Extension icon for toolbar and various UI contexts
- **Type**: PNG Bitmap
- **Dimensions**: 16x16 pixels
- **Usage**: Chrome extension icon (all sizes reference this file)
- **Format**: PNG with transparency

## Documentation Directory (`docs/`)

### Core Documentation Files

**`README.md`** - Documentation overview and index  
**`installation.md`** - Complete installation guide  
**`features.md`** - Detailed feature documentation  
**`architecture.md`** - Technical architecture guide  
**`file-structure.md`** - This file - complete file breakdown

### Planned Documentation Files

**`development.md`** - Developer setup and contribution guide  
**`api-reference.md`** - Chrome API usage and internal API docs  
**`user-guide.md`** - Complete user manual  
**`troubleshooting.md`** - Common issues and solutions  
**`contributing.md`** - Contribution guidelines  
**`testing.md`** - Testing procedures and methodologies

## File Dependencies

### Dependency Graph

```
manifest.json
├── background.js (service worker)
├── content.js (injected into web pages)
└── popup.html
    ├── popup-controller.js
    └── styles/
        ├── base.css
        ├── utilities.css
        ├── layout.css
        ├── components.css
        ├── themes.css
        ├── main.css (imports all others)
        └── popup.css (legacy)
```

### Critical Path Dependencies

1. **Extension Loading**: `manifest.json` → All other files
2. **Service Worker**: `background.js` (independent)
3. **Content Injection**: `content.js` (page-dependent)
4. **UI Rendering**: `popup.html` → `popup-controller.js` → CSS files
5. **Styling**: `main.css` → All modular CSS files

### Runtime Dependencies

**External Dependencies**:

- Font Awesome 6.0.0 (CDN) - Icons
- Inter Font Family (Google Fonts) - Typography
- Chrome Extension APIs (built-in)

**Internal Dependencies**:

- All popup files depend on `manifest.json` configuration
- JavaScript modules have specific loading order requirements
- CSS files must be imported in correct cascade order

## Build Artifacts

### Generated Files (Not in Repository)

**Chrome Extension Store Package**:

- `storageflow.zip` - Packaged extension for store submission

**Development Artifacts**:

- `.crx` file - Packed extension for testing
- Temporary cache files
- Browser extension debugging files

### Version Control

**Included in Git**:

- All source files (`src/`)
- Documentation (`docs/`, `README.md`)
- Configuration (`manifest.json`)
- License file

**Excluded from Git** (`.gitignore`):

- Build artifacts
- Temporary files
- IDE-specific files
- Operating system files
- Package files for distribution

## File Maintenance

### File Naming Conventions

- **Kebab-case**: HTML files, CSS files (`popup.html`, `base.css`)
- **camelCase**: JavaScript files (`popup-controller.js`)
- **PascalCase**: Class names in code
- **lowercase**: Directory names
- **UPPERCASE**: Constants and environment files

### Code Organization Principles

1. **Single Responsibility**: Each file has a clear, single purpose
2. **Modular Architecture**: Files can be developed and tested independently
3. **Hierarchical Structure**: Logical grouping by functionality
4. **Dependency Management**: Clear dependency relationships
5. **Documentation**: Every file documented with purpose and usage

---

For development setup instructions, see [Development Guide](./development.md).  
For architectural details, see [Architecture Guide](./architecture.md).
