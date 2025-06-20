# Custom Agent Sales Chatbot

> A modern, animated chatbot web component with GSAP-powered animations and SaaS integration. Works with any frontend framework via CDN.

[![npm version](https://badge.fury.io/js/@chouriodev/custom-agent-sales-chatbot.svg)](https://www.npmjs.com/package/@chouriodev/custom-agent-sales-chatbot) [![Downloads](https://img.shields.io/npm/dm/@chouriodev/custom-agent-sales-chatbot.svg)](https://www.npmjs.com/package/@chouriodev/custom-agent-sales-chatbot) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[🚀 Live Demo](https://your-demo-url.com) • [📖 Full Documentation](https://docs.your-domain.com) • [💬 Community](https://discord.gg/your-server)

## ✨ Features

- **🎨 GSAP Animations** - Smooth, professional animations for all interactions
- **🔑 SaaS Ready** - Built-in API key management and client authentication
- **⚡ Universal Web Component** - Works with React, Vue, Angular, vanilla JS, or any HTML page
- **📱 Responsive** - Mobile-first design that works on all devices
- **🛍️ Ecommerce Ready** - Easy integration with WooCommerce, Shopify, Magento via CDN
- **🌙 Dark Mode** - Automatic theme detection with customizable themes

## 🚀 Quick Start

### 1. Get Your API Key

Before using the component, you need to register for an API key:

**[🔑 Register for API Key →](https://your-admin-portal.com/register)**

1. Sign up for a free account
2. Create a new project
3. Copy your API key from the dashboard
4. Use it in your integration below

### 2. Installation

```bash
npm install @chouriodev/custom-agent-sales-chatbot
# or
pnpm add @chouriodev/custom-agent-sales-chatbot
# or
yarn add @chouriodev/custom-agent-sales-chatbot
```

### 3. Basic Usage

#### React/Next.js

```jsx
import "@chouriodev/custom-agent-sales-chatbot/dist/style.css";

function App() {
  return (
    <div>
      {/* Your React content */}
      <react-chatbot api-key="your-api-key-here" position="bottom-right" />
    </div>
  );
}
```

#### Vue.js

```vue
<template>
  <div>
    <!-- Your Vue app content -->
    <react-chatbot
      api-key="your-api-key-here"
      position="bottom-right"
    ></react-chatbot>
  </div>
</template>

<script>
import "@chouriodev/custom-agent-sales-chatbot/dist/style.css";

export default {
  name: "App",
};
</script>
```

#### Angular

```typescript
// In your component
import { Component, AfterViewInit } from "@angular/core";

@Component({
  selector: "app-home",
  template: `
    <div>
      <!-- Your Angular content -->
      <react-chatbot api-key="your-api-key-here" position="bottom-right">
      </react-chatbot>
    </div>
  `,
})
export class HomeComponent implements AfterViewInit {
  ngAfterViewInit() {
    // Component is ready
  }
}
```

```css
/* In your global styles.css or angular.json */
@import "@chouriodev/custom-agent-sales-chatbot/dist/style.css";
```

## 🛍️ CDN Integration (For Ecommerce Platforms)

When you can't install NPM packages (like in ecommerce platforms), use CDN:

```html
<script src="https://unpkg.com/react@19/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@chouriodev/custom-agent-sales-chatbot/dist/react-chatbot-component.umd.js"></script>

<react-chatbot
  api-key="your-api-key-here"
  position="bottom-right"
></react-chatbot>
```

### WooCommerce (WordPress)

Add to your theme's `footer.php` or via plugin:

```php
<script src="https://unpkg.com/react@19/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@chouriodev/custom-agent-sales-chatbot/dist/react-chatbot-component.umd.js"></script>

<react-chatbot
  api-key="your-api-key-here"
  position="bottom-right"
></react-chatbot>
```

### Shopify

Add to your theme's `theme.liquid` before `</body>`:

```liquid
<script src="https://unpkg.com/react@19/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@chouriodev/custom-agent-sales-chatbot/dist/react-chatbot-component.umd.js"></script>

<react-chatbot
  api-key="your-api-key-here"
  position="bottom-right"
></react-chatbot>
```

### Magento

Add to your theme template:

```php
<script src="https://unpkg.com/react@19/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@chouriodev/custom-agent-sales-chatbot/dist/react-chatbot-component.umd.js"></script>

<react-chatbot
  api-key="your-api-key-here"
  position="bottom-right"
></react-chatbot>
```

### Vanilla JavaScript (Static Sites)

For static sites where you can't use package managers:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My Website</title>
  </head>
  <body>
    <h1>Welcome to my site</h1>

    <!-- CDN Scripts -->
    <script src="https://unpkg.com/react@19/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@chouriodev/custom-agent-sales-chatbot/dist/react-chatbot-component.umd.js"></script>

    <!-- Chatbot Component -->
    <react-chatbot
      api-key="your-api-key-here"
      position="bottom-right"
    ></react-chatbot>
  </body>
</html>
```

## 🎨 Customization

### Themes

```html
<react-chatbot
  api-key="your-api-key"
  theme='{
    "primary": "#3b82f6",
    "secondary": "#1e40af", 
    "accent": "#60a5fa"
  }'
></react-chatbot>
```

### Positioning

```html
<react-chatbot position="bottom-left"></react-chatbot>
<!-- Options: bottom-right | bottom-left | top-left | top-right -->
```

### Available Attributes

| Attribute  | Type   | Default        | Description                                                         |
| ---------- | ------ | -------------- | ------------------------------------------------------------------- |
| `api-key`  | string | -              | Your API key for authentication (required)                          |
| `position` | string | "bottom-right" | Position on screen (bottom-right, bottom-left, top-right, top-left) |

> **Note:** All other configuration (title, theme, welcome message, etc.) is managed through your admin portal and loaded automatically via API key validation.

## 🛡️ API & Authentication

The component uses your API key to:

- Authenticate your account
- Process chat messages through your configured AI model
- Track usage and analytics
- Enable premium features

**Free tier includes:**

- Up to 1,000 messages/month
- Basic theming
- Standard support

**[🚀 Upgrade Plans →](https://your-domain.com/pricing)**

## 📚 Documentation

- **[📖 Full Documentation](https://docs.your-domain.com)** - Complete guides and API reference
- **[🎨 Theming Guide](https://docs.your-domain.com/theming)** - Customize appearance
- **[🔧 Configuration](https://docs.your-domain.com/config)** - All available options
- **[🛍️ Ecommerce Integration](https://docs.your-domain.com/ecommerce)** - Platform-specific guides
- **[📱 Mobile Setup](https://docs.your-domain.com/mobile)** - Responsive design tips

## 🤝 Support & Community

- **[💬 Discord Community](https://discord.gg/your-server)** - Get help and share feedback
- **[📧 Email Support](mailto:support@your-domain.com)** - Technical assistance
- **[🐛 Bug Reports](https://github.com/Chourioz/chatbot-plugin/issues)** - Report issues
- **[💡 Feature Requests](https://github.com/Chourioz/chatbot-plugin/discussions)** - Suggest improvements

## ⚡ Performance

- **Bundle size**: ~45KB gzipped
- **Load time**: <100ms on 3G
- **Framework overhead**: Minimal
- **CDN optimized**: Global edge distribution

## 📄 License

MIT © [Your Company Name](https://your-domain.com)

---

**[🔑 Get Your API Key](https://your-admin-portal.com/register)** • **[📖 Documentation](https://docs.your-domain.com)** • **[💬 Community](https://discord.gg/your-server)**
