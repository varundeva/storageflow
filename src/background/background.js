// Background script for Local Manager Chrome Extension
// Handles background tasks, context menus, and cross-tab communication

// Use the extension's actual icon for notifications
const NOTIFICATION_ICON = "src/assets/icons/icon16.png";

class LocalManagerBackground {
  constructor() {
    this.activeTabs = new Map();
    this.init();
  }

  init() {
    try {
      // Listen for extension installation
      chrome.runtime.onInstalled.addListener(this.handleInstalled.bind(this));

      // Listen for messages from content scripts and popup
      chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));

      // Listen for tab updates
      chrome.tabs.onUpdated.addListener(this.handleTabUpdated.bind(this));

      // Listen for tab removal
      chrome.tabs.onRemoved.addListener(this.handleTabRemoved.bind(this));

      // Create context menu
      this.createContextMenu();

      console.log("Local Manager background script initialized successfully");
    } catch (error) {
      console.error("Error initializing background script:", error);
    }
  }

  handleInstalled(details) {
    if (details.reason === "install") {
      // Set default settings
      chrome.storage.sync.set({
        localManagerSettings: {
          theme: "auto",
          confirmDelete: true,
          autoBackup: false,
        },
      });

      // Create notification if API is available
      if (chrome.notifications) {
        try {
          chrome.notifications.create("localManagerInstalled", {
            type: "basic",
            iconUrl: NOTIFICATION_ICON,
            title: "Local Manager Installed",
            message:
              "Click the extension icon to start managing local storage!",
          });
        } catch (error) {
          console.warn("Error creating notification:", error);
        }
      }
    }
  }

  handleMessage(message, sender, sendResponse) {
    switch (message.type) {
      case "pageReady":
        this.handlePageReady(message, sender);
        break;

      case "localStorageChanged":
        this.handleStorageChanged(message, sender);
        break;

      case "getTabInfo":
        this.getTabInfo(sendResponse);
        return true; // Keep channel open

      case "transferData":
        this.handleDataTransfer(message, sendResponse);
        return true; // Keep channel open

      default:
        sendResponse({ error: "Unknown message type" });
    }
  }

  handlePageReady(message, sender) {
    const tabId = sender.tab.id;
    this.activeTabs.set(tabId, {
      id: tabId,
      domain: message.domain,
      url: message.url,
      lastActive: Date.now(),
    });
  }

  handleStorageChanged(message, sender) {
    // Log storage changes for debugging/monitoring
    console.log("LocalStorage changed:", {
      domain: message.domain,
      action: message.action,
      key: message.key,
      timestamp: new Date(message.timestamp),
    });

    // Could implement real-time sync between tabs here
    this.broadcastStorageChange(message, sender.tab.id);
  }

  broadcastStorageChange(message, excludeTabId) {
    // Notify other tabs on the same domain about storage changes
    chrome.tabs.query({ url: `*://${message.domain}/*` }, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id !== excludeTabId) {
          chrome.tabs
            .sendMessage(tab.id, {
              type: "storageUpdated",
              ...message,
            })
            .catch(() => {
              // Tab might not have content script, ignore error
            });
        }
      });
    });
  }

  handleTabUpdated(tabId, changeInfo, tab) {
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
  }

  handleTabRemoved(tabId) {
    this.activeTabs.delete(tabId);
  }

  async getTabInfo(sendResponse) {
    try {
      const tabs = await chrome.tabs.query({});
      const tabInfo = tabs
        .map((tab) => {
          try {
            const domain = new URL(tab.url).hostname;
            return {
              id: tab.id,
              title: tab.title,
              domain: domain,
              url: tab.url,
              active: tab.active,
              favIconUrl: tab.favIconUrl,
            };
          } catch (error) {
            return null;
          }
        })
        .filter(Boolean);

      sendResponse({ success: true, tabs: tabInfo });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }

  async handleDataTransfer(message, sendResponse) {
    try {
      const { sourceTabId, targetTabId, data, mode } = message;

      // Get data from source tab
      let sourceData = {};
      if (sourceTabId) {
        const response = await chrome.tabs.sendMessage(sourceTabId, {
          action: "getLocalStorage",
        });

        if (response.success) {
          sourceData = data || response.data;
        } else {
          throw new Error("Failed to get source data");
        }
      } else {
        sourceData = data;
      }

      // Transfer to target tab
      if (targetTabId && Object.keys(sourceData).length > 0) {
        for (const [key, value] of Object.entries(sourceData)) {
          await chrome.tabs.sendMessage(targetTabId, {
            action: "setLocalStorageItem",
            key,
            value,
          });
        }

        // Log the transfer
        await this.logTransfer({
          type: "cross-tab-transfer",
          sourceTabId,
          targetTabId,
          itemCount: Object.keys(sourceData).length,
          timestamp: Date.now(),
        });

        sendResponse({
          success: true,
          transferred: Object.keys(sourceData).length,
        });
      } else {
        sendResponse({ success: false, error: "No data to transfer" });
      }
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }

  async logTransfer(transferInfo) {
    try {
      const result = await chrome.storage.local.get("transferLogs");
      const logs = result.transferLogs || [];

      logs.unshift(transferInfo);

      // Keep only last 50 transfers
      if (logs.length > 50) {
        logs.splice(50);
      }

      await chrome.storage.local.set({ transferLogs: logs });
    } catch (error) {
      console.error("Error logging transfer:", error);
    }
  }

  createContextMenu() {
    // Check if contextMenus API is available
    if (!chrome.contextMenus) {
      console.warn("Context menus API not available");
      return;
    }

    try {
      chrome.contextMenus.removeAll(() => {
        if (chrome.runtime.lastError) {
          console.warn(
            "Error removing context menus:",
            chrome.runtime.lastError
          );
          return;
        }

        chrome.contextMenus.create({
          id: "openLocalManager",
          title: "Open Local Manager",
          contexts: ["page"],
        });

        chrome.contextMenus.create({
          id: "exportCurrentPage",
          title: "Export Local Storage",
          contexts: ["page"],
        });

        chrome.contextMenus.create({
          id: "clearCurrentPage",
          title: "Clear Local Storage",
          contexts: ["page"],
        });
      });

      chrome.contextMenus.onClicked.addListener(
        this.handleContextMenu.bind(this)
      );
    } catch (error) {
      console.error("Error creating context menus:", error);
    }
  }

  async handleContextMenu(info, tab) {
    switch (info.menuItemId) {
      case "openLocalManager":
        chrome.action.openPopup();
        break;

      case "exportCurrentPage":
        await this.exportPageStorage(tab);
        break;

      case "clearCurrentPage":
        await this.clearPageStorage(tab);
        break;
    }
  }

  async exportPageStorage(tab) {
    try {
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "getLocalStorage",
      });

      if (response.success) {
        const domain = new URL(tab.url).hostname;
        const exportData = {
          version: "1.0",
          timestamp: new Date().toISOString(),
          domain: domain,
          data: response.data,
        };

        // Create download if downloads API is available
        if (chrome.downloads) {
          const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: "application/json",
          });
          const url = URL.createObjectURL(blob);

          chrome.downloads.download({
            url: url,
            filename: `local-storage-${domain}-${
              new Date().toISOString().split("T")[0]
            }.json`,
            saveAs: true,
          });
        }

        // Show notification if API is available
        if (chrome.notifications) {
          try {
            chrome.notifications.create("exportComplete", {
              type: "basic",
              iconUrl: NOTIFICATION_ICON,
              title: "Export Complete",
              message: `Exported ${
                Object.keys(response.data).length
              } items from ${domain}`,
            });
          } catch (error) {
            console.warn("Error creating notification:", error);
          }
        }
      }
    } catch (error) {
      if (chrome.notifications) {
        try {
          chrome.notifications.create("exportFailed", {
            type: "basic",
            iconUrl: NOTIFICATION_ICON,
            title: "Export Failed",
            message: "Could not export local storage data",
          });
        } catch (notificationError) {
          console.warn("Error creating error notification:", notificationError);
        }
      }
    }
  }

  async clearPageStorage(tab) {
    try {
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "clearLocalStorage",
      });

      if (response.success) {
        const domain = new URL(tab.url).hostname;
        if (chrome.notifications) {
          try {
            chrome.notifications.create("storageCleared", {
              type: "basic",
              iconUrl: NOTIFICATION_ICON,
              title: "Storage Cleared",
              message: `Local storage cleared for ${domain}`,
            });
          } catch (error) {
            console.warn("Error creating notification:", error);
          }
        }
      }
    } catch (error) {
      if (chrome.notifications) {
        try {
          chrome.notifications.create("clearFailed", {
            type: "basic",
            iconUrl: NOTIFICATION_ICON,
            title: "Clear Failed",
            message: "Could not clear local storage",
          });
        } catch (notificationError) {
          console.warn("Error creating error notification:", notificationError);
        }
      }
    }
  }

  // Clean up old tab data periodically
  cleanupOldTabs() {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [tabId, tabInfo] of this.activeTabs.entries()) {
      if (now - tabInfo.lastActive > maxAge) {
        this.activeTabs.delete(tabId);
      }
    }
  }
}

// Initialize background script with error handling
try {
  const backgroundManager = new LocalManagerBackground();

  // Cleanup old tabs every hour
  setInterval(() => {
    try {
      backgroundManager.cleanupOldTabs();
    } catch (error) {
      console.error("Error during cleanup:", error);
    }
  }, 60 * 60 * 1000);
} catch (error) {
  console.error("Failed to initialize Local Manager background script:", error);
}
