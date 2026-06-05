(function() {
    console.log('[CAPTCHA Loader] Initializing...');

    const CONFIG = {
        baseUrl: 'https://gamerid47.github.io/captcha-widget/',
        files: [
            'captcha-verification.js',
            'captcha-widget.js',
            'styles.css'
        ],
        autoInit: true,
        containerPattern: /^captcha-container-\d+$/,
        defaultInstance: 'captcha-container-1'
    };

    function loadCSS(href) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`link[href="${href}"]`)) {
                console.log('[CAPTCHA Loader] CSS already loaded, skipping:', href);
                resolve();
                return;
            }
            console.log('[CAPTCHA Loader] Loading CSS:', href);
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = () => {
                console.log('[CAPTCHA Loader] CSS loaded successfully:', href);
                resolve();
            };
            link.onerror = () => {
                console.error('[CAPTCHA Loader] CSS load FAILED:', href);
                reject(new Error('CSS load failed: ' + href));
            };
            document.head.appendChild(link);
        });
    }

    function loadJS(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                console.log('[CAPTCHA Loader] JS already loaded, skipping:', src);
                resolve();
                return;
            }
            console.log('[CAPTCHA Loader] Loading JS:', src);
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                console.log('[CAPTCHA Loader] JS loaded successfully:', src);
                resolve();
            };
            script.onerror = () => {
                console.error('[CAPTCHA Loader] JS load FAILED:', src);
                reject(new Error('JS load failed: ' + src));
            };
            document.head.appendChild(script);
        });
    }

    function autoInitializeCAPTCHAs() {
        console.log('[CAPTCHA Loader] autoInitializeCAPTCHAs() called');

        if (typeof window.initCaptcha === 'undefined') {
            console.warn('[CAPTCHA Loader] window.initCaptcha not ready yet, retrying in 100ms...');
            setTimeout(autoInitializeCAPTCHAs, 100);
            return;
        }

        if (typeof window.captchaVerification === 'undefined') {
            console.warn('[CAPTCHA Loader] window.captchaVerification not ready yet, retrying in 100ms...');
            setTimeout(autoInitializeCAPTCHAs, 100);
            return;
        }

        console.log('[CAPTCHA Loader] Dependencies ready — initCaptcha:', typeof window.initCaptcha, '| captchaVerification:', typeof window.captchaVerification);

        const allElements = document.querySelectorAll('[id]');
        console.log('[CAPTCHA Loader] Scanning', allElements.length, 'elements with IDs...');
        
        const captchaContainers = [];

        allElements.forEach(element => {
            const matches = CONFIG.containerPattern.test(element.id);
            if (matches) {
                console.log('[CAPTCHA Loader] Found matching container:', element.id);
                captchaContainers.push(element.id);
            }
        });

        if (captchaContainers.length === 0) {
            console.warn('[CAPTCHA Loader] No captcha-container-* elements found. Checking fallback names...');
            const commonNames = ['captcha-container', 'captcha-wrapper', 'captcha-box'];
            commonNames.forEach(name => {
                if (document.getElementById(name)) {
                    console.log('[CAPTCHA Loader] Found fallback container:', name);
                    captchaContainers.push(name);
                }
            });
        }

        if (captchaContainers.length === 0 && CONFIG.defaultInstance) {
            console.warn('[CAPTCHA Loader] No containers found at all. Creating default:', CONFIG.defaultInstance);
            const defaultContainer = document.createElement('div');
            defaultContainer.id = CONFIG.defaultInstance;
            document.body.appendChild(defaultContainer);
            captchaContainers.push(CONFIG.defaultInstance);
        }

        console.log('[CAPTCHA Loader] Containers to initialize (' + captchaContainers.length + '):', captchaContainers);

        captchaContainers.forEach(containerId => {
            try {
                const container = document.getElementById(containerId);
                
                if (!container) {
                    console.error('[CAPTCHA Loader] Container not found in DOM:', containerId);
                    return;
                }

                const expiryAttr = container.getAttribute('data-expiry');
                const expiry = parseInt(expiryAttr || '60');
                
                console.log('[CAPTCHA Loader] Initializing:', containerId, '| data-expiry attribute:', JSON.stringify(expiryAttr), '| parsed expiry:', expiry, 'seconds');

                window.initCaptcha(containerId, {
                    expiry: expiry,
                    onSuccess: function() {
                        console.log('[CAPTCHA Loader] ✅ onSuccess callback fired for:', containerId);
                    },
                    onError: function() {
                        console.log('[CAPTCHA Loader] ❌ onError callback fired for:', containerId);
                    }
                });

                console.log('[CAPTCHA Loader] initCaptcha() called for:', containerId);
            } catch (error) {
                console.error('[CAPTCHA Loader] Error initializing', containerId + ':', error);
            }
        });

        document.dispatchEvent(new CustomEvent('captchaContainersInitialized', {
            detail: {
                containers: captchaContainers
            }
        }));

        console.log('[CAPTCHA Loader] Initialization complete. Event dispatched: captchaContainersInitialized');
    }

    function initializeWhenReady() {
        console.log('[CAPTCHA Loader] initializeWhenReady() called | document.readyState:', document.readyState);

        if (document.readyState === 'loading') {
            console.log('[CAPTCHA Loader] DOM still loading, waiting for DOMContentLoaded...');
            document.addEventListener('DOMContentLoaded', () => {
                console.log('[CAPTCHA Loader] DOMContentLoaded fired, re-checking in 100ms');
                setTimeout(initializeWhenReady, 100);
            });
            return;
        }

        if (typeof window.initCaptcha === 'undefined' || typeof window.captchaVerification === 'undefined') {
            console.warn('[CAPTCHA Loader] Dependencies not ready — initCaptcha:', typeof window.initCaptcha, '| captchaVerification:', typeof window.captchaVerification, '— retrying in 100ms');
            setTimeout(initializeWhenReady, 100);
            return;
        }

        console.log('[CAPTCHA Loader] All dependencies ready. autoInit:', CONFIG.autoInit);

        if (CONFIG.autoInit) {
            autoInitializeCAPTCHAs();
        }
    }

    async function loadCAPTCHASystem() {
        console.log('[CAPTCHA Loader] Starting CAPTCHA system load...');
        try {
            console.log('[CAPTCHA Loader] Step 1/3: Loading CSS...');
            await loadCSS(CONFIG.baseUrl + 'styles.css');

            console.log('[CAPTCHA Loader] Step 2/3: Loading JS files...');
            for (const file of CONFIG.files) {
                if (file.endsWith('.js')) {
                    await loadJS(CONFIG.baseUrl + file);
                }
            }

            console.log('[CAPTCHA Loader] Step 3/3: All files loaded. Calling initializeWhenReady()');
            initializeWhenReady();
        } catch (error) {
            console.error('[CAPTCHA Loader] FATAL: CAPTCHA system load failed:', error);
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = `position: fixed; top: 20px; right: 20px; background: #ff6b6b; color: white; padding: 15px; border-radius: 5px; z-index: 10000; max-width: 300px;`;
            errorDiv.innerHTML = `<strong>CAPTCHA Load Error</strong><br>Failed to load CAPTCHA system. Please refresh the page.`;
            document.body.appendChild(errorDiv);
        }
    }

    loadCAPTCHASystem();
})();
