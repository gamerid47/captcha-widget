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

    function loadCSS(href) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`link[href="${href}"]`)) {
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
            if (document.querySelector(`script[src="${src}"]`)) {
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
        if (typeof window.initCaptcha === 'undefined') {
            setTimeout(autoInitializeCAPTCHAs, 100);
            return;
        }

        const allElements = document.querySelectorAll('[id]');
        const captchaContainers = [];

        allElements.forEach(element => {
            if (CONFIG.containerPattern.test(element.id)) {
                captchaContainers.push(element.id);
            }
        });

        if (captchaContainers.length === 0) {
            const commonNames = ['captcha-container', 'captcha-wrapper', 'captcha-box'];
            commonNames.forEach(name => {
                if (document.getElementById(name)) {
                    captchaContainers.push(name);
                }
            });
        }

        if (captchaContainers.length === 0 && CONFIG.defaultInstance) {
            const defaultContainer = document.createElement('div');
            defaultContainer.id = CONFIG.defaultInstance;
            document.body.appendChild(defaultContainer);
            captchaContainers.push(CONFIG.defaultInstance);
        }

        captchaContainers.forEach(containerId => {
            try {
                window.initCaptcha(containerId, {
                    onSuccess: function() {
                    },
                    onError: function() {
                    }
                });
            } catch (error) {
            }
        });

        document.dispatchEvent(new CustomEvent('captchaContainersInitialized', {
            detail: {
                containers: captchaContainers
            }
        }));
    }

    function initializeWhenReady() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
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

            for (const file of CONFIG.files) {
                if (file.endsWith('.js')) {
                    await loadJS(CONFIG.baseUrl + file);
                }
            }

            initializeWhenReady();
        } catch (error) {
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = `position: fixed; top: 20px; right: 20px; background: #ff6b6b; color: white; padding: 15px; border-radius: 5px; z-index: 10000; max-width: 300px;`;
            errorDiv.innerHTML = `<strong>CAPTCHA Load Error</strong><br>Failed to load CAPTCHA system. Please refresh the page.`;
            document.body.appendChild(errorDiv);
        }
    }

    loadCAPTCHASystem();
})();
