# User Guide

Complete user manual for StorageFlow - Professional Browser Storage Manager. This guide covers all features and functionality from basic usage to advanced operations.

## Table of Contents

- [Getting Started](#getting-started)
- [Interface Overview](#interface-overview)
- [Managing Storage Data](#managing-storage-data)
- [Import and Export](#import-and-export)
- [Cross-Tab Operations](#cross-tab-operations)
- [Settings and Customization](#settings-and-customization)
- [Advanced Features](#advanced-features)
- [Tips and Best Practices](#tips-and-best-practices)

## Getting Started

### First Launch

After installing StorageFlow, click the extension icon in your Chrome toolbar to open the main interface.

#### Initial Setup

1. **Pin the Extension** (recommended)

   - Click the puzzle piece icon in Chrome toolbar
   - Find StorageFlow and click the pin icon
   - Extension will remain visible for easy access

2. **Choose Your Theme**

   - Click Settings tab
   - Select Light, Dark, or Auto theme
   - Auto theme follows your system preference

3. **Familiarize with the Interface**
   - Three main tabs: Manage, Transfer, Settings
   - Header shows current website domain
   - Toggle between localStorage and sessionStorage

### Basic Navigation

**Extension Icon**: Click to open/close StorageFlow  
**Tab Navigation**: Click tabs to switch between sections  
**Theme Toggle**: Quick theme switch in header  
**Storage Toggle**: Switch between localStorage and sessionStorage

## Interface Overview

### Header Section

```
┌─────────────────────────────────────────────────────┐
│ 🗄️ StorageFlow                            🌙 Theme │
│ Local ◄──────► Session     Current: example.com    │
└─────────────────────────────────────────────────────┘
```

**Components**:

- **Logo**: StorageFlow branding
- **Storage Toggle**: Switch between localStorage (Local) and sessionStorage (Session)
- **Theme Button**: Quick theme switching
- **Current Domain**: Shows active tab's domain

### Navigation Tabs

**Manage Tab**: Core storage operations (add, edit, delete, search)  
**Transfer Tab**: Import/export and cross-tab data transfer  
**Settings Tab**: Customization and advanced options

### Main Content Area

Changes based on selected tab, with consistent layout:

- Search and filter controls
- Statistics display
- Primary content area
- Action buttons

## Managing Storage Data

### Viewing Storage Data

#### Storage Type Selection

Use the toggle in the header to switch between:

- **localStorage**: Persistent data (survives browser restart)
- **sessionStorage**: Temporary data (cleared when tab closes)

#### Data Display

Each storage item shows:

- **Key**: Storage item identifier
- **Value**: Stored data (formatted for readability)
- **Type**: Data type (String, JSON, Number, Boolean)
- **Size**: Storage space used
- **Actions**: Edit, copy, delete buttons

### Adding New Storage Items

1. **Click "Add" Button**

   - Located in the Manage tab toolbar
   - Opens the item editing modal

2. **Enter Item Details**

   - **Key**: Unique identifier (required)
   - **Value**: Data to store (any format)

3. **Save the Item**
   - Click "Save" to create the item
   - Item appears in the main list immediately

**Example**:

```
Key: userPreferences
Value: {"theme": "dark", "language": "en"}
```

### Editing Existing Items

1. **Click Edit Icon** (pencil) next to any item
2. **Modify Values** in the editing modal
   - Key field is read-only for existing items
   - Value can be freely edited
3. **Save Changes** or cancel to discard

### Deleting Storage Items

#### Single Item Deletion

- Click the delete icon (trash) next to any item
- Confirm deletion in the popup dialog
- Item is permanently removed

#### Bulk Deletion

1. **Select Items**: Check boxes next to items you want to delete
2. **Use Bulk Actions**: "Delete" button appears when items are selected
3. **Confirm**: Confirm bulk deletion in dialog
4. **All Selected Items** are removed simultaneously

### Search and Filtering

#### Search Functionality

- **Search Box**: Located at top of Manage tab
- **Real-time Results**: Updates as you type
- **Search Scope**: Searches both keys and values
- **Case Insensitive**: Matches regardless of capitalization

**Search Examples**:

- Search "user" → finds "userSettings", "currentUser", etc.
- Search "dark" → finds items with "dark" in key or value
- Search "123" → finds numeric values containing 123

#### Clear Search

- Click the "×" button in search box
- Or delete all text manually
- Returns to full storage view

### Bulk Operations

#### Selecting Items

- **Individual Selection**: Check boxes next to specific items
- **Select All**: Click "Select All" button to toggle all items
- **Filtered Selection**: Select All only selects visible (filtered) items

#### Available Bulk Actions

- **Delete Selected**: Remove all selected items
- **Export Selected**: Download selected items as JSON file
- **Copy Selected**: Copy selected items to clipboard

#### Bulk Actions Bar

Appears automatically when items are selected:

```
┌─────────────────────────────────────────────────────┐
│ 3 selected    [Select All] [Delete] [Export]       │
└─────────────────────────────────────────────────────┘
```

### Statistics Display

The stats section shows:

- **Total Keys**: Number of storage items
- **Storage Used**: Total size of stored data
- Updates automatically as data changes

## Import and Export

### Exporting Data

#### Export All Data

1. **Go to Transfer Tab**
2. **Click "Export All"** button
3. **File Downloads** automatically with format:
   - Filename: `storageflow-YYYY-MM-DD.json`
   - Contains all storage data with metadata

#### Export Selected Items

1. **Select Items** in Manage tab (check boxes)
2. **Go to Transfer Tab**
3. **Click "Export Selected"** button
4. **File Downloads** with only selected items

#### Copy to Clipboard

- **Copy All**: Copies complete storage data as JSON
- **Copy Selected**: Copies only selected items
- Data includes metadata for easy re-import

**Export Format Example**:

```json
{
  "version": "2.0",
  "timestamp": "2025-07-31T10:30:00.000Z",
  "domain": "example.com",
  "storageMode": "localStorage",
  "data": {
    "userSettings": "{\"theme\":\"dark\"}",
    "sessionId": "abc123"
  }
}
```

### Importing Data

#### File Import

1. **Go to Transfer Tab**
2. **Import Methods**:
   - **Drag & Drop**: Drop JSON file onto upload area
   - **Browse Files**: Click upload area to select file
3. **Preview Data**: Review items before importing
4. **Configure Options**:
   - **Overwrite Existing**: Replace matching keys (default: enabled)
   - **Backup Before Import**: Create backup file (optional)
5. **Confirm Import**: Click "Confirm Import" button

#### Clipboard Import

1. **Copy JSON Data** from another source
2. **Click "Paste All"** button in Manage tab
3. **Paste Data** in the text area
4. **Click "Import Data"** to process

#### Import Preview

Before importing, StorageFlow shows:

- **Item Count**: Number of items to import
- **Individual Items**: Key, value, type, and size for each item
- **Edit Options**: Modify items before importing
- **Remove Options**: Exclude specific items from import

#### Import Options

- **Edit Items**: Click edit icon to modify key/value before import
- **Remove Items**: Click delete icon to exclude from import
- **Overwrite Settings**: Choose whether to replace existing keys
- **Backup Creation**: Automatically backup current data before import

### Supported File Formats

#### StorageFlow Native Format

```json
{
  "version": "2.0",
  "timestamp": "2025-07-31T10:30:00.000Z",
  "domain": "example.com",
  "storageMode": "localStorage",
  "data": { "key": "value" }
}
```

#### Simple JSON Format

```json
{
  "key1": "value1",
  "key2": "value2"
}
```

#### Legacy Format Support

StorageFlow automatically detects and converts older export formats.

## Cross-Tab Operations

### Understanding Cross-Tab Transfer

Cross-tab transfer allows you to copy storage data between different browser tabs, even across different domains.

#### Use Cases

- **Development Testing**: Copy test data between environments
- **Data Migration**: Move data from old to new version of a site
- **Cross-Domain Transfer**: Share data between related applications
- **Backup Restoration**: Restore data to a fresh browser session

#### Transfer Process

1. **Source Selection**: Choose data from current tab
2. **Target Selection**: Pick destination tab
3. **Transfer Execution**: Move/copy data
4. **Verification**: Confirm successful transfer

#### Transfer Limitations

- **Same-Origin Policy**: Browser security restrictions apply
- **Permission Requirements**: Target site must allow storage modifications
- **Data Size Limits**: Large transfers may be slower
- **Session vs Local**: Transfer respects storage type differences

### Security Considerations

#### Data Privacy

- **Local Processing**: All operations happen locally in your browser
- **No External Servers**: Data never leaves your machine
- **Encrypted Storage**: Chrome's built-in security applies
- **Permission-Based**: Only works on tabs you have access to

#### Transfer Safety

- **Confirmation Required**: All transfers require explicit confirmation
- **Backup Recommended**: Create backups before major transfers
- **Reversible Operations**: Most operations can be undone
- **Audit Trail**: Transfer history is logged locally

## Settings and Customization

### Appearance Settings

#### Theme Options

- **Light Theme**: Clean, bright interface for daytime use
- **Dark Theme**: Comfortable viewing in low-light conditions
- **Auto Theme**: Automatically matches system preference

**Theme Switching**:

- **Header Button**: Quick toggle between light/dark
- **Settings Dropdown**: All three options including auto
- **System Integration**: Auto theme respects OS settings
- **Instant Application**: No reload required

#### Theme Persistence

- Settings saved automatically
- Preserved across browser sessions
- Synced across all StorageFlow instances

### Safety Settings

#### Confirmation Dialogs

**Confirm before deleting items**:

- **Enabled** (default): Shows confirmation for all delete operations
- **Disabled**: Deletes immediately without confirmation
- **Recommendation**: Keep enabled to prevent accidental data loss

**Auto backup before major changes**:

- **Enabled**: Creates automatic backups before imports/bulk operations
- **Disabled** (default): No automatic backups
- **Recommendation**: Enable for important data management

#### Data Protection Features

- **Undo Support**: Recent operations can be reversed
- **Backup Creation**: Manual and automatic backup options
- **Size Limits**: Protection against oversized imports
- **Validation**: Input validation prevents corruption

### Advanced Settings

#### Clear All Data

**⚠️ WARNING**: This permanently deletes ALL storage data for the current website.

**Process**:

1. Click "Clear All Data" button
2. Read warning message carefully
3. Double confirmation required
4. All data permanently removed

**Use Cases**:

- Reset development environment
- Clear corrupted data
- Privacy/security cleanup
- Testing fresh state

#### Export Settings

Creates a backup of StorageFlow extension settings including:

- Theme preferences
- Safety settings
- Storage mode preferences
- Usage statistics (if any)

**Settings Export Format**:

```json
{
  "version": "2.0",
  "timestamp": "2025-07-31T10:30:00.000Z",
  "settings": {
    "theme": "dark",
    "confirmDelete": true,
    "autoBackup": false
  }
}
```

## Advanced Features

### Context Menu Integration

Right-click on any webpage to access StorageFlow options:

#### Available Options

- **Open StorageFlow**: Launch main interface
- **Export Current Page**: Quick export of page's storage data
- **Clear Storage**: Quick clear with confirmation

#### Context Menu Benefits

- **Fast Access**: No need to click extension icon
- **Page-Specific**: Operations apply to current page only
- **Convenient**: Available anywhere on supported pages

### Keyboard Shortcuts

While no default shortcuts are set, you can configure custom shortcuts:

1. **Go to Chrome Settings**
2. **Navigate to Extensions > Keyboard shortcuts**
3. **Find StorageFlow**
4. **Set custom shortcuts** for quick access

### Background Monitoring

StorageFlow continuously monitors storage changes in the background:

#### Change Detection

- **Real-time Updates**: Detects changes made by web pages
- **Cross-Tab Sync**: Updates when other tabs modify storage
- **Change Logging**: Tracks all storage modifications
- **Notification Support**: Optional notifications for changes

#### Performance Monitoring

- **Operation Timing**: Tracks performance of storage operations
- **Memory Usage**: Monitors extension memory consumption
- **Error Tracking**: Logs and reports errors automatically

### Developer Tools Integration

#### Console Integration

StorageFlow adds debugging helpers to the browser console:

```javascript
// Available in console when extension is active
storageFlow.getState(); // View current extension state
storageFlow.exportData(); // Programmatic data export
storageFlow.debugMode(true); // Enable verbose logging
```

#### Storage Event Monitoring

- **Change Events**: Real-time storage change notifications
- **Performance Metrics**: Operation timing and statistics
- **Error Reporting**: Detailed error information for debugging

## Tips and Best Practices

### Data Management Best Practices

#### Organizing Storage Keys

- **Use Consistent Naming**: `app.user.preferences` vs random names
- **Namespace Your Data**: Prefix keys with app/feature name
- **Avoid Special Characters**: Stick to alphanumeric and common symbols
- **Document Important Keys**: Keep notes on critical storage items

**Good Key Examples**:

```
user.settings.theme
app.session.currentUser
cache.api.userProfile
temp.form.draftData
```

#### Data Storage Guidelines

- **Store Only Necessary Data**: Avoid storing large, unused datasets
- **Use Appropriate Storage Type**:
  - localStorage for persistent data
  - sessionStorage for temporary data
- **JSON for Complex Data**: Use JSON.stringify for objects/arrays
- **Regular Cleanup**: Periodically remove unused items

### Performance Tips

#### Efficient Usage

- **Batch Operations**: Use bulk actions for multiple items
- **Search Effectively**: Use specific search terms for faster results
- **Regular Maintenance**: Clean up old/unused storage items
- **Monitor Size**: Keep track of storage space usage

#### Large Dataset Management

- **Pagination**: StorageFlow handles large datasets efficiently
- **Incremental Loading**: Large imports are processed in chunks
- **Memory Management**: Extension automatically manages memory usage
- **Performance Monitoring**: Built-in performance tracking

### Security Best Practices

#### Data Protection

- **Backup Important Data**: Export critical data regularly
- **Verify Imports**: Always preview imported data
- **Use Confirmations**: Keep delete confirmations enabled
- **Regular Audits**: Periodically review stored data

#### Privacy Considerations

- **Local Processing**: All data remains on your machine
- **No Tracking**: StorageFlow doesn't collect usage data
- **Secure Storage**: Uses Chrome's built-in security features
- **Permission Management**: Review extension permissions regularly

### Troubleshooting Common Issues

#### Extension Not Working

1. **Check Chrome Version**: Ensure Chrome 88+ is installed
2. **Reload Extension**: Go to chrome://extensions and reload
3. **Check Permissions**: Verify required permissions are granted
4. **Clear Cache**: Clear browser cache and restart Chrome

#### Storage Operations Failing

1. **Check Website Compatibility**: Some sites block storage access
2. **Verify Storage Quota**: Browser may have reached storage limits
3. **Disable Other Extensions**: Check for conflicts with other extensions
4. **Try Different Tab**: Test on a different website

#### Import/Export Issues

1. **Verify File Format**: Ensure JSON file is valid
2. **Check File Size**: Large files may take time to process
3. **Browser Permissions**: Verify download/file access permissions
4. **Try Smaller Batches**: Break large imports into smaller chunks

### Getting Help

#### Built-in Help

- **Tooltips**: Hover over buttons and icons for help text
- **Error Messages**: Clear, actionable error descriptions
- **Status Updates**: Real-time feedback for all operations

#### Community Support

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Comprehensive docs in the docs/ directory
- **User Community**: Connect with other StorageFlow users

#### Reporting Issues

When reporting problems, include:

- Chrome version
- StorageFlow version
- Steps to reproduce
- Error messages (if any)
- Browser console logs

---

For more advanced topics, see:

- [Development Guide](./development.md) - For developers and contributors
- [Architecture Guide](./architecture.md) - Technical implementation details
- [Features Overview](./features.md) - Detailed feature descriptions
