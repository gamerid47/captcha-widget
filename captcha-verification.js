class CaptchaVerification {
    constructor() {
        this.verifiedInstances = new Set();
        this.verificationTokens = new Map();
        this.storageKey = 'captcha_widget_verified';
        this.tokenKey = 'captcha_widget_tokens';
        this.init();
    }

    init() {
        this.enableProtectedContent();
    }

    generateToken(instanceId) {
        return `captcha_${instanceId}_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
    }

    markAsVerified(instanceId = '1') {
        this.verifiedInstances.add(instanceId);
        this.verificationTokens.set(instanceId, this.generateToken(instanceId));
        this.enableProtectedContent(instanceId);
        document.dispatchEvent(new CustomEvent('captchaVerified', {
            detail: {
                instanceId: instanceId,
                token: this.verificationTokens.get(instanceId),
                timestamp: Date.now()
            }
        }));
    }

    enableProtectedContent(instanceId = null) {
        if (instanceId) {
            this.enableInstanceContent(instanceId);
        } else {
            this.verifiedInstances.forEach(instance => {
                this.enableInstanceContent(instance);
            });
        }
    }

    enableInstanceContent(instanceId) {
        // Handle buttons
        document.querySelectorAll(`.protected-btn-${instanceId}`).forEach(btn => {
            btn.disabled = false;
            btn.setAttribute('data-original-class', `protected-btn-${instanceId}`);
            btn.classList.remove(`protected-btn-${instanceId}`);
            btn.classList.add(`captcha-verified-${instanceId}`);
        });

        // Handle content
        document.querySelectorAll(`.protected-con-${instanceId}`).forEach(content => {
            content.setAttribute('data-was-protected-con', instanceId);
            content.classList.remove(`protected-con-${instanceId}`);
            content.classList.add(`captcha-verified-${instanceId}`);
            content.style.display = 'block';
        });

        // Also handle content that has data-was-protected-con but lost the class (re-verify after expiry)
        document.querySelectorAll(`[data-was-protected-con="${instanceId}"]`).forEach(content => {
            if (!content.classList.contains(`captcha-verified-${instanceId}`)) {
                content.classList.remove(`protected-con-${instanceId}`);
                content.classList.add(`captcha-verified-${instanceId}`);
                content.style.display = 'block';
            }
        });

        // Handle indicators
        document.querySelectorAll(`.captcha-verified-indicator-${instanceId}`).forEach(indicator => {
            indicator.style.display = 'inline';
        });
    }

    getVerificationStatus(instanceId = '1') {
        return this.verifiedInstances.has(instanceId);
    }

    getVerificationToken(instanceId = '1') {
        return this.verificationTokens.get(instanceId);
    }

    resetVerification(instanceId = null) {
        if (instanceId) {
            this.verifiedInstances.delete(instanceId);
            this.verificationTokens.delete(instanceId);
            this.disableInstanceContent(instanceId);
        } else {
            this.verifiedInstances.clear();
            this.verificationTokens.clear();
            this.disableAllContent();
        }
    }

    disableInstanceContent(instanceId) {
        // Handle elements with captcha-verified- class
        document.querySelectorAll(`.captcha-verified-${instanceId}`).forEach(element => {
            element.classList.remove(`captcha-verified-${instanceId}`);

            // Restore original class for buttons
            if (element.hasAttribute('data-original-class')) {
                element.classList.add(element.getAttribute('data-original-class'));
                element.removeAttribute('data-original-class');
            }

            if (element.tagName === 'BUTTON' || element.tagName === 'A' || element.tagName === 'INPUT') {
                element.disabled = true;
            }

            // Restore protected-con- class for content
            if (element.getAttribute('data-was-protected-con') === instanceId) {
                element.classList.add(`protected-con-${instanceId}`);
                element.removeAttribute('data-was-protected-con');
            }

            if (element.classList.contains(`protected-con-${instanceId}`)) {
                element.style.display = 'none';
            }

            if (element.classList.contains(`captcha-verified-indicator-${instanceId}`)) {
                element.style.display = 'none';
            }
        });

        // Fallback: handle protected content that might not have captcha-verified- class
        document.querySelectorAll(`.protected-con-${instanceId}`).forEach(content => {
            content.style.display = 'none';
        });

        // Fallback: handle elements with data-was-protected-con that lost all classes
        document.querySelectorAll(`[data-was-protected-con="${instanceId}"]`).forEach(content => {
            content.classList.add(`protected-con-${instanceId}`);
            content.style.display = 'none';
            content.removeAttribute('data-was-protected-con');
        });

        // Ensure all protected buttons are disabled
        document.querySelectorAll(`.protected-btn-${instanceId}`).forEach(btn => {
            btn.disabled = true;
        });
    }

    disableAllContent() {
        document.querySelectorAll('[class*="protected-btn-"]').forEach(btn => {
            btn.disabled = true;
        });
        document.querySelectorAll('[class*="protected-con-"]').forEach(content => {
            content.style.display = 'none';
        });
        document.querySelectorAll('[class*="captcha-verified-indicator-"]').forEach(indicator => {
            indicator.style.display = 'none';
        });
    }

    getVerifiedInstances() {
        return Array.from(this.verifiedInstances);
    }

    isAnyVerified() {
        return this.verifiedInstances.size > 0;
    }

    removeInstance(instanceId) {
        this.verifiedInstances.delete(instanceId);
        this.verificationTokens.delete(instanceId);
        this.disableInstanceContent(instanceId);
    }
}

window.captchaVerification = new CaptchaVerification();