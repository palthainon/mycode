/**
 * LocalStorage Utilities for OldWeb Tools
 * Provides client-side data persistence without cookies
 * Data stays in browser only - no server transmission, no GDPR cookie concerns
 */

const StorageUtils = (function() {
    'use strict';

    const PREFIX = 'owt_'; // OldWeb Tools prefix to namespace our storage keys

    /**
     * Save data to localStorage
     * @param {string} key - Storage key (will be prefixed automatically)
     * @param {*} value - Value to store (will be JSON stringified)
     */
    function save(key, value) {
        try {
            localStorage.setItem(PREFIX + key, JSON.stringify(value));
        } catch (e) {
            console.warn('StorageUtils: Unable to save to localStorage', e);
        }
    }

    /**
     * Load data from localStorage
     * @param {string} key - Storage key (will be prefixed automatically)
     * @param {*} defaultValue - Default value if key doesn't exist
     * @returns {*} Parsed value or defaultValue
     */
    function load(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(PREFIX + key);
            return item !== null ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn('StorageUtils: Unable to load from localStorage', e);
            return defaultValue;
        }
    }

    /**
     * Remove data from localStorage
     * @param {string} key - Storage key (will be prefixed automatically)
     */
    function remove(key) {
        try {
            localStorage.removeItem(PREFIX + key);
        } catch (e) {
            console.warn('StorageUtils: Unable to remove from localStorage', e);
        }
    }

    /**
     * Clear all OldWeb Tools data from localStorage
     */
    function clearAll() {
        try {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(PREFIX)) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
        } catch (e) {
            console.warn('StorageUtils: Unable to clear localStorage', e);
        }
    }

    /**
     * Save form input values automatically
     * @param {string} formKey - Unique key for this form/page
     * @param {string[]} inputIds - Array of input element IDs to save
     */
    function saveFormInputs(formKey, inputIds) {
        const data = {};
        inputIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (el.type === 'checkbox') {
                    data[id] = el.checked;
                } else if (el.tagName === 'SELECT') {
                    data[id] = el.value;
                } else if (el.isContentEditable) {
                    data[id] = el.textContent;
                } else {
                    data[id] = el.value;
                }
            }
        });
        save(formKey, data);
    }

    /**
     * Load and restore form input values
     * @param {string} formKey - Unique key for this form/page
     * @param {string[]} inputIds - Array of input element IDs to restore
     * @param {Function} [callback] - Optional callback after restoration
     */
    function loadFormInputs(formKey, inputIds, callback) {
        const data = load(formKey, {});
        inputIds.forEach(id => {
            const el = document.getElementById(id);
            if (el && data.hasOwnProperty(id)) {
                if (el.type === 'checkbox') {
                    el.checked = data[id];
                } else if (el.tagName === 'SELECT') {
                    el.value = data[id];
                } else if (el.isContentEditable) {
                    el.textContent = data[id];
                } else {
                    el.value = data[id];
                }
            }
        });
        if (typeof callback === 'function') {
            callback(data);
        }
    }

    /**
     * Auto-save form inputs on change
     * @param {string} formKey - Unique key for this form/page
     * @param {string[]} inputIds - Array of input element IDs to monitor
     */
    function autoSaveFormInputs(formKey, inputIds) {
        const saveHandler = debounce(() => {
            saveFormInputs(formKey, inputIds);
        }, 300);

        inputIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', saveHandler);
                el.addEventListener('change', saveHandler);
            }
        });
    }

    /**
     * Simple debounce function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Delay in milliseconds
     * @returns {Function} Debounced function
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Save dynamic list data (like debt items, expenses)
     * @param {string} listKey - Unique key for this list
     * @param {Array} items - Array of item objects to save
     */
    function saveList(listKey, items) {
        save(listKey, items);
    }

    /**
     * Load dynamic list data
     * @param {string} listKey - Unique key for this list
     * @param {Array} defaultValue - Default array if nothing saved
     * @returns {Array} Array of saved items
     */
    function loadList(listKey, defaultValue = []) {
        return load(listKey, defaultValue);
    }

    // Public API
    return {
        save,
        load,
        remove,
        clearAll,
        saveFormInputs,
        loadFormInputs,
        autoSaveFormInputs,
        saveList,
        loadList,
        debounce
    };
})();
