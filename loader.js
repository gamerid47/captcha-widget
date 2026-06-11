(function() {
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

    const BACKEND_CONFIG = {
        url: (window.gCaptchaConfig && window.gCaptchaConfig.backendUrl) || null,
        requireBackend: true
    };

    if (!BACKEND_CONFIG.url) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;background:red;color:white;padding:10px;text-align:center;z-index:99999';
        errorDiv.innerHTML = '⚠️ gCAPTCHA: Cloudflare backend not configured. Visit <a href="https://github.com/gamerid47/captcha-widget" style="color:white">documentation</a>';
        document.body.appendChild(errorDiv);
    }

    function loadCSS(href) {
        return new Promise((resolve, reject) => {
            if (document.querySelector('link[href="' + href + '"]')) {
                resolve();
                return;
            }
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = resolve;
            link.onerror = reject;
            document.head.appendChild(link);
        });
    }

    function loadJS(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector('script[src="' + src + '"]')) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function autoInitializeCAPTCHAs() {
        if (typeof window.initCaptcha === 'undefined' || typeof window.captchaVerification === 'undefined') {
            setTimeout(autoInitializeCAPTCHAs, 100);
            return;
        }

        const allElements = document.querySelectorAll('[id]');
        const captchaContainers = [];

        allElements.forEach(function(element) {
            if (CONFIG.containerPattern.test(element.id)) {
                captchaContainers.push(element.id);
            }
        });

        if (captchaContainers.length === 0 && CONFIG.defaultInstance) {
            const defaultContainer = document.createElement('div');
            defaultContainer.id = CONFIG.defaultInstance;
            document.body.appendChild(defaultContainer);
            captchaContainers.push(CONFIG.defaultInstance);
        }

        captchaContainers.forEach(function(containerId) {
            try {
                const container = document.getElementById(containerId);
                if (!container) return;

                const expiryAttr = container.getAttribute('data-expiry');
                const expiry = parseInt(expiryAttr || '60');

                window.initCaptcha(containerId, {
                    expiry: expiry,
                    onSuccess: function() {},
                    onError: function() {}
                });
            } catch (error) {}
        });

        document.dispatchEvent(new CustomEvent('captchaContainersInitialized', {
            detail: { containers: captchaContainers }
        }));
    }

    function initializeWhenReady() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(initializeWhenReady, 100);
            });
            return;
        }

        if (typeof window.initCaptcha === 'undefined' || typeof window.captchaVerification === 'undefined') {
            setTimeout(initializeWhenReady, 100);
            return;
        }

        if (CONFIG.autoInit) {
            autoInitializeCAPTCHAs();
        }
    }

    async function loadCAPTCHASystem() {
        try {
            await loadCSS(CONFIG.baseUrl + 'styles.css');
            for (var i = 0; i < CONFIG.files.length; i++) {
                var file = CONFIG.files[i];
                if (file.endsWith('.js')) {
                    await loadJS(CONFIG.baseUrl + file);
                }
            }
            initializeWhenReady();
        } catch (error) {}
    }

    loadCAPTCHASystem();
})();