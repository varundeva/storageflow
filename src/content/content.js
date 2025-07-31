// Content script for Local Manager Chrome Extension
// This script runs in the context of web pages to interact with localStorage

(function () {
  "use strict";

  // Listen for messages from the popup or background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
      case "getLocalStorage":
        sendResponse(getLocalStorageData());
        break;

      case "setLocalStorageItem":
        setLocalStorageItem(request.key, request.value);
        sendResponse({ success: true });
        break;

      case "removeLocalStorageItem":
        removeLocalStorageItem(request.key);
        sendResponse({ success: true });
        break;

      case "clearLocalStorage":
        clearLocalStorage();
        sendResponse({ success: true });
        break;

      case "getStorageInfo":
        sendResponse(getStorageInfo());
        break;

      default:
        sendResponse({ error: "Unknown action" });
    }

    return true; // Keep the message channel open for async response
  });

  function getLocalStorageData() {
    try {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        data[key] = value;
      }
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  function setLocalStorageItem(key, value) {
    try {
      localStorage.setItem(key, value);

      // Dispatch custom event to notify other scripts
      window.dispatchEvent(
        new CustomEvent("localStorageChanged", {
          detail: { key, value, action: "set" },
        })
      );

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  function removeLocalStorageItem(key) {
    try {
      localStorage.removeItem(key);

      // Dispatch custom event to notify other scripts
      window.dispatchEvent(
        new CustomEvent("localStorageChanged", {
          detail: { key, action: "remove" },
        })
      );

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  function clearLocalStorage() {
    try {
      localStorage.clear();

      // Dispatch custom event to notify other scripts
      window.dispatchEvent(
        new CustomEvent("localStorageChanged", {
          detail: { action: "clear" },
        })
      );

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  function getStorageInfo() {
    try {
      const keys = Object.keys(localStorage);
      const totalSize = JSON.stringify(localStorage).length;

      return {
        success: true,
        info: {
          keyCount: keys.length,
          totalSize: totalSize,
          domain: window.location.hostname,
          url: window.location.href,
        },
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Monitor localStorage changes from other sources
  const originalSetItem = localStorage.setItem;
  const originalRemoveItem = localStorage.removeItem;
  const originalClear = localStorage.clear;

  localStorage.setItem = function (key, value) {
    originalSetItem.call(this, key, value);
    notifyExtension("set", key, value);
  };

  localStorage.removeItem = function (key) {
    originalRemoveItem.call(this, key);
    notifyExtension("remove", key);
  };

  localStorage.clear = function () {
    originalClear.call(this);
    notifyExtension("clear");
  };

  function notifyExtension(action, key = null, value = null) {
    // Send message to background script about localStorage changes
    chrome.runtime
      .sendMessage({
        type: "localStorageChanged",
        action,
        key,
        value,
        domain: window.location.hostname,
        timestamp: Date.now(),
      })
      .catch(() => {
        // Extension might not be listening, ignore the error
      });
  }

  // Initialize - let the extension know this page is ready
  chrome.runtime
    .sendMessage({
      type: "pageReady",
      domain: window.location.hostname,
      url: window.location.href,
    })
    .catch(() => {
      // Extension might not be listening, ignore the error
    });
})();
