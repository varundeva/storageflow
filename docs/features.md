# Features Overview

StorageFlow provides comprehensive browser storage management with professional-grade features for developers, QA engineers, and power users.

## Table of Contents

- [Core Storage Management](#core-storage-management)
- [Data Import/Export](#data-importexport)
- [Cross-Tab Operations](#cross-tab-operations)
- [User Interface](#user-interface)
- [Advanced Features](#advanced-features)
- [Developer Tools](#developer-tools)

## Core Storage Management

### Dual Storage Support

StorageFlow seamlessly manages both localStorage and sessionStorage with intelligent switching.

**Features:**

- **Toggle Switching**: One-click toggle between localStorage and sessionStorage
- **Live Data Sync**: Real-time updates when storage changes
- **Domain Awareness**: Shows storage data for the current active tab's domain
- **Storage Isolation**: Respects browser's same-origin policy

**Usage Example:**

```javascript
// StorageFlow can manage both:
localStorage.setItem("userPreference", "darkMode");
sessionStorage.setItem("temporaryData", JSON.stringify({ id: 123 }));
```

### Real-Time Data Visualization

**Type Detection:**

- **String**: Plain text values
- **JSON**: Valid JSON objects and arrays (with syntax highlighting)
- **Number**: Numeric values
- **Boolean**: true/false values

**Data Display:**

- **Formatted JSON**: Pretty-printed JSON with proper indentation
- **Size Calculation**: Shows storage size in bytes/KB/MB
- **Truncation**: Long values are intelligently truncated with expand option
- **Search Highlighting**: Search terms highlighted in results

### Advanced Search & Filtering

**Search Capabilities:**

- **Key Search**: Find items by storage key names
- **Value Search**: Search within storage values
- **Real-time Filtering**: Results update as you type
- **Case-insensitive**: Matches regardless of case
- **Partial Matching**: Finds substring matches

**Filter Options:**

- **All Items**: Show complete storage contents
- **Selected Items**: Focus on checked items only
- **Search Results**: Filtered results based on search terms

### Bulk Operations

**Selection Methods:**

- **Individual Selection**: Check boxes next to specific items
- **Select All**: Toggle all visible items at once
- **Filtered Selection**: Select all items matching current search

**Bulk Actions:**

- **Bulk Delete**: Remove multiple items simultaneously
- **Bulk Export**: Export selected items only
- **Bulk Copy**: Copy multiple items to clipboard

## Data Import/Export

### File-Based Operations

**Export Formats:**

```json
{
  "version": "2.0",
  "timestamp": "2025-07-31T10:30:00.000Z",
  "domain": "example.com",
  "storageMode": "localStorage",
  "data": {
    "userSettings": "{\"theme\":\"dark\"}",
    "sessionId": "abc123",
    "preferences": "enabled"
  }
}
```

**Export Options:**

- **Export All**: Complete storage dump for current domain
- **Export Selected**: Only chosen items
- **Export with Metadata**: Includes version, timestamp, domain info
- **Custom Filename**: Auto-generated with domain and date

**Import Features:**

- **Drag & Drop**: Drop JSON files directly onto interface
- **File Browser**: Traditional file selection dialog
- **Format Validation**: Automatic JSON syntax checking
- **Preview Mode**: Review data before importing
- **Selective Import**: Choose which items to import
- **Overwrite Protection**: Options to skip existing keys

### Clipboard Integration

**Copy Operations:**

- **Copy All to Clipboard**: Complete storage data in JSON format
- **Copy Selected**: Only checked items
- **Copy Individual Values**: Single item copy functionality
- **Formatted Output**: Pretty-printed JSON for readability

**Paste Operations:**

- **Paste JSON Data**: Direct paste from clipboard
- **Format Detection**: Automatically detects StorageFlow exports
- **Batch Import**: Import multiple items from pasted data
- **Error Handling**: Clear error messages for invalid formats

### Import Preview System

**Preview Features:**

- **Live Preview**: See exactly what will be imported
- **Edit Before Import**: Modify keys/values before importing
- **Remove Items**: Exclude specific items from import
- **Conflict Detection**: Highlights items that will overwrite existing data

**Import Options:**

- **Overwrite Existing**: Replace matching keys (default: enabled)
- **Backup Before Import**: Create automatic backup before import
- **Selective Import**: Import only checked items

## Cross-Tab Operations

### Tab-to-Tab Transfer

**Transfer Modes:**

- **Cross-Domain Transfer**: Move data between different websites
- **Same-Domain Transfer**: Copy data between tabs of same site
- **Selective Transfer**: Transfer only selected items
- **Full Transfer**: Move complete storage contents

**Transfer Process:**

1. Select source tab data
2. Choose target tab
3. Configure transfer options
4. Execute transfer with confirmation
5. Verify transfer completion

### Transfer Logging

**Audit Trail:**

- **Transfer History**: Complete log of all transfers
- **Metadata Tracking**: Source/target domains, timestamps
- **Item Counts**: Number of items transferred
- **Success/Failure Status**: Transfer outcome tracking

## User Interface

### Modern Design System

**Visual Hierarchy:**

- **Clean Layout**: Uncluttered, professional interface
- **Consistent Spacing**: Uniform padding and margins
- **Color Coding**: Different colors for actions (blue: neutral, green: positive, red: destructive)
- **Icon Usage**: Font Awesome icons for clear action identification

**Responsive Design:**

- **Fixed Width**: Optimized 450px width for extension popup
- **Scrollable Content**: Smooth scrolling for large datasets
- **Flexible Heights**: Adapts to content without breaking layout

### Theme Support

**Theme Options:**

- **Light Theme**: Clean, bright interface for daytime use
- **Dark Theme**: Easy on eyes for low-light environments
- **Auto Theme**: Automatically matches system theme preference

**Theme Features:**

- **Instant Switching**: No reload required
- **Persistent Settings**: Theme preference saved across sessions
- **System Integration**: Respects OS dark/light mode settings
- **Accessibility**: High contrast ratios for readability

### Navigation System

**Tab-Based Navigation:**

- **Manage Tab**: Core storage operations
- **Transfer Tab**: Import/export and cross-tab operations
- **Settings Tab**: Configuration and advanced options

**Visual Indicators:**

- **Active Tab Highlighting**: Clear indication of current section
- **Badge Counts**: Show number of selected items
- **Status Messages**: Real-time feedback for operations

## Advanced Features

### Context Menu Integration

**Right-Click Options:**

- **Open StorageFlow**: Quick access to main interface
- **Export Current Page**: Direct export from any webpage
- **Clear Storage**: Quick clear operation with confirmation

**Context Awareness:**

- **Domain-Specific**: Operations apply to current page's domain
- **Permission-Based**: Only available on supported pages

### Background Processing

**Service Worker Features:**

- **Cross-Tab Monitoring**: Detects storage changes across tabs
- **Transfer Coordination**: Manages data transfers between tabs
- **Notification System**: System notifications for completed operations
- **Error Recovery**: Graceful handling of failed operations

### Safety Features

**Data Protection:**

- **Confirmation Dialogs**: Verify destructive operations
- **Backup Creation**: Automatic backups before major changes
- **Undo Support**: Recovery options for accidental deletions
- **Size Limits**: Protection against oversized imports

**Error Handling:**

- **Graceful Degradation**: Continues working if some features fail
- **Clear Error Messages**: User-friendly error descriptions
- **Recovery Suggestions**: Helpful tips for resolving issues

## Developer Tools

### Storage Monitoring

**Real-Time Updates:**

- **Change Detection**: Monitors localStorage/sessionStorage modifications
- **Cross-Tab Sync**: Updates when other tabs modify storage
- **Mutation Tracking**: Logs all storage operations
- **Performance Monitoring**: Tracks storage operation performance

### Debugging Features

**Development Support:**

- **Console Logging**: Detailed logs for troubleshooting
- **Error Reporting**: Comprehensive error information
- **State Inspection**: View internal extension state
- **Performance Metrics**: Operation timing and statistics

### API Integration

**Chrome Extension APIs:**

- **Storage API**: Extension settings and preferences
- **Tabs API**: Cross-tab operations and information
- **Scripting API**: Content script injection
- **Downloads API**: File export functionality
- **Notifications API**: System notification support

**Content Script Features:**

- **Page Integration**: Seamless integration with web pages
- **Storage Proxy**: Safe access to page storage
- **Change Monitoring**: Real-time storage change detection
- **Error Isolation**: Prevents conflicts with page scripts

## Feature Comparison

| Feature                   | StorageFlow | Browser DevTools | Other Extensions |
| ------------------------- | ----------- | ---------------- | ---------------- |
| localStorage Management   | ✅ Full     | ✅ Basic         | ✅ Limited       |
| sessionStorage Management | ✅ Full     | ✅ Basic         | ❌ Rare          |
| Import/Export             | ✅ Advanced | ❌ None          | ✅ Basic         |
| Cross-Tab Transfer        | ✅ Yes      | ❌ No            | ❌ No            |
| Theme Support             | ✅ 3 Themes | ❌ None          | ✅ Limited       |
| Bulk Operations           | ✅ Yes      | ❌ No            | ✅ Limited       |
| Search/Filter             | ✅ Advanced | ✅ Basic         | ✅ Basic         |
| Backup/Recovery           | ✅ Yes      | ❌ No            | ❌ Rare          |
| User-Friendly UI          | ✅ Modern   | ❌ Technical     | ✅ Variable      |

---

For detailed usage instructions, see the [User Guide](./user-guide.md).
