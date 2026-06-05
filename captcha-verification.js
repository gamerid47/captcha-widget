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
        document.querySelectorAll(`.protected-btn-${instanceId}`).forEach(btn => {
            btn.disabled = false;
            btn.classList.remove(`protected-btn-${instanceId}`);
            btn.classList.add(`captcha-verified-${instanceId}`);
        });
        document.querySelectorAll(`.protected-con-${instanceId}`).forEach(content => {
            content.style.display = 'block';
            content.classList.add(`captcha-verified-${instanceId}`);
        });
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
    document.querySelectorAll(`.captcha-verified-${instanceId}`).forEach(element => {
        element.classList.remove(`captcha-verified-${instanceId}`);
        if (element.classList.contains(`protected-btn-${instanceId}`)) {
            element.disabled = true;
        }
        if (element.classList.contains(`protected-con-${instanceId}`)) {
            element.style.display = 'none';
        }
        if (element.classList.contains(`captcha-verified-indicator-${instanceId}`)) {
            element.style.display = 'none';
        }
    });

    // Also handle buttons that lost their protected-btn class during enable
    document.querySelectorAll(`.protected-btn-${instanceId}`).forEach(btn => {
        btn.disabled = true;
    });

    // Also handle content that lost its protected-con class during enable
    document.querySelectorAll(`.protected-con-${instanceId}`).forEach(content => {
        content.style.display = 'none';
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
