# 🔒 gCAPTCHA Widget

A free, self-hosted CAPTCHA widget that helps protect buttons, downloads, links, and hidden content on your website.

No API keys. No Google reCAPTCHA. Just include the loader and start protecting content.

## ✨ Features

- 🚀 Easy integration
- 🔒 Self-hosted
- 📱 Mobile friendly
- 🎯 Multiple CAPTCHA types
- 🧩 Image selection CAPTCHA
- 🎲 Slide puzzle CAPTCHA
- 🖱️ Image click sequence CAPTCHA
- ⚡ Automatic initialization
- 🔓 Protect buttons and content
- 📡 Verification event system
- 🎫 Verification token generation
- ♻️ Reset support
- 🔢 Unlimited CAPTCHA instances per page

## 🚀 Quick Start

Add the loader script:

```html
<script src="https://gamerid47.github.io/captcha-widget/loader.js"></script>
```

Create a CAPTCHA container:

```html
<div id="captcha-container-1"></div>
```

Protect a button:

```html
<button disabled class="protected-btn-1"> Download File </button>
```

Protect content:

```html
<div class="protected-con-1" style="display:none;"> Secret Content </div>
```

That's all.

📦 How It Works

Each CAPTCHA instance uses a number.

Example:

```html
<div id="captcha-container-1"></div>
```

Protect buttons:

```html
<button disabled class="protected-btn-1"> Download </button>
```

Protect content:

```html
<div class="protected-con-1" style="display:none;"> Protected Content </div>
```

Completing CAPTCHA instance 1 unlocks: protected-btn-1 protected-con-1

🔢 Multiple CAPTCHA Instances

Example:

```html
<div id="captcha-container-1"></div>
<div id="captcha-container-2"></div>
```

Protected elements:

```html
<button disabled class="protected-btn-1"> Download A </button>
<button disabled class="protected-btn-2"> Download B </button>
<div class="protected-con-1" style="display:none;"> Content A </div>
<div class="protected-con-2" style="display:none;"> Content B </div>
```

Each CAPTCHA only unlocks its matching protected elements.

🛡️ Protecting Download Buttons

```html
<div id="captcha-container-1"></div>
<a href="file.zip" download class="protected-btn-1"> Download File </a>
```

🛡️ Protecting Hidden Sections

```html
<div id="captcha-container-1"></div>
<div class="protected-con-1" style="display:none;"> Premium Content </div>
```

📡 Verification Event

Listen for successful verification:

```javascript
document.addEventListener('captchaVerified', function(event) {
  console.log(event.detail.instanceId);
  console.log(event.detail.token);
  console.log(event.detail.timestamp);
});
```

🔧 API Reference

Check verification status:

```javascript
window.captchaVerification.getVerificationStatus('1');
```

Get verification token:

```javascript
window.captchaVerification.getVerificationToken('1');
```

Get all verified instances:

```javascript
window.captchaVerification.getVerifiedInstances();
```

Check if any CAPTCHA is verified:

```javascript
window.captchaVerification.isAnyVerified();
```

Reset specific instance:

```javascript
window.captchaVerification.resetVerification('1');
```

Reset all instances:

```javascript
window.captchaVerification.resetVerification();
```

Remove instance:

```javascript
window.captchaVerification.removeInstance('1');
```

📡 Manual Verification

Manually mark an instance as verified:

```javascript
window.captchaVerification.markAsVerified('1');
```

Note: This is intended for custom integrations and testing. Do not rely on client-side verification alone for high-security applications.

🎉 Success & Error Callbacks

```javascript
window.initCaptcha('captcha-container-1', {
  onSuccess: function() {
    console.log('Verified');
  },
  onError: function() {
    console.log('Failed');
  }
});
```

⚠️ Important

Protected buttons should be disabled by default:

```html
<button disabled class="protected-btn-1"> Download </button>
```

Protected content should be hidden by default:

```html
<div class="protected-con-1" style="display:none;"> Hidden Content </div>
```

This prevents content from appearing before the CAPTCHA system loads.

🌐 URLs

Loader:
https://gamerid47.github.io/captcha-widget/loader.js

GitHub Pages:
https://gamerid47.github.io/captcha-widget/

GitHub Repository:
https://github.com/gamerid47/captcha-widget

📄 License

Free for personal and commercial use.

👨‍💻 Author

Gamer Id47
GitHub: https://github.com/gamerid47
Email: id2281449@gmail.com