# Architecture Guide

This document provides a comprehensive overview of StorageFlow's technical architecture, design patterns, and implementation decisions.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [Design Patterns](#design-patterns)
- [Security Architecture](#security-architecture)
- [Performance Considerations](#performance-considerations)

## Architecture Overview

StorageFlow follows a **modular, event-driven architecture** built on Chrome Extension Manifest V3 principles.

### Core Architecture Principles

1. **Separation of Concerns**: Clear boundaries between UI, business logic, and data access
2. **Modular Design**: Independent, reusable components
3. **Event-Driven Communication**: Loose coupling through message passing
4. **Progressive Enhancement**: Graceful degradation when features are unavailable
5. **Security First**: Minimal permissions with robust input validation

### System Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Page      │    │  Content Script │    │ Background SW   │
│                 │    │                 │    │                 │
│ localStorage    │◄──►│ content.js      │◄──►│ background.js   │
│ sessionStorage  │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        ▲
                                │                        │
                                ▼                        │
                       ┌─────────────────┐               │
                       │  Extension Popup│               │
                       │                 │               │
                       │ popup.html      │               │
                       │ popup-controller│◄──────────────┘
                       │ CSS Modules     │
                       └─────────────────┘
```

## Component Architecture

### 1. Background Service Worker (`background.js`)

**Purpose**: Manages extension lifecycle, cross-tab communication, and system integration.

**Key Responsibilities**:

- Extension installation and setup
- Context menu creation and handling
- Cross-tab data transfer coordination
- Notification management
- Storage change monitoring
- Tab lifecycle management

**Architecture Pattern**: **Singleton Service**

```javascript
class LocalManagerBackground {
  constructor() {
    this.activeTabs = new Map();
    this.init();
  }

  // Service worker lifecycle management
  init() {
    /* ... */
  }

  // Message routing
  handleMessage(message, sender, sendResponse) {
    /* ... */
  }
}
```

**Communication Interfaces**:

- **Runtime Messages**: Bidirectional communication with popup and content scripts
- **Chrome APIs**: Direct integration with browser features
- **Storage Events**: Monitoring and logging storage changes

### 2. Content Script (`content.js`)

**Purpose**: Bridges web page storage with extension functionality.

**Key Responsibilities**:

- Direct localStorage/sessionStorage access
- Storage operation execution (get, set, remove, clear)
- Real-time change monitoring
- Page readiness detection
- Cross-origin security compliance

**Architecture Pattern**: **Adapter Pattern**

```javascript
// Adapts web page storage APIs for extension use
function getLocalStorageData() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    data[key] = localStorage.getItem(key);
  }
  return { success: true, data };
}
```

**Security Features**:

- Input validation and sanitization
- Error boundary implementation
- Storage quota monitoring
- Permission-based access control

### 3. Popup Interface (`popup.html` + `popup-controller.js`)

**Purpose**: Primary user interface for storage management operations.

**Architecture Pattern**: **Model-View-Controller (MVC)**

#### Controller Layer (`StorageFlowController`)

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

#### Modular Components

**ThemeManager**

- Theme switching logic
- System theme detection
- Persistent theme storage
- CSS class management

**StorageManager**

- Storage operation abstraction
- Data type detection
- Size calculation
- Value formatting

**ModalManager**

- Modal window lifecycle
- Form state management
- Validation handling

**ImportExport**

- File I/O operations
- Data serialization/deserialization
- Format validation
- Backup creation

### 4. CSS Architecture

**Modular CSS Structure**:

```
styles/
├── base.css          # Reset, variables, typography
├── utilities.css     # Utility classes (Tailwind-like)
├── layout.css        # Layout components, grid, flexbox
├── components.css    # UI components (buttons, cards, modals)
├── themes.css        # Theme-specific overrides
├── main.css          # Main stylesheet with imports
└── popup.css         # Legacy styles (being migrated)
```

**Design System Architecture**:

- **CSS Custom Properties**: Consistent theming and spacing
- **Component-Based Styling**: Reusable UI components
- **Utility-First Approach**: Atomic CSS classes
- **Theme Cascading**: Clean theme override system

## Data Flow

### 1. Storage Operation Flow

```
User Action → Controller → StorageManager → Content Script → Web Page Storage
     ↓                                                              ↓
Toast Notification ← UI Update ← Data Processing ← Response ← Storage API
```

### 2. Import/Export Flow

```
File Selection → Validation → Preview Generation → User Confirmation → Storage Update
      ↓               ↓              ↓                    ↓              ↓
 File Reader → JSON Parse → UI Render → Bulk Operations → Success Toast
```

### 3. Cross-Tab Transfer Flow

```
Source Tab Selection → Data Extraction → Background Worker → Target Tab Injection → Verification
         ↓                    ↓               ↓                    ↓              ↓
    Tab Query → Content Script → Message Queue → Content Script → Status Update
```

## Design Patterns

### 1. Observer Pattern

**Usage**: Theme changes, storage updates, tab navigation

```javascript
// Theme change observation
class ThemeManager {
  applyTheme(theme) {
    // Update CSS classes
    document.documentElement.className = theme;

    // Notify observers
    this.notifyThemeChange(theme);
  }
}
```

### 2. Command Pattern

**Usage**: Storage operations, bulk actions

```javascript
// Encapsulates storage operations as commands
class StorageCommand {
  constructor(operation, key, value) {
    this.operation = operation;
    this.key = key;
    this.value = value;
  }

  execute() {
    /* ... */
  }
  undo() {
    /* ... */
  }
}
```

### 3. Factory Pattern

**Usage**: Creating different storage managers, export formats

```javascript
// Creates appropriate storage manager based on mode
class StorageManagerFactory {
  static create(mode) {
    return mode === "localStorage"
      ? new LocalStorageManager()
      : new SessionStorageManager();
  }
}
```

### 4. Strategy Pattern

**Usage**: Import/export formats, validation strategies

```javascript
// Different validation strategies
class ValidationStrategy {
  static getValidator(type) {
    const strategies = {
      json: new JSONValidator(),
      csv: new CSVValidator(),
      xml: new XMLValidator(),
    };
    return strategies[type] || new DefaultValidator();
  }
}
```

### 5. Facade Pattern

**Usage**: Chrome API abstraction, complex operation simplification

```javascript
// Simplifies complex Chrome API interactions
class ChromeAPIFacade {
  async executeScript(tabId, func, args) {
    return chrome.scripting.executeScript({
      target: { tabId },
      func,
      args,
    });
  }
}
```

## Security Architecture

### 1. Permission Model

**Principle of Least Privilege**:

- Minimal required permissions only
- Runtime permission validation
- User-transparent operations

**Permission Usage**:

```json
{
  "activeTab": "Current tab storage access only",
  "storage": "Extension settings persistence",
  "scripting": "Content script injection for storage access",
  "contextMenus": "Right-click integration",
  "notifications": "User feedback",
  "downloads": "Export file creation"
}
```

### 2. Input Validation

**Multi-Layer Validation**:

1. **Client-Side**: UI input validation
2. **Content Script**: Data sanitization
3. **Background Script**: Operation validation
4. **Storage Layer**: Quota and size checks

```javascript
// Input validation example
function validateStorageKey(key) {
  if (!key || typeof key !== "string") {
    throw new Error("Invalid key: must be non-empty string");
  }
  if (key.length > 1024) {
    throw new Error("Key too long: maximum 1024 characters");
  }
  return true;
}
```

### 3. Content Security Policy

**CSP Implementation**:

- Strict script-src policies
- No eval() or inline scripts
- External resource validation
- XSS prevention measures

### 4. Cross-Origin Security

**Same-Origin Compliance**:

- Respects browser security model
- No cross-origin data access
- Domain-isolated operations
- Secure message passing

## Performance Considerations

### 1. Memory Management

**Efficient Data Handling**:

- Lazy loading of storage data
- Garbage collection of unused objects
- Memory-conscious data structures
- Pagination for large datasets

**Memory Optimization**:

```javascript
class StorageCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}
```

### 2. Asynchronous Operations

**Non-Blocking Architecture**:

- Promise-based API design
- Async/await patterns
- Background processing
- Progressive loading

**Performance Monitoring**:

```javascript
class PerformanceMonitor {
  static async measureOperation(name, operation) {
    const start = performance.now();
    const result = await operation();
    const duration = performance.now() - start;
    console.log(`${name}: ${duration}ms`);
    return result;
  }
}
```

### 3. DOM Optimization

**Efficient Rendering**:

- Virtual scrolling for large lists
- Batch DOM updates
- Event delegation
- Minimized reflows and repaints

### 4. Network Optimization

**Resource Efficiency**:

- Local resource caching
- Minimal external dependencies
- Compressed asset delivery
- Service worker caching

## Scalability Architecture

### 1. Modular Component System

**Component Isolation**:

- Independent module development
- Plugin-style architecture
- Feature flag support
- A/B testing capability

### 2. Configuration Management

**Environment-Aware Configuration**:

```javascript
const CONFIG = {
  development: {
    debug: true,
    logging: "verbose",
  },
  production: {
    debug: false,
    logging: "error",
  },
};
```

### 3. Extensibility Points

**Plugin Architecture**:

- Export format plugins
- Validation rule plugins
- Theme system plugins
- Custom operation handlers

## Testing Architecture

### 1. Unit Testing Strategy

**Component Testing**:

- Isolated component tests
- Mock dependencies
- State validation
- Error condition testing

### 2. Integration Testing

**Cross-Component Testing**:

- Message passing validation
- Chrome API integration
- End-to-end workflows
- Performance regression tests

### 3. Browser Testing

**Cross-Browser Validation**:

- Chrome version compatibility
- Chromium-based browser testing
- Extension API compatibility
- Performance benchmarking

---

For implementation details, see the [Development Guide](./development.md).  
For API reference, see the [API Reference](./api-reference.md).
