// Complete functional popup controller
console.log("Loading StorageFlow popup controller...");

// Storage modes
const STORAGE_MODES = {
  LOCAL: "localStorage",
  SESSION: "sessionStorage",
};

// Enhanced theme manager
class ThemeManager {
  constructor() {
    this.init();
  }

  async init() {
    // Load saved theme preference
    await this.loadTheme();

    // Set up system theme detection
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addListener(() => {
        if (this.currentTheme === "auto") {
          this.applyTheme("auto");
        }
      });
    }
  }

  async loadTheme() {
    try {
      const result = await chrome.storage.local.get("theme");
      this.currentTheme = result.theme || "light";
      this.applyTheme(this.currentTheme);
      this.updateThemeSelect();
    } catch (error) {
      console.log("Could not load theme preference, using light theme");
      this.currentTheme = "light";
      this.applyTheme("light");
    }
  }

  async saveTheme(theme) {
    try {
      await chrome.storage.local.set({ theme });
      this.currentTheme = theme;
    } catch (error) {
      console.log("Could not save theme preference");
    }
  }

  applyTheme(theme) {
    const html = document.documentElement;

    // Remove existing theme classes
    html.classList.remove("dark", "light");

    if (theme === "dark") {
      html.classList.add("dark");
    } else if (theme === "light") {
      html.classList.add("light");
    } else if (theme === "auto") {
      // Auto theme - use system preference
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        html.classList.add("dark");
      } else {
        html.classList.add("light");
      }
    }

    // Update toggle button icon
    const toggleIcon = document.querySelector("#themeToggle i");
    if (toggleIcon) {
      const isDark = html.classList.contains("dark");
      toggleIcon.className = isDark ? "fas fa-sun" : "fas fa-moon";
    }
  }

  updateThemeSelect() {
    const themeSelect = document.getElementById("themeSelect");
    if (themeSelect) {
      themeSelect.value = this.currentTheme;
    }
  }

  async setTheme(theme) {
    await this.saveTheme(theme);
    this.applyTheme(theme);
    this.updateThemeSelect();
  }

  // Legacy toggle method for the toggle button
  async toggleTheme() {
    const newTheme = this.currentTheme === "dark" ? "light" : "dark";
    await this.setTheme(newTheme);
  }
}

// Simple modal manager
class ModalManager {
  openEditModal(key = "", value = "") {
    const modal = document.getElementById("editModal");
    const keyInput = document.getElementById("itemKey");
    const valueInput = document.getElementById("itemValue");
    const modalTitle = modal.querySelector(".modal-header h3");
    const deleteBtn = document.getElementById("deleteBtn");

    if (modalTitle) {
      modalTitle.textContent = key ? "Edit Item" : "Add New Item";
    }

    if (keyInput) {
      keyInput.value = key;
      keyInput.readOnly = !!key; // Make key readonly when editing
    }

    if (valueInput) {
      valueInput.value = value;
    }

    if (deleteBtn) {
      deleteBtn.style.display = key ? "block" : "none";
    }

    modal.classList.remove("hidden");
  }

  closeModal() {
    const modal = document.getElementById("editModal");
    modal.classList.add("hidden");
  }
}

// Simple storage manager
class StorageManager {
  async loadStorageData(storageMode, currentTab) {
    if (!currentTab) {
      console.log("No current tab, skipping storage load");
      return {};
    }

    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: currentTab.id },
        func: (storageMode) => {
          const storage =
            storageMode === "localStorage" ? localStorage : sessionStorage;
          const data = {};

          for (let i = 0; i < storage.length; i++) {
            const key = storage.key(i);
            const value = storage.getItem(key);
            data[key] = value;
          }

          return data;
        },
        args: [storageMode],
      });

      const data = results[0]?.result || {};
      return data;
    } catch (error) {
      console.error("Failed to load storage data:", error);
      throw error;
    }
  }

  async setStorageItem(key, value, storageMode, currentTab) {
    if (!currentTab) throw new Error("No active tab");

    const results = await chrome.scripting.executeScript({
      target: { tabId: currentTab.id },
      func: (storageMode, key, value) => {
        const storage =
          storageMode === "localStorage" ? localStorage : sessionStorage;
        storage.setItem(key, value);
        return true;
      },
      args: [storageMode, key, value],
    });

    return results[0]?.result;
  }

  async removeStorageItem(key, storageMode, currentTab) {
    if (!currentTab) throw new Error("No active tab");

    const results = await chrome.scripting.executeScript({
      target: { tabId: currentTab.id },
      func: (storageMode, key) => {
        const storage =
          storageMode === "localStorage" ? localStorage : sessionStorage;
        storage.removeItem(key);
        return true;
      },
      args: [storageMode, key],
    });

    return results[0]?.result;
  }

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

  formatValue(value) {
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return value;
      }
    }
    return String(value);
  }
}

// Simple import/export manager
class ImportExport {
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

  showImportModal(callback) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        this.importFromFile(file, callback);
      }
    };
    input.click();
  }

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
      throw error;
    }
  }
}

class StorageFlowController {
  constructor() {
    this.currentMode = STORAGE_MODES.LOCAL;
    this.currentTab = null;
    this.storageData = {};
    this.selectedItems = new Set();
    this.searchTerm = "";
    this.activeTab = "manage";
    this.currentEditKey = null;

    // Import preview data
    this.pendingImportData = {};
    this.currentImportEditKey = null;

    // Initialize modular components
    this.storageManager = new StorageManager();
    this.modalManager = new ModalManager();
    this.themeManager = new ThemeManager();
    this.importExport = new ImportExport();

    console.log("StorageFlowController created");

    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.init());
    } else {
      this.init();
    }
  }

  async init() {
    console.log("StorageFlowController initializing...");

    try {
      // Get current tab
      await this.getCurrentTab();
      console.log("✓ Current tab retrieved");

      // Setup UI
      this.setupBasicUI();
      console.log("✓ Basic UI setup complete");

      // Setup event listeners
      this.setupEventListeners();
      console.log("✓ Event listeners setup complete");

      // Setup tab navigation
      this.setupTabNavigation();
      console.log("✓ Tab navigation setup complete");

      // Load storage data
      await this.loadStorageData();
      console.log("✓ Storage data loaded");

      // Load settings
      await this.loadSettings();
      console.log("✓ Settings loaded");

      // Initialize transfer tab UI
      this.updateTransferTabUI();
      console.log("✓ Transfer tab UI initialized");

      console.log("StorageFlowController initialized successfully");
      this.showToast("StorageFlow loaded successfully", "success");
    } catch (error) {
      console.error("Failed to initialize StorageFlowController:", error);
      this.showToast("Failed to load StorageFlow", "error");
    }
  }

  async getCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      this.currentTab = tab;
      console.log("Current tab:", tab);

      // Update tab display
      const tabElement = document.getElementById("currentTab");
      if (tabElement && tab) {
        const domain = new URL(tab.url).hostname;
        tabElement.textContent = domain || tab.title || "Unknown";
      }
    } catch (error) {
      console.error("Failed to get current tab:", error);
    }
  }

  setupBasicUI() {
    console.log("Setting up basic UI...");

    // Update storage mode UI
    this.updateStorageModeUI();

    // Show initial message
    const container = document.getElementById("storageItems");
    if (container) {
      container.innerHTML =
        '<div class="text-center text-gray-500 p-4">Loading storage data...</div>';
    }
  }

  setupEventListeners() {
    console.log("Setting up comprehensive event listeners...");

    // Storage toggle
    const storageToggle = document.getElementById("storageToggle");
    if (storageToggle) {
      console.log("Storage toggle found, adding listener");
      storageToggle.addEventListener("change", async (e) => {
        console.log("Storage toggle changed:", e.target.checked);
        await this.switchStorageMode();
      });
    } else {
      console.error("Storage toggle not found!");
    }

    // Search functionality
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchTerm = e.target.value;
        this.filterAndDisplayData();
      });
    }

    // Clear search
    const clearSearch = document.getElementById("clearSearch");
    if (clearSearch) {
      clearSearch.addEventListener("click", () => {
        this.clearSearch();
      });
    }

    // Add item button
    const addItemBtn = document.getElementById("addItemBtn");
    if (addItemBtn) {
      console.log("Add item button found, adding listener");
      addItemBtn.addEventListener("click", () => {
        console.log("Add item button clicked");
        this.showAddItemModal();
      });
    } else {
      console.error("Add item button not found!");
    }

    // Refresh button
    const refreshBtn = document.getElementById("refreshBtn");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", async () => {
        console.log("Refresh button clicked");
        await this.loadStorageData();
        this.showToast("Storage data refreshed", "success");
      });
    }

    // Export button
    const exportBtn = document.getElementById("exportBtn");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        console.log("Export button clicked");
        this.exportData();
      });
    }

    // Import button
    const importBtn = document.getElementById("importBtn");
    if (importBtn) {
      importBtn.addEventListener("click", () => {
        console.log("Import button clicked");
        this.showImportModal();
      });
    }

    // Copy all button
    const copyAllBtn = document.getElementById("copyAllBtn");
    if (copyAllBtn) {
      copyAllBtn.addEventListener("click", async () => {
        console.log("Copy all button clicked");
        await this.copyAllToClipboard();
      });
    }

    // Paste all button
    const pasteAllBtn = document.getElementById("pasteAllBtn");
    if (pasteAllBtn) {
      pasteAllBtn.addEventListener("click", () => {
        console.log("Paste all button clicked");
        this.showPasteInput();
      });
    }

    // Export selected button
    const exportSelectedBtn = document.getElementById("exportSelectedBtn");
    if (exportSelectedBtn) {
      exportSelectedBtn.addEventListener("click", () => {
        console.log("Export selected button clicked");
        this.exportSelectedData();
      });
    }

    // Delete selected button
    const deleteSelectedBtn = document.getElementById("deleteSelected");
    if (deleteSelectedBtn) {
      deleteSelectedBtn.addEventListener("click", async () => {
        console.log("Delete selected button clicked");
        await this.deleteSelectedItems();
      });
    }

    // Select all button
    const selectAllBtn = document.getElementById("selectAll");
    if (selectAllBtn) {
      selectAllBtn.addEventListener("click", () => {
        console.log("Select all button clicked");
        this.toggleSelectAll();
      });
    }

    // Theme toggle
    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", async () => {
        console.log("Theme toggle clicked");
        await this.themeManager.toggleTheme();
        this.showToast("Theme toggled", "info");
      });
    }

    // GitHub button in header
    const githubBtn = document.getElementById("githubBtn");
    if (githubBtn) {
      githubBtn.addEventListener("click", () => {
        console.log("GitHub button clicked");
        this.openExternalLink("https://github.com/StorageFlow/StorageFlow");
      });
    }

    // Theme select dropdown
    const themeSelect = document.getElementById("themeSelect");
    if (themeSelect) {
      themeSelect.addEventListener("change", async (e) => {
        console.log("Theme select changed:", e.target.value);
        await this.themeManager.setTheme(e.target.value);
        this.showToast(`Theme set to ${e.target.value}`, "info");
      });
    }

    // Advanced section buttons
    const clearStorageBtn = document.getElementById("clearStorage");
    if (clearStorageBtn) {
      clearStorageBtn.addEventListener("click", async () => {
        console.log("Clear storage button clicked");
        await this.clearAllStorage();
      });
    }

    const exportSettingsBtn = document.getElementById("exportSettingsBtn");
    if (exportSettingsBtn) {
      exportSettingsBtn.addEventListener("click", () => {
        console.log("Export settings button clicked");
        this.exportSettings();
      });
    }

    // Safety section checkboxes
    const confirmDeleteBox = document.getElementById("confirmDelete");
    if (confirmDeleteBox) {
      confirmDeleteBox.addEventListener("change", (e) => {
        console.log("Confirm delete setting changed:", e.target.checked);
        this.saveSetting("confirmDelete", e.target.checked);
      });
    }

    const autoBackupBox = document.getElementById("autoBackup");
    if (autoBackupBox) {
      autoBackupBox.addEventListener("change", (e) => {
        console.log("Auto backup setting changed:", e.target.checked);
        this.saveSetting("autoBackup", e.target.checked);
      });
    }

    // Social links in About section
    const githubLink = document.getElementById("githubLink");
    if (githubLink) {
      githubLink.addEventListener("click", () => {
        console.log("GitHub link clicked");
        this.openExternalLink("https://github.com/StorageFlow/StorageFlow");
      });
    }

    const issuesLink = document.getElementById("issuesLink");
    if (issuesLink) {
      issuesLink.addEventListener("click", () => {
        console.log("Issues link clicked");
        this.openExternalLink(
          "https://github.com/StorageFlow/StorageFlow/issues"
        );
      });
    }

    const documentationLink = document.getElementById("documentationLink");
    if (documentationLink) {
      documentationLink.addEventListener("click", () => {
        console.log("Documentation link clicked");
        this.openExternalLink(
          "https://github.com/StorageFlow/StorageFlow/wiki"
        );
      });
    }

    // Transfer tab buttons
    this.setupTransferTabEventListeners();

    // Modal buttons
    this.setupModalEventListeners();

    // Event delegation for dynamically created buttons
    this.setupEventDelegation();
  }

  setupEventDelegation() {
    const storageContainer = document.getElementById("storageItems");
    if (storageContainer) {
      storageContainer.addEventListener("click", (e) => {
        // Check if the clicked element or its parent is a button
        const target = e.target.closest("button");
        if (!target) return;

        // Prevent the event from bubbling up
        e.stopPropagation();
        e.preventDefault();

        const key = target.dataset.key;
        if (!key) {
          console.warn("Button clicked but no data-key found:", target);
          return;
        }

        console.log("Button clicked:", target.className, "for key:", key);

        if (target.classList.contains("edit-btn")) {
          console.log("Edit button clicked for key:", key);
          this.editItem(key);
        } else if (target.classList.contains("copy-btn")) {
          console.log("Copy button clicked for key:", key);
          this.copyItem(key);
        } else if (target.classList.contains("delete-btn")) {
          console.log("Delete button clicked for key:", key);
          this.deleteItem(key);
        }
      });
    } else {
      console.error("storageItems container not found for event delegation");
    }
  }

  updateTransferTabUI() {
    // Update selected items count in transfer tab
    const transferSelectedCount = document.querySelector(
      "#transfer-tab #selectedCount"
    );
    if (transferSelectedCount) {
      transferSelectedCount.textContent = `${this.selectedItems.size} items selected`;
    }

    // Enable/disable buttons based on selection
    const copySelectedClipboardBtn = document.getElementById(
      "copySelectedClipboardBtn"
    );
    const exportSelectedBtn = document.getElementById("exportSelectedBtn");

    if (copySelectedClipboardBtn) {
      copySelectedClipboardBtn.disabled = this.selectedItems.size === 0;
      if (this.selectedItems.size === 0) {
        copySelectedClipboardBtn.style.opacity = "0.5";
        copySelectedClipboardBtn.style.cursor = "not-allowed";
      } else {
        copySelectedClipboardBtn.style.opacity = "1";
        copySelectedClipboardBtn.style.cursor = "pointer";
      }
    }

    if (exportSelectedBtn) {
      exportSelectedBtn.disabled = this.selectedItems.size === 0;
      if (this.selectedItems.size === 0) {
        exportSelectedBtn.style.opacity = "0.5";
        exportSelectedBtn.style.cursor = "not-allowed";
      } else {
        exportSelectedBtn.style.opacity = "1";
        exportSelectedBtn.style.cursor = "pointer";
      }
    }
  }

  async switchStorageMode() {
    console.log("Switching storage mode from:", this.currentMode);

    const wasLocal = this.currentMode === STORAGE_MODES.LOCAL;
    const oldMode = this.currentMode;
    this.currentMode = wasLocal ? STORAGE_MODES.SESSION : STORAGE_MODES.LOCAL;

    console.log("Switched to:", this.currentMode);

    // Update UI
    this.updateStorageModeUI();

    // Reload data
    await this.loadStorageData();

    // Show toast notification
    const modeText =
      this.currentMode === STORAGE_MODES.LOCAL
        ? "Local Storage"
        : "Session Storage";
    this.showToast(`Switched to ${modeText}`, "success");
  }

  updateStorageModeUI() {
    const toggle = document.getElementById("storageToggle");
    const localLabel = document.getElementById("localLabel");
    const sessionLabel = document.getElementById("sessionLabel");

    if (toggle) {
      toggle.checked = this.currentMode === STORAGE_MODES.SESSION;
      console.log("Toggle updated:", toggle.checked);
    }

    if (localLabel && sessionLabel) {
      localLabel.classList.toggle(
        "active",
        this.currentMode === STORAGE_MODES.LOCAL
      );
      sessionLabel.classList.toggle(
        "active",
        this.currentMode === STORAGE_MODES.SESSION
      );
      console.log(
        "Labels updated - Local active:",
        this.currentMode === STORAGE_MODES.LOCAL
      );
    }
  }

  async loadStorageData() {
    console.log("Loading storage data for mode:", this.currentMode);

    if (!this.currentTab) {
      console.log("No current tab, skipping storage load");
      return;
    }

    try {
      this.storageData = await this.storageManager.loadStorageData(
        this.currentMode,
        this.currentTab
      );
      this.displayStorageData(this.storageData);

      // Update transfer tab UI if it's active
      if (this.activeTab === "transfer") {
        this.updateTransferTabUI();
      }
    } catch (error) {
      console.error("Failed to load storage data:", error);
      this.displayError("Failed to load storage data: " + error.message);
    }
  }

  setupTabNavigation() {
    const tabButtons = document.querySelectorAll(".nav-tab");

    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const targetTab = button.dataset.tab;
        this.switchTab(targetTab);
      });
    });
  }

  switchTab(tabId) {
    this.activeTab = tabId;

    // Update tab buttons
    document.querySelectorAll(".nav-tab").forEach((tab) => {
      tab.classList.remove("active");
    });
    const targetTab = document.querySelector(`[data-tab="${tabId}"]`);
    if (targetTab) targetTab.classList.add("active");

    // Update tab contents
    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.add("hidden");
    });
    const targetContent = document.getElementById(`${tabId}-tab`);
    if (targetContent) targetContent.classList.remove("hidden");

    // Update transfer tab data if switching to transfer tab
    if (tabId === "transfer") {
      this.updateTransferTabUI();
    }

    console.log(`Switched to ${tabId} tab`);
  }

  setupModalEventListeners() {
    // Save button
    const saveBtn = document.getElementById("saveBtn");
    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        this.saveItem();
      });
    }

    // Cancel button
    const cancelBtn = document.getElementById("cancelBtn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        this.modalManager.closeModal();
      });
    }

    // Close modal button
    const closeModalBtn = document.getElementById("closeModal");
    if (closeModalBtn) {
      closeModalBtn.addEventListener("click", () => {
        this.modalManager.closeModal();
      });
    }

    // Delete button
    const deleteBtn = document.getElementById("deleteBtn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        this.deleteCurrentItem();
      });
    }

    // Process paste button
    const processPasteBtn = document.getElementById("processPasteBtn");
    if (processPasteBtn) {
      processPasteBtn.addEventListener("click", () => {
        this.processPasteInput();
      });
    }

    // Cancel paste button
    const cancelPasteBtn = document.getElementById("cancelPasteBtn");
    if (cancelPasteBtn) {
      cancelPasteBtn.addEventListener("click", () => {
        this.hidePasteInput();
      });
    }

    // Close paste modal button
    const closePasteModal = document.getElementById("closePasteModal");
    if (closePasteModal) {
      closePasteModal.addEventListener("click", () => {
        this.hidePasteInput();
      });
    }
  }

  setupTransferTabEventListeners() {
    console.log("Setting up transfer tab event listeners...");

    // Copy all to clipboard button
    const copyAllClipboardBtn = document.getElementById("copyAllClipboardBtn");
    if (copyAllClipboardBtn) {
      copyAllClipboardBtn.addEventListener("click", async () => {
        console.log("Copy all to clipboard button clicked");
        await this.copyAllToClipboard();
      });
    }

    // Copy selected to clipboard button
    const copySelectedClipboardBtn = document.getElementById(
      "copySelectedClipboardBtn"
    );
    if (copySelectedClipboardBtn) {
      copySelectedClipboardBtn.addEventListener("click", async () => {
        console.log("Copy selected to clipboard button clicked");
        await this.copySelectedToClipboard();
      });
    }

    // File upload area click and drag-drop
    const fileUpload = document.getElementById("fileUpload");
    const fileInput = document.getElementById("fileInput");

    if (fileUpload && fileInput) {
      // Click to browse files
      fileUpload.addEventListener("click", () => {
        console.log("File upload area clicked");
        fileInput.click();
      });

      // File input change
      fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          console.log("File selected:", file.name);
          this.handleFileImport(file);
        }
      });

      // Drag and drop functionality
      this.setupFileDropArea(fileUpload, fileInput);
    }

    // Import preview buttons
    const confirmImportBtn = document.getElementById("confirmImportBtn");
    if (confirmImportBtn) {
      confirmImportBtn.addEventListener("click", async () => {
        console.log("Confirm import button clicked");
        await this.confirmImport();
      });
    }

    const cancelImportBtn = document.getElementById("cancelImportBtn");
    if (cancelImportBtn) {
      cancelImportBtn.addEventListener("click", () => {
        console.log("Cancel import button clicked");
        this.cancelImport();
      });
    }

    // Import edit modal buttons
    this.setupImportEditModal();
  }

  setupFileDropArea(dropArea, fileInput) {
    console.log("Setting up file drop area...");

    dropArea.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropArea.classList.add("dragover");
    });

    dropArea.addEventListener("dragleave", (e) => {
      e.preventDefault();
      // Only remove dragover if we're actually leaving the drop area
      if (!dropArea.contains(e.relatedTarget)) {
        dropArea.classList.remove("dragover");
      }
    });

    dropArea.addEventListener("drop", (e) => {
      e.preventDefault();
      dropArea.classList.remove("dragover");

      const files = Array.from(e.dataTransfer.files);
      const jsonFile = files.find(
        (file) =>
          file.type === "application/json" || file.name.endsWith(".json")
      );

      if (jsonFile) {
        console.log("JSON file dropped:", jsonFile.name);
        this.handleFileImport(jsonFile);
      } else if (files.length > 0) {
        this.showToast("Please drop a JSON file", "warning");
      } else {
        this.showToast("No files detected", "warning");
      }
    });
  }

  async handleFileImport(file) {
    try {
      console.log("Handling file import:", file.name);

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.showToast("File too large. Maximum size is 10MB", "error");
        return;
      }

      // Read and parse the file
      const text = await file.text();

      if (!text.trim()) {
        this.showToast("File is empty", "error");
        return;
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        this.showToast("Invalid JSON format", "error");
        return;
      }

      let importData = data;

      // Handle different export formats
      if (data.data && typeof data.data === "object") {
        importData = data.data; // Extract data from StorageFlow export format
      } else if (data.version && data.storageMode && data.data) {
        importData = data.data; // Handle versioned export format
      }

      // Validate that we have an object with string keys
      if (
        typeof importData !== "object" ||
        importData === null ||
        Array.isArray(importData)
      ) {
        this.showToast(
          "Invalid data format. Expected JSON object with key-value pairs",
          "error"
        );
        return;
      }

      const keys = Object.keys(importData);
      if (keys.length === 0) {
        this.showToast("No data found in file", "warning");
        return;
      }

      // Store pending import data and show preview
      this.pendingImportData = importData;
      this.showImportPreview(importData);
    } catch (error) {
      console.error("File import failed:", error);
      this.showToast("Failed to read file: " + error.message, "error");
    }
  }

  setupImportEditModal() {
    const saveImportEditBtn = document.getElementById("saveImportEditBtn");
    if (saveImportEditBtn) {
      saveImportEditBtn.addEventListener("click", () => {
        this.saveImportEdit();
      });
    }

    const cancelImportEditBtn = document.getElementById("cancelImportEditBtn");
    if (cancelImportEditBtn) {
      cancelImportEditBtn.addEventListener("click", () => {
        this.closeImportEditModal();
      });
    }

    const closeImportEditModal = document.getElementById(
      "closeImportEditModal"
    );
    if (closeImportEditModal) {
      closeImportEditModal.addEventListener("click", () => {
        this.closeImportEditModal();
      });
    }

    const deleteImportItemBtn = document.getElementById("deleteImportItemBtn");
    if (deleteImportItemBtn) {
      deleteImportItemBtn.addEventListener("click", () => {
        this.deleteImportItem();
      });
    }
  }

  showImportPreview(data) {
    const previewSection = document.getElementById("importPreview");
    const previewContainer = document.getElementById("importPreviewContainer");
    const initialControls = document.getElementById("initialImportControls");

    if (!previewSection || !previewContainer) return;

    // Hide initial import button and show preview
    if (initialControls) initialControls.classList.add("hidden");
    previewSection.classList.remove("hidden");

    // Generate preview HTML
    const itemsHtml = Object.entries(data)
      .map(
        ([key, value]) => `
        <div class="import-preview-item border-b border-gray-200 p-3 hover:bg-gray-50" data-key="${this.escapeHtml(
          key
        )}">
          <div class="flex items-center justify-between mb-2">
            <strong class="flex-1 text-sm font-medium text-gray-900 truncate mr-3">${this.escapeHtml(
              key
            )}</strong>
            <div class="flex gap-2">
              <button class="action-btn edit-import-btn" data-key="${this.escapeHtml(
                key
              )}" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button class="action-btn delete-import-btn" data-key="${this.escapeHtml(
                key
              )}" title="Remove">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <div class="text-sm text-gray-600 bg-gray-50 p-2 rounded border max-h-16 overflow-y-auto">
            <div class="font-mono text-xs">${this.escapeHtml(
              this.storageManager.formatValue(value)
            )}</div>
          </div>
          <div class="text-xs text-gray-400 mt-1 flex justify-between">
            <span>${this.storageManager.getValueType(value)}</span>
            <span>${this.storageManager.calculateSize(value)}</span>
          </div>
        </div>
      `
      )
      .join("");

    previewContainer.innerHTML = itemsHtml;

    // Add event listeners for edit and delete buttons
    this.setupImportPreviewEventListeners();

    this.showToast(
      `Preview ready: ${Object.keys(data).length} items to import`,
      "info"
    );
  }

  setupImportPreviewEventListeners() {
    const previewContainer = document.getElementById("importPreviewContainer");
    if (!previewContainer) return;

    previewContainer.addEventListener("click", (e) => {
      const target = e.target.closest("button");
      if (!target) return;

      e.stopPropagation();
      e.preventDefault();

      const key = target.dataset.key;
      if (!key) return;

      if (target.classList.contains("edit-import-btn")) {
        this.editImportItem(key);
      } else if (target.classList.contains("delete-import-btn")) {
        this.removeImportItem(key);
      }
    });
  }

  editImportItem(key) {
    const value = this.pendingImportData[key];
    if (value === undefined) return;

    this.currentImportEditKey = key;

    const modal = document.getElementById("importEditModal");
    const keyInput = document.getElementById("importItemKey");
    const valueInput = document.getElementById("importItemValue");

    if (keyInput) keyInput.value = key;
    if (valueInput) valueInput.value = this.storageManager.formatValue(value);

    if (modal) modal.classList.remove("hidden");
  }

  saveImportEdit() {
    const keyInput = document.getElementById("importItemKey");
    const valueInput = document.getElementById("importItemValue");

    if (!keyInput || !valueInput || !this.currentImportEditKey) return;

    const newKey = keyInput.value.trim();
    const newValue = valueInput.value;

    if (!newKey) {
      this.showToast("Key cannot be empty", "error");
      return;
    }

    // Remove old key if it changed
    if (newKey !== this.currentImportEditKey) {
      delete this.pendingImportData[this.currentImportEditKey];
    }

    // Add new/updated value
    this.pendingImportData[newKey] = newValue;

    this.closeImportEditModal();
    this.showImportPreview(this.pendingImportData);
    this.showToast("Import item updated", "success");
  }

  deleteImportItem() {
    if (!this.currentImportEditKey) return;

    const confirmed = confirm(
      `Remove "${this.currentImportEditKey}" from import?`
    );
    if (!confirmed) return;

    delete this.pendingImportData[this.currentImportEditKey];
    this.closeImportEditModal();
    this.showImportPreview(this.pendingImportData);
    this.showToast("Item removed from import", "success");
  }

  removeImportItem(key) {
    const confirmed = confirm(`Remove "${key}" from import?`);
    if (!confirmed) return;

    delete this.pendingImportData[key];
    this.showImportPreview(this.pendingImportData);
    this.showToast("Item removed from import", "success");
  }

  closeImportEditModal() {
    const modal = document.getElementById("importEditModal");
    if (modal) modal.classList.add("hidden");
    this.currentImportEditKey = null;
  }

  async confirmImport() {
    try {
      const keys = Object.keys(this.pendingImportData);
      if (keys.length === 0) {
        this.showToast("No items to import", "warning");
        return;
      }

      const overwriteExisting =
        document.getElementById("overwriteExisting")?.checked ?? true;
      const backupBeforeImport =
        document.getElementById("backupBeforeImport")?.checked ?? false;

      // Create backup if requested
      if (backupBeforeImport) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const backupData = { ...this.storageData };
        this.importExport.exportDataToFile(
          backupData,
          this.currentTab,
          this.currentMode,
          `backup-${timestamp}`
        );
      }

      let importedCount = 0;
      let skippedCount = 0;

      for (const [key, value] of Object.entries(this.pendingImportData)) {
        // Check if key exists and overwrite is disabled
        if (!overwriteExisting && this.storageData[key] !== undefined) {
          skippedCount++;
          continue;
        }

        await this.storageManager.setStorageItem(
          key,
          value,
          this.currentMode,
          this.currentTab
        );
        importedCount++;
      }

      // Reload storage data and hide preview
      await this.loadStorageData();
      this.cancelImport();

      let message = `Imported ${importedCount} items`;
      if (skippedCount > 0) {
        message += `, skipped ${skippedCount} existing items`;
      }
      this.showToast(message, "success");
    } catch (error) {
      console.error("Import failed:", error);
      this.showToast("Import failed: " + error.message, "error");
    }
  }

  cancelImport() {
    const previewSection = document.getElementById("importPreview");
    const initialControls = document.getElementById("initialImportControls");
    const fileInput = document.getElementById("fileInput");

    if (previewSection) previewSection.classList.add("hidden");
    if (initialControls) initialControls.classList.remove("hidden");
    if (fileInput) fileInput.value = ""; // Clear file input

    this.pendingImportData = {};
    this.showToast("Import cancelled", "info");
  }

  displayStorageData(data) {
    const container = document.getElementById("storageItems");
    if (!container) return;

    if (!data || Object.keys(data).length === 0) {
      container.innerHTML = `
        <div class="empty-state text-center p-8">
          <i class="fas fa-database text-4xl text-gray-400 mb-4"></i>
          <h3 class="text-lg font-medium text-gray-700 mb-2">No storage data found</h3>
          <p class="text-gray-500">Add some data to ${this.currentMode} to get started</p>
        </div>
      `;
      this.updateStats();
      return;
    }

    // Filter data if search term exists
    const filteredData = this.filterData(data);

    const itemsHtml = Object.entries(filteredData)
      .map(
        ([key, value]) => `
      <div class="storage-item border rounded-lg p-4 mb-3 bg-white shadow-sm" data-key="${this.escapeHtml(
        key
      )}">
        <div class="flex items-center justify-between mb-2">
          <input type="checkbox" class="item-checkbox mr-3" data-key="${this.escapeHtml(
            key
          )}">
          <strong class="flex-1 text-sm font-medium text-gray-900 truncate mr-3">${this.escapeHtml(
            key
          )}</strong>
          <div class="flex gap-2">
            <button class="action-btn edit-btn" data-key="${this.escapeHtml(
              key
            )}" title="Edit">
              <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn copy-btn" data-key="${this.escapeHtml(
              key
            )}" title="Copy">
              <i class="fas fa-copy"></i>
            </button>
            <button class="action-btn delete-btn" data-key="${this.escapeHtml(
              key
            )}" title="Delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="text-sm text-gray-600 bg-gray-50 p-2 rounded border max-h-24 overflow-y-auto">
          <div class="font-mono text-xs">${this.escapeHtml(
            this.storageManager.formatValue(value)
          )}</div>
        </div>
        <div class="text-xs text-gray-400 mt-1 flex justify-between">
          <span>${this.storageManager.getValueType(value)}</span>
          <span>${this.storageManager.calculateSize(value)}</span>
        </div>
      </div>
    `
      )
      .join("");

    container.innerHTML = itemsHtml;

    // Setup checkbox listeners
    this.setupItemCheckboxes();

    // Update stats
    this.updateStats();

    console.log("Storage items displayed:", Object.keys(filteredData).length);
  }

  setupItemCheckboxes() {
    const checkboxes = document.querySelectorAll(".item-checkbox");
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        const key = e.target.dataset.key;
        const item = e.target.closest(".storage-item");

        if (e.target.checked) {
          this.selectedItems.add(key);
          item.classList.add("selected");
        } else {
          this.selectedItems.delete(key);
          item.classList.remove("selected");
        }

        this.updateBulkActionsVisibility();
        this.updateSelectAllState();

        // Also update transfer tab UI if it's active
        if (this.activeTab === "transfer") {
          this.updateTransferTabUI();
        }
      });
    });
  }

  filterData(data) {
    if (!this.searchTerm || this.searchTerm.trim() === "") {
      return data;
    }

    const term = this.searchTerm.toLowerCase();
    const filtered = {};

    Object.entries(data).forEach(([key, value]) => {
      if (
        key.toLowerCase().includes(term) ||
        String(value).toLowerCase().includes(term)
      ) {
        filtered[key] = value;
      }
    });

    return filtered;
  }

  async filterAndDisplayData() {
    this.displayStorageData(this.storageData);
  }

  clearSearch() {
    this.searchTerm = "";
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.value = "";
    }
    this.filterAndDisplayData();
  }

  toggleSelectAll() {
    const checkboxes = document.querySelectorAll(".item-checkbox");
    const allChecked = Array.from(checkboxes).every((cb) => cb.checked);

    checkboxes.forEach((checkbox) => {
      const key = checkbox.dataset.key;
      const item = checkbox.closest(".storage-item");

      if (allChecked) {
        checkbox.checked = false;
        this.selectedItems.delete(key);
        item.classList.remove("selected");
      } else {
        checkbox.checked = true;
        this.selectedItems.add(key);
        item.classList.add("selected");
      }
    });

    this.updateBulkActionsVisibility();
    this.updateSelectAllState();

    // Also update transfer tab UI if it's active
    if (this.activeTab === "transfer") {
      this.updateTransferTabUI();
    }
  }

  async deleteSelectedItems() {
    if (this.selectedItems.size === 0) {
      this.showToast("No items selected", "warning");
      return;
    }

    const confirmed = confirm(
      `Delete ${this.selectedItems.size} selected items?`
    );
    if (!confirmed) return;

    try {
      for (const key of this.selectedItems) {
        await this.storageManager.removeStorageItem(
          key,
          this.currentMode,
          this.currentTab
        );
      }

      this.selectedItems.clear();
      await this.loadStorageData();
      this.showToast("Selected items deleted successfully", "success");
    } catch (error) {
      console.error("Failed to delete items:", error);
      this.showToast("Failed to delete items", "error");
    }
  }

  exportSelectedData() {
    if (this.selectedItems.size === 0) {
      this.showToast("No items selected", "warning");
      return;
    }

    const selectedData = {};
    for (const key of this.selectedItems) {
      if (this.storageData[key] !== undefined) {
        selectedData[key] = this.storageData[key];
      }
    }

    this.importExport.exportDataToFile(
      selectedData,
      this.currentTab,
      this.currentMode,
      `selected-${this.selectedItems.size}-items`
    );
    this.showToast("Selected data exported successfully", "success");
  }

  showAddItemModal() {
    this.modalManager.openEditModal();
  }

  async saveItem() {
    const keyInput = document.getElementById("itemKey");
    const valueInput = document.getElementById("itemValue");

    if (!keyInput || !valueInput) return;

    const key = keyInput.value.trim();
    const value = valueInput.value;

    if (!key) {
      this.showToast("Key cannot be empty", "error");
      return;
    }

    try {
      await this.storageManager.setStorageItem(
        key,
        value,
        this.currentMode,
        this.currentTab
      );
      await this.loadStorageData();
      this.modalManager.closeModal();
      this.showToast(
        this.currentEditKey ? "Item updated" : "Item added",
        "success"
      );
    } catch (error) {
      console.error("Failed to save item:", error);
      this.showToast("Failed to save item", "error");
    }
  }

  async deleteCurrentItem() {
    if (!this.currentEditKey) return;

    const confirmed = confirm(`Delete "${this.currentEditKey}"?`);
    if (!confirmed) return;

    try {
      await this.storageManager.removeStorageItem(
        this.currentEditKey,
        this.currentMode,
        this.currentTab
      );
      await this.loadStorageData();
      this.modalManager.closeModal();
      this.showToast("Item deleted", "success");
    } catch (error) {
      console.error("Failed to delete item:", error);
      this.showToast("Failed to delete item", "error");
    }
  }

  async editItem(key) {
    console.log("editItem called with key:", key);
    const value = this.storageData[key] || "";
    this.currentEditKey = key;
    this.modalManager.openEditModal(key, value);
  }

  async copyItem(key) {
    console.log("copyItem called with key:", key);
    const value = this.storageData[key];
    if (value === undefined) {
      console.warn("No value found for key:", key);
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      this.showToast("Value copied to clipboard", "success");
    } catch (error) {
      console.error("Failed to copy:", error);
      this.showToast("Failed to copy to clipboard", "error");
    }
  }

  async deleteItem(key) {
    console.log("deleteItem called with key:", key);
    const confirmed = confirm(`Delete "${key}"?`);
    if (!confirmed) {
      console.log("User cancelled delete");
      return;
    }

    try {
      await this.storageManager.removeStorageItem(
        key,
        this.currentMode,
        this.currentTab
      );
      await this.loadStorageData();
      this.showToast("Item deleted", "success");
    } catch (error) {
      console.error("Failed to delete item:", error);
      this.showToast("Failed to delete item", "error");
    }
  }

  exportData() {
    this.importExport.exportDataToFile(
      this.storageData,
      this.currentTab,
      this.currentMode,
      "all-data"
    );
    this.showToast("Data exported successfully", "success");
  }

  showImportModal() {
    // Use the file input directly for better integration with preview
    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
      fileInput.click();
    }
  }

  async importFromData(data) {
    try {
      const keys = Object.keys(data);
      const confirmed = confirm(
        `Import ${keys.length} items? This will overwrite existing keys.`
      );
      if (!confirmed) return;

      for (const [key, value] of Object.entries(data)) {
        await this.storageManager.setStorageItem(
          key,
          value,
          this.currentMode,
          this.currentTab
        );
      }

      await this.loadStorageData();
      this.showToast(`Imported ${keys.length} items`, "success");
    } catch (error) {
      console.error("Import failed:", error);
      this.showToast("Import failed: Invalid file format", "error");
    }
  }

  async copyAllToClipboard() {
    try {
      const exportData = {
        version: "2.0",
        timestamp: new Date().toISOString(),
        domain: this.currentTab
          ? new URL(this.currentTab.url).hostname
          : "unknown",
        storageMode: this.currentMode,
        data: this.storageData,
      };

      await navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
      this.showToast("All data copied to clipboard", "success");
    } catch (error) {
      console.error("Failed to copy:", error);
      this.showToast("Failed to copy to clipboard", "error");
    }
  }

  async copySelectedToClipboard() {
    if (this.selectedItems.size === 0) {
      this.showToast("No items selected", "warning");
      return;
    }

    try {
      const selectedData = {};
      for (const key of this.selectedItems) {
        if (this.storageData[key] !== undefined) {
          selectedData[key] = this.storageData[key];
        }
      }

      const exportData = {
        version: "2.0",
        timestamp: new Date().toISOString(),
        domain: this.currentTab
          ? new URL(this.currentTab.url).hostname
          : "unknown",
        storageMode: this.currentMode,
        data: selectedData,
      };

      await navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
      this.showToast(
        `${this.selectedItems.size} selected items copied to clipboard`,
        "success"
      );
    } catch (error) {
      console.error("Failed to copy selected:", error);
      this.showToast("Failed to copy to clipboard", "error");
    }
  }

  showPasteInput() {
    const pasteModal = document.getElementById("pasteInputArea");
    const pasteInput = document.getElementById("pasteInput");

    if (pasteModal) {
      pasteModal.classList.remove("hidden");
    }

    if (pasteInput) {
      pasteInput.value = "";
      pasteInput.focus();
    }
  }

  hidePasteInput() {
    const pasteModal = document.getElementById("pasteInputArea");
    const pasteInput = document.getElementById("pasteInput");

    if (pasteModal) {
      pasteModal.classList.add("hidden");
    }

    if (pasteInput) {
      pasteInput.value = "";
    }
  }

  async processPasteInput() {
    const textarea = document.getElementById("pasteInput");
    if (!textarea) return;

    const text = textarea.value.trim();
    if (!text) {
      this.showToast("No data to paste", "warning");
      return;
    }

    try {
      const data = JSON.parse(text);
      let importData = data;

      if (data.data && typeof data.data === "object") {
        importData = data.data;
      }

      await this.importFromData(importData);
      this.hidePasteInput();
      textarea.value = "";
    } catch (error) {
      console.error("Paste failed:", error);
      this.showToast("Paste failed: Invalid JSON format", "error");
    }
  }

  updateStats() {
    const totalKeys = document.getElementById("totalKeys");
    const storageUsed = document.getElementById("storageUsed");

    const data = this.filterData(this.storageData);
    const count = Object.keys(data).length;
    const size = this.storageManager.calculateSize(JSON.stringify(data));

    if (totalKeys) totalKeys.textContent = count;
    if (storageUsed) storageUsed.textContent = size;
  }

  updateBulkActionsVisibility() {
    // Update manage tab bulk actions
    const bulkActions = document.getElementById("bulkActions");
    const manageSelectedCount = document.getElementById("selectedCount");

    if (bulkActions && manageSelectedCount) {
      if (this.selectedItems.size > 0) {
        bulkActions.classList.remove("hidden");
        manageSelectedCount.textContent = `${this.selectedItems.size} selected`;
      } else {
        bulkActions.classList.add("hidden");
      }
    }

    // Update transfer tab selected count
    const transferSelectedCount = document.querySelector(
      "#transfer-tab #selectedCount"
    );
    if (transferSelectedCount) {
      transferSelectedCount.textContent = `${this.selectedItems.size} items selected`;
    }
  }

  updateSelectAllState() {
    const selectAllBtn = document.getElementById("selectAll");
    if (selectAllBtn) {
      const allCheckboxes = document.querySelectorAll(".item-checkbox");
      const checkedBoxes = document.querySelectorAll(".item-checkbox:checked");

      if (allCheckboxes.length === 0) {
        selectAllBtn.textContent = "Select All";
      } else if (checkedBoxes.length === allCheckboxes.length) {
        selectAllBtn.textContent = "Deselect All";
      } else {
        selectAllBtn.textContent = "Select All";
      }
    }
  }

  displayError(message) {
    const container = document.getElementById("storageItems");
    if (container) {
      container.innerHTML = `
        <div class="error-state text-center p-8">
          <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
          <h3 class="text-lg font-medium text-red-700 mb-2">Error</h3>
          <p class="text-red-600">${this.escapeHtml(message)}</p>
        </div>
      `;
    }
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  openExternalLink(url) {
    try {
      // Open link in new tab
      chrome.tabs.create({ url: url });
      this.showToast("Opening link in new tab", "info");
    } catch (error) {
      console.error("Failed to open external link:", error);
      // Fallback: try to open with window.open
      try {
        window.open(url, "_blank", "noopener,noreferrer");
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        this.showToast("Failed to open link", "error");
      }
    }
  }

  showToast(message, type = "info") {
    // Create toast element directly and append to body for proper centering
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    // Set initial animation state - ensure proper centering
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(100%)";
    toast.style.transition = "all 0.3s ease-out";

    // Ensure proper positioning
    toast.style.position = "fixed";
    toast.style.bottom = "1rem";
    toast.style.left = "50%";
    toast.style.zIndex = "1000";

    const icons = {
      success: "fas fa-check-circle",
      error: "fas fa-exclamation-circle",
      warning: "fas fa-exclamation-triangle",
      info: "fas fa-info-circle",
    };

    toast.innerHTML = `
      <i class="${icons[type] || icons.info}"></i>
      <span>${this.escapeHtml(message)}</span>
    `;

    // Append to body for proper CSS positioning
    document.body.appendChild(toast);

    // Trigger animation while maintaining centering
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateX(-50%) translateY(0)";
    });

    // Auto remove after 3 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(-50%) translateY(100%)";
        setTimeout(() => {
          if (toast.parentNode) {
            toast.remove();
          }
        }, 300); // Wait for animation to complete
      }
    }, 3000);
  }

  // Advanced settings methods
  async clearAllStorage() {
    const confirmed = confirm(
      `⚠️ WARNING: This will permanently delete ALL ${
        this.currentMode === STORAGE_MODES.LOCAL
          ? "localStorage"
          : "sessionStorage"
      } data for this website.\n\nThis action cannot be undone!\n\nAre you sure you want to continue?`
    );

    if (!confirmed) {
      this.showToast("Clear storage cancelled", "info");
      return;
    }

    // Double confirmation for safety
    const doubleConfirmed = confirm(
      "🚨 FINAL WARNING: You are about to delete ALL storage data!\n\nClick OK to proceed or Cancel to abort."
    );

    if (!doubleConfirmed) {
      this.showToast("Clear storage cancelled", "info");
      return;
    }

    try {
      if (!this.currentTab) {
        throw new Error("No active tab");
      }

      // Execute storage clear on the current tab
      await chrome.scripting.executeScript({
        target: { tabId: this.currentTab.id },
        func: (storageMode) => {
          const storage =
            storageMode === "localStorage" ? localStorage : sessionStorage;
          storage.clear();
          return true;
        },
        args: [this.currentMode],
      });

      // Clear local data and refresh UI
      this.storageData = {};
      this.selectedItems.clear();
      await this.loadStorageData();

      this.showToast("All storage data cleared successfully", "success");
    } catch (error) {
      console.error("Failed to clear storage:", error);
      this.showToast("Failed to clear storage: " + error.message, "error");
    }
  }

  exportSettings() {
    try {
      const settings = {
        version: "2.0",
        timestamp: new Date().toISOString(),
        settings: {
          theme: this.themeManager?.currentTheme || "light",
          storageMode: this.currentMode,
          confirmDelete:
            document.getElementById("confirmDelete")?.checked ?? true,
          autoBackup: document.getElementById("autoBackup")?.checked ?? false,
        },
        metadata: {
          domain: this.currentTab
            ? new URL(this.currentTab.url).hostname
            : "unknown",
          userAgent: navigator.userAgent,
          exportedBy: "StorageFlow Extension",
        },
      };

      const jsonString = JSON.stringify(settings, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `storageflow-settings-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showToast("Settings exported successfully", "success");
    } catch (error) {
      console.error("Failed to export settings:", error);
      this.showToast("Failed to export settings: " + error.message, "error");
    }
  }

  async saveSetting(key, value) {
    try {
      // Save setting to Chrome storage
      const settings = {};
      settings[key] = value;
      await chrome.storage.local.set({ [`storageflow_${key}`]: value });

      this.showToast(
        `${key.replace(/([A-Z])/g, " $1").toLowerCase()} ${
          value ? "enabled" : "disabled"
        }`,
        "info"
      );
    } catch (error) {
      console.error(`Failed to save ${key} setting:`, error);
      this.showToast(`Failed to save setting`, "error");
    }
  }

  async loadSettings() {
    try {
      // Load settings from Chrome storage
      const result = await chrome.storage.local.get([
        "storageflow_confirmDelete",
        "storageflow_autoBackup",
      ]);

      const confirmDeleteBox = document.getElementById("confirmDelete");
      if (confirmDeleteBox) {
        confirmDeleteBox.checked = result.storageflow_confirmDelete ?? true;
      }

      const autoBackupBox = document.getElementById("autoBackup");
      if (autoBackupBox) {
        autoBackupBox.checked = result.storageflow_autoBackup ?? false;
      }
    } catch (error) {
      console.log("Could not load settings, using defaults");
    }
  }
}

// Initialize the controller
console.log("Creating StorageFlowController instance...");
const controller = new StorageFlowController();

// Make controller globally available for onclick handlers
window.controller = controller;
