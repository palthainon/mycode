/**
 * Internationalization Utilities for OldWeb Tools
 * Lightweight client-side i18n with JSON translation files
 * No external dependencies - works offline after first load
 */

const I18nUtils = (function() {
    'use strict';

    const STORAGE_KEY = 'user-language';
    const DEFAULT_LANG = 'en';
    const SUPPORTED_LANGS = ['en', 'es', 'hi', 'zh'];

    let translations = {};
    let currentLang = DEFAULT_LANG;
    let isInitialized = false;

    /**
     * Initialize i18n system
     * Loads saved language preference or detects from browser
     * @param {Function} [callback] - Called when initialization complete
     */
    async function init(callback) {
        // Determine language preference
        currentLang = getSavedLanguage() || detectBrowserLanguage() || DEFAULT_LANG;

        // Load translations for current language
        await loadTranslations(currentLang);

        // Update HTML lang attribute
        document.documentElement.lang = currentLang;

        isInitialized = true;

        // Apply translations to DOM
        applyTranslations();

        if (typeof callback === 'function') {
            callback(currentLang);
        }

        return currentLang;
    }

    /**
     * Get saved language from localStorage
     * @returns {string|null}
     */
    function getSavedLanguage() {
        if (typeof StorageUtils !== 'undefined') {
            return StorageUtils.load(STORAGE_KEY, null);
        }
        try {
            const saved = localStorage.getItem('owt_' + STORAGE_KEY);
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Detect language from browser settings
     * @returns {string|null}
     */
    function detectBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        if (!browserLang) return null;

        // Get language code (e.g., 'en' from 'en-US')
        const langCode = browserLang.split('-')[0].toLowerCase();

        // Return if supported, otherwise null
        return SUPPORTED_LANGS.includes(langCode) ? langCode : null;
    }

    /**
     * Load translation file for a language
     * @param {string} lang - Language code
     */
    async function loadTranslations(lang) {
        if (!SUPPORTED_LANGS.includes(lang)) {
            lang = DEFAULT_LANG;
        }

        try {
            // Determine path based on current page location
            const pathPrefix = getPathPrefix();
            const response = await fetch(`${pathPrefix}i18n/${lang}.json`);

            if (!response.ok) {
                throw new Error(`Failed to load ${lang}.json`);
            }

            translations = await response.json();
        } catch (e) {
            console.warn(`I18nUtils: Could not load ${lang} translations, falling back to English`, e);

            // Try loading English as fallback
            if (lang !== DEFAULT_LANG) {
                try {
                    const pathPrefix = getPathPrefix();
                    const response = await fetch(`${pathPrefix}i18n/${DEFAULT_LANG}.json`);
                    if (response.ok) {
                        translations = await response.json();
                    }
                } catch (fallbackError) {
                    console.warn('I18nUtils: Could not load fallback translations');
                    translations = {};
                }
            }
        }
    }

    /**
     * Determine path prefix based on current page location
     * @returns {string}
     */
    function getPathPrefix() {
        const pathname = window.location.pathname;

        // Check if we're in a subdirectory
        if (pathname.includes('/nettools/') ||
            pathname.includes('/system/') ||
            pathname.includes('/data/') ||
            pathname.includes('/financials/') ||
            pathname.includes('/productivity/')) {
            return '../';
        }

        return '';
    }

    /**
     * Get translated string by key
     * Supports nested keys with dot notation (e.g., 'common.calculate')
     * Supports interpolation with {{variable}} syntax
     * @param {string} key - Translation key
     * @param {Object} [params] - Interpolation parameters
     * @returns {string} - Translated string or key if not found
     */
    function t(key, params = {}) {
        const value = getNestedValue(translations, key);

        if (value === undefined) {
            console.warn(`I18nUtils: Missing translation for key "${key}"`);
            return key;
        }

        // Handle interpolation
        if (typeof value === 'string' && Object.keys(params).length > 0) {
            return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
                return params[paramKey] !== undefined ? params[paramKey] : match;
            });
        }

        return value;
    }

    /**
     * Get nested value from object using dot notation
     * @param {Object} obj - Object to traverse
     * @param {string} path - Dot-separated path
     * @returns {*}
     */
    function getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }

    /**
     * Set language and reload translations
     * @param {string} lang - Language code
     * @param {Function} [callback] - Called after language change
     */
    async function setLang(lang) {
        if (!SUPPORTED_LANGS.includes(lang)) {
            console.warn(`I18nUtils: Unsupported language "${lang}"`);
            return;
        }

        if (lang === currentLang) return;

        currentLang = lang;

        // Save preference
        if (typeof StorageUtils !== 'undefined') {
            StorageUtils.save(STORAGE_KEY, lang);
        } else {
            try {
                localStorage.setItem('owt_' + STORAGE_KEY, JSON.stringify(lang));
            } catch (e) {
                console.warn('I18nUtils: Could not save language preference');
            }
        }

        // Load new translations
        await loadTranslations(lang);

        // Update HTML lang attribute
        document.documentElement.lang = lang;

        // Apply translations to DOM
        applyTranslations();

        // Dispatch event for dynamic content
        document.dispatchEvent(new CustomEvent('langchange', {
            detail: { language: lang }
        }));

        // Announce change to screen readers
        if (typeof A11yUtils !== 'undefined') {
            const langName = getLangNativeName(lang);
            A11yUtils.announce(`Language changed to ${langName}`, 'polite');
        }
    }

    /**
     * Get current language code
     * @returns {string}
     */
    function getCurrentLang() {
        return currentLang;
    }

    /**
     * Get list of supported languages with native names
     * @returns {Array<{code: string, name: string, nativeName: string}>}
     */
    function getSupportedLanguages() {
        return [
            { code: 'en', name: 'English', nativeName: 'English' },
            { code: 'es', name: 'Spanish', nativeName: 'Español' },
            { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
            { code: 'zh', name: 'Chinese', nativeName: '中文' }
        ];
    }

    /**
     * Get native name for a language code
     * @param {string} code - Language code
     * @returns {string}
     */
    function getLangNativeName(code) {
        const lang = getSupportedLanguages().find(l => l.code === code);
        return lang ? lang.nativeName : code;
    }

    /**
     * Apply translations to all elements with data-i18n attributes
     */
    function applyTranslations() {
        // Translate text content
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translated = t(key);
            if (translated !== key) {
                el.textContent = translated;
            }
        });

        // Translate placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const translated = t(key);
            if (translated !== key) {
                // For contenteditable elements using data-placeholder with CSS
                if (el.hasAttribute('data-placeholder')) {
                    el.setAttribute('data-placeholder', translated);
                } else {
                    el.placeholder = translated;
                }
            }
        });

        // Translate aria-label
        document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
            const key = el.getAttribute('data-i18n-aria-label');
            const translated = t(key);
            if (translated !== key) {
                el.setAttribute('aria-label', translated);
            }
        });

        // Translate title attributes
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            const translated = t(key);
            if (translated !== key) {
                el.title = translated;
            }
        });
    }

    /**
     * Check if i18n is initialized
     * @returns {boolean}
     */
    function isReady() {
        return isInitialized;
    }

    /**
     * Format number according to current locale
     * @param {number} num - Number to format
     * @param {Object} [options] - Intl.NumberFormat options
     * @returns {string}
     */
    function formatNumber(num, options = {}) {
        try {
            return new Intl.NumberFormat(currentLang, options).format(num);
        } catch (e) {
            return num.toString();
        }
    }

    /**
     * Format currency according to current locale
     * @param {number} amount - Amount to format
     * @param {string} [currency='USD'] - Currency code
     * @returns {string}
     */
    function formatCurrency(amount, currency = 'USD') {
        try {
            return new Intl.NumberFormat(currentLang, {
                style: 'currency',
                currency: currency
            }).format(amount);
        } catch (e) {
            return `${currency} ${amount.toFixed(2)}`;
        }
    }

    /**
     * Format date according to current locale
     * @param {Date|number|string} date - Date to format
     * @param {Object} [options] - Intl.DateTimeFormat options
     * @returns {string}
     */
    function formatDate(date, options = {}) {
        try {
            const d = date instanceof Date ? date : new Date(date);
            return new Intl.DateTimeFormat(currentLang, options).format(d);
        } catch (e) {
            return date.toString();
        }
    }

    // Public API
    return {
        init,
        t,
        setLang,
        getCurrentLang,
        getSupportedLanguages,
        getLangNativeName,
        applyTranslations,
        isReady,
        formatNumber,
        formatCurrency,
        formatDate
    };
})();

// Auto-initialize when DOM is ready (can be disabled by setting window.I18N_MANUAL_INIT = true)
if (!window.I18N_MANUAL_INIT) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => I18nUtils.init());
    } else {
        I18nUtils.init();
    }
}
