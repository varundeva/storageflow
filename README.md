# StorageFlow - Professional Browser Storage Manager

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](./manifest.json)
[![Chrome Extension](https://img.shields.io/badge/platform-Chrome%20Extension-brightgreen.svg)](https://developer.chrome.com/docs/extensions/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](#license)

StorageFlow is a powerful and intuitive Chrome extension for managing browser storage (localStorage and sessionStorage) with professional-grade tools for developers and power users. Seamlessly import, export, edit, and transfer data across tabs and domains with an elegant, modern interface.

## 🚀 Key Features

### Core Storage Management

- **Dual Storage Support**: Manage both localStorage and sessionStorage with easy toggle switching
- **Real-time Data Visualization**: Live updates with type detection (String, JSON, Number, Boolean)
- **Advanced Search & Filter**: Quickly find storage items across keys and values
- **Bulk Operations**: Select multiple items for batch delete, export, or transfer

### Import/Export Capabilities

- **File-based Import/Export**: JSON format with version control and metadata
- **Clipboard Integration**: Copy/paste data directly to/from clipboard
- **Selective Operations**: Export only selected items or all data
- **Backup Creation**: Automatic backup before major operations

### Cross-Tab Data Transfer

- **Tab-to-Tab Transfer**: Move storage data between different browser tabs
- **Domain-aware Operations**: Intelligent handling of cross-domain transfers
- **Transfer Logging**: Complete audit trail of all transfer operations

### Professional UI/UX

- **Modern Design**: Clean, responsive interface with professional styling
- **Theme Support**: Light, dark, and auto (system) theme modes
- **Accessibility**: Full keyboard navigation and screen reader support
- **Toast Notifications**: Non-intrusive feedback system

### Developer Tools

- **Context Menu Integration**: Right-click options for quick access
- **Background Processing**: Efficient service worker for seamless operations
- **Error Handling**: Comprehensive error reporting and recovery
- **Extension Security**: Full compliance with Manifest V3 requirements

## 📦 Installation

### From Chrome Web Store (Recommended)

_Coming Soon - Extension will be published to Chrome Web Store_

### Developer Installation

1. **Clone or Download** this repository
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top-right corner)
4. **Click "Load unpacked"** and select the project directory
5. **Pin the extension** to your toolbar for easy access

## 🎯 Quick Start

1. **Click the StorageFlow icon** in your Chrome toolbar
2. **Select storage type** using the toggle (Local ↔ Session)
3. **View current data** for the active tab
4. **Add, edit, or delete** storage items using the intuitive interface
5. **Export or import** data using the Transfer tab
6. **Customize settings** in the Settings tab

## 🔧 Usage Guide

### Managing Storage Data

- **Add Item**: Click the "Add" button to create new storage entries
- **Edit Item**: Click the edit icon (pencil) next to any storage item
- **Delete Item**: Click the delete icon (trash) to remove items
- **Search**: Use the search bar to filter items by key or value

### Bulk Operations

- **Select Items**: Check the boxes next to items you want to manage
- **Bulk Actions**: Use the bulk action bar for selected items
- **Select All**: Toggle all items at once with the "Select All" button

### Import/Export Operations

- **Export All**: Download all storage data as a JSON file
- **Export Selected**: Download only selected items
- **Import File**: Drag & drop or browse for JSON files to import
- **Copy to Clipboard**: Copy data in JSON format for sharing

### Settings & Customization

- **Theme**: Choose between Light, Dark, or Auto (system) themes
- **Safety Settings**: Enable confirmations and auto-backup features
- **Advanced Options**: Clear all data or export extension settings

## 🏗️ Architecture

StorageFlow follows a modular architecture with clear separation of concerns:

### Component Structure

```
StorageFlow/
├── manifest.json          # Extension configuration
├── src/
│   ├── background/         # Service worker & background tasks
│   ├── content/           # Content script for page interaction
│   ├── popup/             # Main UI components
│   └── assets/            # Icons and static resources
└── docs/                  # Documentation (auto-generated)
```

### Technology Stack

- **Manifest V3**: Latest Chrome extension standard
- **Vanilla JavaScript**: No external dependencies for performance
- **Modular CSS**: Structured stylesheets with theme support
- **Chrome APIs**: Extensive use of storage, tabs, scripting, and contextMenus APIs

## 🛡️ Security & Privacy

StorageFlow is built with security and privacy as top priorities:

- **No External Connections**: All operations are performed locally
- **Minimal Permissions**: Only requests necessary permissions
- **Data Isolation**: Respects Chrome's security model
- **No Data Collection**: Zero tracking or analytics
- **Open Source**: Full transparency of all operations

## 🔧 Development

### Prerequisites

- Google Chrome (latest version)
- Basic understanding of JavaScript and Chrome Extensions
- Text editor or IDE

### Development Setup

1. Clone the repository
2. Load as unpacked extension in Chrome
3. Make changes to source files
4. Reload extension in `chrome://extensions/`

### File Structure

```
src/
├── background/
│   └── background.js      # Service worker, context menus, notifications
├── content/
│   └── content.js         # Page script injection, storage monitoring
├── popup/
│   ├── popup.html         # Main UI structure
│   ├── popup-controller.js # UI logic and state management
│   └── styles/            # Modular CSS architecture
└── assets/
    └── icons/             # Extension icons
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Contribution Guidelines

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Changelog

### Version 2.0.0 (Current)

- Complete rewrite with Manifest V3 support
- Modern UI with theme support
- Enhanced import/export functionality
- Cross-tab data transfer capabilities
- Improved error handling and user feedback
- Modular CSS architecture
- Comprehensive documentation

### Version 1.0.0

- Initial release with basic storage management
- Simple import/export functionality
- Basic UI implementation

## 🐛 Known Issues

- Import preview may not display correctly for very large files (>10MB)
- Cross-domain transfers require manual confirmation
- Some websites with strict CSP may limit functionality

## 📞 Support

If you encounter any issues or have questions:

1. Check the [documentation](./docs/) for detailed information
2. Search existing issues in the GitHub repository
3. Create a new issue with detailed description and steps to reproduce

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Font Awesome for beautiful icons
- Inter font family for clean typography
- Chrome Extension documentation and community
- All contributors and users providing feedback

---

**Made with ❤️ for developers and power users who need better browser storage tools.**

For detailed technical documentation, see the [docs](./docs/) directory.
