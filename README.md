# React Chatbot Component con Animaciones GSAP 🚀

Un componente de chatbot moderno y altamente personalizable para React, potenciado por **GSAP (GreenSock Animation Platform)** para animaciones fluidas y profesionales.

## ✨ Características Principales

### 🎨 Animaciones GSAP Avanzadas

- **Transiciones de iconos fluidas**: Rotación y escala suaves entre iconos de abrir/cerrar
- **Animación de ventana mejorada**: Apertura/cierre con easing `back.out` y transformaciones direccionales
- **Mensajes animados**: Cada mensaje aparece con animaciones únicas desde diferentes direcciones
- **Botón flotante dinámico**: Efectos de hover, pulse, y feedback táctil mejorados
- **Indicador de escritura**: Animación de puntos escalonada con efectos de escala y rebote
- **Scroll automático suave**: Transiciones GSAP para navegación fluida de mensajes
- **Optimización de rendimiento**: Hardware acceleration y limpieza automática de animaciones

### 🎯 Funcionalidades del Componente

- **Web Component nativo**: Compatible con cualquier framework (React, Vue, Angular, Vanilla JS)
- **Theming avanzado**: Sistema de CSS variables completamente personalizable
- **Posicionamiento flexible**: 4 posiciones (esquinas de la pantalla)
- **TypeScript completo**: Tipado fuerte y autocompletado
- **Responsive**: Adaptable a diferentes tamaños de pantalla
- **Accesibilidad**: Soporte para lectores de pantalla y navegación por teclado
- **Modo oscuro**: Detección automática de preferencias del sistema

## 🚀 Instalación

```bash
npm install react-chatbot-component
# o
pnpm add react-chatbot-component
# o
yarn add react-chatbot-component
```

## 📦 Uso Básico

### Como Custom Hook (Nuevo! 🚀)

```tsx
import React, { useState } from "react";
import { useChatbot } from "react-chatbot-component";

function CustomChatInterface() {
  const {
    messages,
    isTyping,
    isConnected,
    error,
    sendMessage,
    clearMessages,
    apiKeyValidation,
  } = useChatbot({
    apiKey: "client01-abc123def456",
    welcomeMessage: "¡Hola! Soy tu asistente personalizado.",
    maxMessages: 100,
  });

  const [inputValue, setInputValue] = useState("");

  const handleSend = async () => {
    if (inputValue.trim()) {
      await sendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  return (
    <div className="my-custom-chat">
      {/* Tu interfaz personalizada */}
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        {isTyping && <div>Escribiendo...</div>}
      </div>

      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && handleSend()}
        disabled={!isConnected}
      />
      <button onClick={handleSend}>Enviar</button>

      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

### Como Componente React

```tsx
import React from "react";
import { ReactChatbot } from "react-chatbot-component";

function App() {
  const handleMessage = async (
    message: string,
    apiKey?: string
  ): Promise<string> => {
    // Tu lógica de procesamiento de mensajes
    console.log(
      "Cliente autenticado con API Key:",
      apiKey?.substring(0, 8) + "..."
    );
    return `Recibido: ${message}`;
  };

  return (
    <div>
      <ReactChatbot
        title="Mi Asistente"
        welcomeMessage="¡Hola! ¿Cómo puedo ayudarte?"
        placeholder="Escribe tu mensaje..."
        position="bottom-right"
        apiKey="client01-abc123def456ghi789"
        onMessage={handleMessage}
        theme={{
          primary: "#3b82f6",
          secondary: "#1e40af",
          accent: "#60a5fa",
        }}
      />
    </div>
  );
}
```

### Uso con API Key Automática (SaaS)

```tsx
import React from "react";
import { ReactChatbot } from "react-chatbot-component";

function App() {
  return (
    <div>
      {/* Sin handler personalizado - usa API automática basada en apiKey */}
      <ReactChatbot
        title="Agente Automático"
        welcomeMessage="¡Conectado al agente de tu empresa!"
        apiKey="client01-abc123def456ghi789"
        theme={{
          primary: "#10b981",
          secondary: "#047857",
        }}
      />
    </div>
  );
}
```

### Como Web Component

```html
<!DOCTYPE html>
<html>
  <head>
    <script src="https://unpkg.com/react-chatbot-component/dist/react-chatbot-component.umd.js"></script>
  </head>
  <body>
    <react-chatbot
      title="Asistente Web"
      welcome-message="¡Hola desde el Web Component!"
      position="bottom-left"
      theme='{"primary": "#10b981", "secondary": "#047857", "accent": "#34d399"}'
    ></react-chatbot>

    <script>
      document
        .querySelector("react-chatbot")
        .addEventListener("message", (event) => {
          const { message } = event.detail;
          // Procesar mensaje y responder
          event.detail.respond(`Procesando: ${message}`);
        });
    </script>
  </body>
</html>
```

## 🎨 Personalización de Tema

### Temas Predefinidos

```tsx
// Tema Azul Clásico (por defecto)
const blueTheme = {
  primary: "#3b82f6",
  secondary: "#1e40af",
  accent: "#60a5fa",
};

// Tema Verde Esmeralda
const greenTheme = {
  primary: "#10b981",
  secondary: "#047857",
  accent: "#34d399",
};

// Tema Púrpura Real
const purpleTheme = {
  primary: "#8b5cf6",
  secondary: "#7c3aed",
  accent: "#a78bfa",
};
```

### Tema Completo Personalizado

```tsx
const customTheme = {
  primary: "#ff6b35", // Color principal
  secondary: "#e55a2b", // Color secundario
  accent: "#ff8c61", // Color de acento
  background: "#ffffff", // Fondo del chat
  surface: "#f8fafc", // Superficie de elementos
  text: "#1f2937", // Texto principal
  textSecondary: "#6b7280", // Texto secundario
  border: "#e5e7eb", // Bordes
  font: "Inter, sans-serif", // Fuente
};
```

## 🎭 Animaciones GSAP

### Características de Animación

| Elemento             | Animación         | Descripción                                                |
| -------------------- | ----------------- | ---------------------------------------------------------- |
| **Botón Flotante**   | Pulse + Hover     | Animación sutil de flotación y efectos de hover mejorados  |
| **Iconos**           | Rotación + Escala | Transición fluida entre iconos de chat/cerrar con rotación |
| **Ventana Chat**     | Back.out Easing   | Apertura/cierre con transformación direccional suave       |
| **Mensajes**         | Bounce + Slide    | Aparición desde direcciones específicas con rebote         |
| **Typing Indicator** | Stagger + Scale   | Puntos animados con efectos escalonados                    |
| **Input Field**      | Scale Feedback    | Retroalimentación visual al escribir                       |
| **Auto-scroll**      | Smooth Timeline   | Desplazamiento suave a nuevos mensajes                     |

### Optimizaciones de Rendimiento

```css
/* Hardware Acceleration */
.gsap-optimized {
  transform: translateZ(0);
  backface-visibility: hidden;
  will-change: transform, opacity;
}

/* Context Safe Animations */
const { contextSafe } = useGSAP(() => {
  // Animaciones con limpieza automática
}, { scope: containerRef });
```

## ⚡ Custom Hook: useChatbot

### Arquitectura SOLID y DRY

El hook `useChatbot` implementa los principios SOLID para una arquitectura robusta y mantenible:

#### 📐 **Single Responsibility Principle (SRP)**

```typescript
// Cada servicio tiene una responsabilidad específica
class ApiKeyValidationService {
  static validate(apiKey?: string): ApiKeyValidation
}

class ApiConfigurationService {
  static createConnection(apiKey: string): ApiConnection
}

class MessageProcessingService {
  static async processMessage(...): Promise<string>
}

class ErrorHandlingService {
  static createErrorMessage(error: unknown): string
}
```

#### 🔓 **Open/Closed Principle (OCP)**

```typescript
// Extensible mediante handlers personalizados
const customHandler = async (message: string, apiKey?: string) => {
  // Tu lógica personalizada
  return "Respuesta personalizada";
};

const { sendMessage } = useChatbot({
  apiKey: "client01-xyz",
  onMessage: customHandler, // Extensión sin modificación
});
```

#### 🔄 **Liskov Substitution Principle (LSP)**

```typescript
// Cualquier MessageHandler puede ser sustituido
type MessageHandler = (message: string, apiKey?: string) => Promise<string>;

// Todos estos son intercambiables
const handler1: MessageHandler = async (msg) => "Respuesta 1";
const handler2: MessageHandler = async (msg, key) => "Respuesta 2";
const handler3: MessageHandler = defaultMessageHandler;
```

#### 🎯 **Interface Segregation Principle (ISP)**

```typescript
// Interfaces específicas y enfocadas
interface ApiKeyValidation {
  isValid: boolean;
  clientId: string | null;
  error: string | null;
}

interface UseChatbotReturn {
  // Estado
  messages: ChatMessage[];
  isTyping: boolean;
  isConnected: boolean;

  // Acciones
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
}
```

#### 🔗 **Dependency Inversion Principle (DIP)**

```typescript
// El hook depende de abstracciones, no de implementaciones concretas
const { sendMessage, messages, isTyping } = useChatbot({
  apiKey: "client01-abc123",
  onMessage: customHandler, // Abstracción inyectada
});
```

### Hook API

```typescript
interface UseChatbotOptions {
  apiKey?: string;
  onMessage?: MessageHandler;
  maxMessages?: number;
  welcomeMessage?: string;
}

interface UseChatbotReturn {
  // Estado
  messages: ChatMessage[];
  isTyping: boolean;
  isConnected: boolean;
  error: string | null;

  // Acciones
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;

  // Validación
  apiKeyValidation: ApiKeyValidation;
}
```

### Ventajas del Custom Hook

| Ventaja                                | Descripción                                          |
| -------------------------------------- | ---------------------------------------------------- |
| **🎨 UI Personalizable**               | Crea tu propia interfaz manteniendo toda la lógica   |
| **🧪 Fácil Testing**                   | Lógica separada de UI permite tests unitarios        |
| **🔧 Reutilizable**                    | Usa el mismo hook en múltiples componentes           |
| **📦 Separación de Responsabilidades** | UI y lógica de negocio completamente separadas       |
| **⚡ Performance**                     | Optimizaciones internas con `useCallback` y `useRef` |
| **🛡️ Type Safety**                     | TypeScript completo con tipos inferidos              |

## 🔑 Sistema de API Key

### Validación de Cliente

El componente incluye un sistema robusto de validación de clientes basado en API Keys:

```tsx
// Formato de API Key recomendado: clientId-token
const apiKey = "client01-abc123def456ghi789";

// Validación automática
const isValidKey = validateApiKey(apiKey);
// - Mínimo 8 caracteres
// - Solo caracteres alfanuméricos
// - Formato personalizable
```

### Mapeo Automático de Endpoints (SaaS Interno)

```tsx
// Configuración interna de endpoints por cliente (gestionado por el SaaS)
const clientEndpoints = {
  client01: "https://api.client1.com/chat",
  client02: "https://api.client2.com/chat",
  test1234: "https://api.test.com/chat",
};

// Endpoint por defecto para clientes no configurados
const defaultEndpoint = "https://api.default.com/chat";
```

### Modos de Operación

#### 1. Modo Handler Personalizado

```tsx
<ReactChatbot
  apiKey="client01-xyz789"
  onMessage={async (message, apiKey) => {
    // Tu lógica personalizada con acceso al apiKey
    const clientId = apiKey?.substring(0, 8);
    return await processMessage(message, clientId);
  }}
/>
```

#### 2. Modo SaaS Automático

```tsx
<ReactChatbot
  apiKey="client01-xyz789"
  // Sin onMessage - usa el sistema automático del SaaS
  // La configuración de API es gestionada internamente
/>
```

#### 3. Modo Sin API Key

```tsx
<ReactChatbot
  onMessage={async (message) => {
    // Funciona sin apiKey pero con funcionalidad limitada
    return "Respuesta estática";
  }}
/>
```

### Estructura del Request SaaS

```json
{
  "message": "Mensaje del usuario",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "clientId": "client01",
  "platform": "react-chatbot-component"
}
```

### Headers Incluidos

```http
Content-Type: application/json
Authorization: Bearer client01-abc123def456ghi789
X-Client-ID: client01
X-SaaS-Platform: react-chatbot-component
```

## 📍 Posicionamiento

```tsx
// Posiciones disponibles
type Position =
  | "bottom-right" // Abajo derecha (por defecto)
  | "bottom-left" // Abajo izquierda
  | "top-right" // Arriba derecha
  | "top-left"; // Arriba izquierda

<ReactChatbot position="bottom-left" />;
```

## 🔧 Props del Componente

### Props Principales

| Prop                  | Tipo                                                    | Por Defecto                          | Descripción                       |
| --------------------- | ------------------------------------------------------- | ------------------------------------ | --------------------------------- |
| `title`               | `string`                                                | `"Chat Assistant"`                   | Título del chat                   |
| `welcomeMessage`      | `string`                                                | `"Hello! How can I help you today?"` | Mensaje de bienvenida             |
| `placeholder`         | `string`                                                | `"Type your message..."`             | Placeholder del input             |
| `position`            | `Position`                                              | `"bottom-right"`                     | Posición del chatbot              |
| `theme`               | `ChatbotTheme`                                          | `defaultTheme`                       | Tema personalizado                |
| `apiKey`              | `string`                                                | -                                    | Clave API para autenticación SaaS |
| `onMessage`           | `(message: string, apiKey?: string) => Promise<string>` | -                                    | Handler de mensajes personalizado |
| `maxMessages`         | `number`                                                | `100`                                | Máximo de mensajes                |
| `showTypingIndicator` | `boolean`                                               | `true`                               | Mostrar indicador de escritura    |
| `isOpen`              | `boolean`                                               | -                                    | Control externo del estado        |
| `onToggle`            | `(isOpen: boolean) => void`                             | -                                    | Callback de cambio de estado      |
| `className`           | `string`                                                | -                                    | Clase CSS adicional               |

### Interfaces TypeScript

```tsx
interface ChatbotTheme {
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  surface?: string;
  text?: string;
  textSecondary?: string;
  border?: string;
  font?: string;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface ChatbotProps {
  title?: string;
  welcomeMessage?: string;
  placeholder?: string;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  theme?: ChatbotTheme;
  onMessage?: (message: string) => Promise<string>;
  maxMessages?: number;
  showTypingIndicator?: boolean;
  enableSound?: boolean;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  className?: string;
}
```

## 🛠️ Desarrollo

### Configuración del Proyecto

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/react-chatbot-component.git
cd react-chatbot-component

# Instalar dependencias
pnpm install

# Desarrollo
pnpm dev

# Build
pnpm build

# Preview
pnpm preview
```

### Estructura del Proyecto

```
src/
├── chatbot.tsx          # Componente principal
├── types.ts            # Definiciones TypeScript
├── styles.css          # Estilos CSS con variables
├── index.ts            # Punto de entrada
└── main.tsx            # Aplicación de demostración
```

### Tecnologías Utilizadas

- **React 19** - Framework de UI
- **TypeScript** - Tipado estático
- **GSAP 3.13** - Animaciones profesionales
- **@gsap/react** - Hook de React para GSAP
- **Tailwind CSS 4.1** - Framework de estilos
- **Vite 6** - Build tool moderno
- **Clsx** - Utilidad para clases condicionales

## 🎯 Ejemplos de Uso Avanzado

### Control Programático

```tsx
import { useRef } from "react";

function AdvancedExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(blueTheme);

  const handleToggle = (open: boolean) => {
    setIsOpen(open);
    console.log(`Chat ${open ? "abierto" : "cerrado"}`);
  };

  const handleMessage = async (message: string) => {
    // Lógica compleja de procesamiento
    if (message.includes("tema")) {
      setCurrentTheme(greenTheme);
      return "¡Tema cambiado a verde!";
    }

    // Integración con API
    const response = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message }),
      headers: { "Content-Type": "application/json" },
    });

    return await response.text();
  };

  return (
    <ReactChatbot
      isOpen={isOpen}
      onToggle={handleToggle}
      theme={currentTheme}
      onMessage={handleMessage}
      maxMessages={200}
    />
  );
}
```

### Integración con Estado Global

```tsx
// Con Redux/Zustand
const chatStore = useChatStore();

<ReactChatbot
  onMessage={chatStore.sendMessage}
  theme={chatStore.theme}
  isOpen={chatStore.isOpen}
  onToggle={chatStore.toggle}
/>;
```

## 🌐 Compatibilidad

### Navegadores Soportados

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Frameworks Compatibles

- ✅ React 16.8+
- ✅ Next.js 12+
- ✅ Vite
- ✅ Create React App
- ✅ Vanilla JavaScript
- ✅ Vue.js (como Web Component)
- ✅ Angular (como Web Component)

## 📊 Rendimiento

### Métricas de Build

- **ES Module**: ~139KB gzipped (con GSAP)
- **UMD Bundle**: ~85KB gzipped
- **Tree Shaking**: Soporte completo
- **Code Splitting**: Compatible

### Optimizaciones GSAP

- Hardware acceleration automática
- Context-safe animations
- Automatic cleanup
- Will-change optimization
- Reduced motion support

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- [GSAP](https://greensock.com/gsap/) - Por la increíble librería de animaciones
- [React](https://reactjs.org/) - Por el framework de UI
- [Tailwind CSS](https://tailwindcss.com/) - Por el framework de estilos
- [Vite](https://vitejs.dev/) - Por la herramienta de build

---

**¿Tienes preguntas o sugerencias?** ¡Abre un issue o contribuye al proyecto! 🚀

# React Chatbot Component

A customizable, responsive chatbot component built with React 19, TypeScript, GSAP animations, and Tailwind CSS. Designed as a web component for easy integration into any web platform.

## ✨ Features

- 🎯 **Web Component Ready** - Direct HTML usage without React knowledge
- 🎨 **Fully Customizable** - Themes, colors, positioning, and branding
- ⚡ **High Performance** - Optimized animations with GSAP
- 📱 **Mobile Responsive** - Perfect on all screen sizes
- 🔐 **API Key Support** - Secure integration with backend services
- 🛍️ **Ecommerce Ready** - Perfect for WooCommerce, Shopify, Magento, etc.
- 🌗 **Shadow DOM** - Complete style isolation
- ♿ **Accessible** - Screen reader and keyboard navigation support

## 🚀 Quick Start

### Option 1: CDN (Recommended for Ecommerce Platforms)

```html
<script src="https://unpkg.com/react@19/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/react-chatbot-component/dist/react-chatbot-component.umd.js"></script>

<react-chatbot
  title="Support Chat"
  api-key="your-api-key-here"
  position="bottom-right"
  theme='{"primary": "#3b82f6", "secondary": "#1e40af"}'
  welcome-message="Hello! How can I help you today?"
></react-chatbot>
```

### Option 2: NPM Installation

```bash
npm install react-chatbot-component
```

```tsx
import { ReactChatbot } from "react-chatbot-component";

function App() {
  return (
    <ReactChatbot
      title="Support Assistant"
      apiKey="your-api-key"
      position="bottom-right"
      onMessage={async (message) => {
        // Your custom message handler
        return "Thank you for your message!";
      }}
    />
  );
}
```

## 🛍️ Ecommerce Platform Integration

### WooCommerce (WordPress)

#### Method 1: Theme Integration

Add to your theme's `footer.php` or `functions.php`:

```php
// In functions.php
function add_chatbot_scripts() {
    ?>
    <script src="https://unpkg.com/react@19/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/react-chatbot-component/dist/react-chatbot-component.umd.js"></script>

    <react-chatbot
      title="<?php echo get_bloginfo('name'); ?> Support"
      api-key="<?php echo get_option('chatbot_api_key'); ?>"
      position="bottom-right"
      theme='{"primary": "<?php echo get_theme_mod('primary_color', '#3b82f6'); ?>"}'
      welcome-message="Welcome to <?php echo get_bloginfo('name'); ?>! How can I help you?"
    ></react-chatbot>

    <script>
    // Custom message handler for WooCommerce
    document.querySelector('react-chatbot').addEventListener('chatbot-message', async (event) => {
      const { message, apiKey } = event.detail;

      // Send to your WordPress API endpoint
      try {
        const response = await fetch('/wp-json/chatbot/v1/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': '<?php echo wp_create_nonce('wp_rest'); ?>'
          },
          body: JSON.stringify({ message, apiKey })
        });

        const data = await response.json();
        return data.response;
      } catch (error) {
        return "Sorry, I'm having trouble right now. Please try again.";
      }
    });
    </script>
    <?php
}
add_action('wp_footer', 'add_chatbot_scripts');
```

#### Method 2: Plugin Integration

Create a simple WordPress plugin:

```php
<?php
/*
Plugin Name: Chatbot Integration
Description: Adds React Chatbot Component to your WooCommerce store
Version: 1.0
*/

// Add admin options
function chatbot_admin_menu() {
    add_options_page(
        'Chatbot Settings',
        'Chatbot',
        'manage_options',
        'chatbot-settings',
        'chatbot_settings_page'
    );
}
add_action('admin_menu', 'chatbot_admin_menu');

function chatbot_settings_page() {
    if (isset($_POST['submit'])) {
        update_option('chatbot_api_key', sanitize_text_field($_POST['api_key']));
        update_option('chatbot_title', sanitize_text_field($_POST['title']));
        update_option('chatbot_welcome', sanitize_text_field($_POST['welcome']));
    }

    $api_key = get_option('chatbot_api_key', '');
    $title = get_option('chatbot_title', 'Support Chat');
    $welcome = get_option('chatbot_welcome', 'Hello! How can I help you?');
    ?>
    <div class="wrap">
        <h1>Chatbot Settings</h1>
        <form method="post">
            <table class="form-table">
                <tr>
                    <th>API Key</th>
                    <td><input type="text" name="api_key" value="<?php echo esc_attr($api_key); ?>" class="regular-text" /></td>
                </tr>
                <tr>
                    <th>Title</th>
                    <td><input type="text" name="title" value="<?php echo esc_attr($title); ?>" class="regular-text" /></td>
                </tr>
                <tr>
                    <th>Welcome Message</th>
                    <td><textarea name="welcome" rows="3" class="regular-text"><?php echo esc_textarea($welcome); ?></textarea></td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}

// Output chatbot on frontend
function output_chatbot() {
    $api_key = get_option('chatbot_api_key', '');
    $title = get_option('chatbot_title', 'Support Chat');
    $welcome = get_option('chatbot_welcome', 'Hello! How can I help you?');

    if (empty($api_key)) return;
    ?>
    <script src="https://unpkg.com/react@19/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/react-chatbot-component/dist/react-chatbot-component.umd.js"></script>

    <react-chatbot
      title="<?php echo esc_attr($title); ?>"
      api-key="<?php echo esc_attr($api_key); ?>"
      welcome-message="<?php echo esc_attr($welcome); ?>"
      position="bottom-right"
    ></react-chatbot>
    <?php
}
add_action('wp_footer', 'output_chatbot');
?>
```

### Shopify

#### Theme Integration

Add to your theme's `theme.liquid` file before `</body>`:

```liquid
<!-- React Chatbot Integration -->
<script src="https://unpkg.com/react@19/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/react-chatbot-component/dist/react-chatbot-component.umd.js"></script>

<react-chatbot
  title="{{ shop.name }} Support"
  api-key="{{ settings.chatbot_api_key }}"
  position="bottom-right"
  theme='{"primary": "{{ settings.colors_accent_1 }}", "secondary": "{{ settings.colors_accent_2 }}"}'
  welcome-message="Welcome to {{ shop.name }}! How can I help you today?"
></react-chatbot>

<script>
// Shopify-specific integration
document.querySelector('react-chatbot').addEventListener('chatbot-message', async (event) => {
  const { message, apiKey } = event.detail;

  // Integration with Shopify customer data
  const customerData = {
    customer_id: {{ customer.id | default: 'null' }},
    email: '{{ customer.email | default: "" }}',
    shop: '{{ shop.permanent_domain }}',
    cart_total: {{ cart.total_price | money_without_currency | default: 0 }}
  };

  try {
    const response = await fetch('https://your-api-endpoint.com/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        message,
        context: customerData,
        platform: 'shopify'
      })
    });

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Chatbot error:', error);
    return "I'm having trouble right now. Please contact support directly.";
  }
});
</script>
```

#### Settings Schema (settings_schema.json)

Add chatbot settings to your theme:

```json
{
  "name": "Chatbot",
  "settings": [
    {
      "type": "text",
      "id": "chatbot_api_key",
      "label": "Chatbot API Key",
      "info": "Enter your chatbot service API key"
    },
    {
      "type": "text",
      "id": "chatbot_title",
      "label": "Chatbot Title",
      "default": "Support Chat"
    },
    {
      "type": "textarea",
      "id": "chatbot_welcome",
      "label": "Welcome Message",
      "default": "Hello! How can I help you today?"
    },
    {
      "type": "select",
      "id": "chatbot_position",
      "label": "Position",
      "options": [
        { "value": "bottom-right", "label": "Bottom Right" },
        { "value": "bottom-left", "label": "Bottom Left" },
        { "value": "top-right", "label": "Top Right" },
        { "value": "top-left", "label": "Top Left" }
      ],
      "default": "bottom-right"
    }
  ]
}
```

### Magento 2

#### Module Integration

Create a simple Magento module in `app/code/YourCompany/Chatbot/`:

**registration.php:**

```php
<?php
\Magento\Framework\Component\ComponentRegistrar::register(
    \Magento\Framework\Component\ComponentRegistrar::MODULE,
    'YourCompany_Chatbot',
    __DIR__
);
```

**etc/module.xml:**

```xml
<?xml version="1.0"?>
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="urn:magento:framework:Module/etc/module.xsd">
    <module name="YourCompany_Chatbot" setup_version="1.0.0"/>
</config>
```

**view/frontend/layout/default.xml:**

```xml
<?xml version="1.0"?>
<page xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="urn:magento:framework:View/Layout/etc/page_configuration.xsd">
    <body>
        <referenceContainer name="after.body.start">
            <block class="YourCompany\Chatbot\Block\Chatbot" name="chatbot" template="YourCompany_Chatbot::chatbot.phtml"/>
        </referenceContainer>
    </body>
</page>
```

**view/frontend/templates/chatbot.phtml:**

```php
<?php
$apiKey = $this->getConfig('chatbot_api_key');
$title = $this->getConfig('chatbot_title') ?: 'Support Chat';
?>

<?php if ($apiKey): ?>
<script src="https://unpkg.com/react@19/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/react-chatbot-component/dist/react-chatbot-component.umd.js"></script>

<react-chatbot
  title="<?= $this->escapeHtml($title) ?>"
  api-key="<?= $this->escapeHtml($apiKey) ?>"
  position="bottom-right"
  welcome-message="Welcome! How can I help you today?"
></react-chatbot>

<script>
// Magento-specific integration
document.querySelector('react-chatbot').addEventListener('chatbot-message', async (event) => {
  const { message, apiKey } = event.detail;

  const customerData = {
    customer_id: <?= $this->getCustomerId() ?: 'null' ?>,
    store_code: '<?= $this->getStoreCode() ?>',
    currency: '<?= $this->getCurrentCurrency() ?>'
  };

  // Send to your API endpoint
  // ... implementation similar to other platforms
});
</script>
<?php endif; ?>
```

### PrestaShop

Add to your theme's footer hook:

```php
// In your theme's footer.tpl or via module
{if $chatbot_api_key}
<script src="https://unpkg.com/react@19/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/react-chatbot-component/dist/react-chatbot-component.umd.js"></script>

<react-chatbot
  title="{$shop.name} Support"
  api-key="{$chatbot_api_key}"
  position="bottom-right"
  welcome-message="Welcome to {$shop.name}! How can I help you?"
></react-chatbot>
{/if}
```

### BigCommerce

#### Stencil Theme Integration

Add to your theme's `templates/layout/base.html`:

```html
<!-- Before closing </body> tag -->
{{#if theme_settings.chatbot_api_key}}
<script src="https://unpkg.com/react@19/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/react-chatbot-component/dist/react-chatbot-component.umd.js"></script>

<react-chatbot
  title="{{settings.store_name}} Support"
  api-key="{{theme_settings.chatbot_api_key}}"
  position="{{theme_settings.chatbot_position}}"
  theme='{"primary": "{{theme_settings.color_primary}}"}'
  welcome-message="{{theme_settings.chatbot_welcome}}"
></react-chatbot>
{{/if}}
```

## 🎨 Customization Options

### Available Attributes

| Attribute               | Type        | Default                            | Description                                              |
| ----------------------- | ----------- | ---------------------------------- | -------------------------------------------------------- |
| `title`                 | string      | "Chat Assistant"                   | Chatbot window title                                     |
| `api-key`               | string      | -                                  | Your API key for backend integration                     |
| `position`              | string      | "bottom-right"                     | Position: bottom-right, bottom-left, top-right, top-left |
| `welcome-message`       | string      | "Hello! How can I help you today?" | Initial message from bot                                 |
| `placeholder`           | string      | "Type your message..."             | Input placeholder text                                   |
| `max-messages`          | number      | 100                                | Maximum messages to keep in memory                       |
| `show-typing-indicator` | boolean     | true                               | Show typing animation                                    |
| `enable-sound`          | boolean     | false                              | Enable notification sounds                               |
| `theme`                 | JSON string | -                                  | Custom theme object                                      |

### Theme Customization

```html
<react-chatbot
  theme='{
    "primary": "#ff6b35",
    "secondary": "#004e89", 
    "accent": "#ffa500",
    "background": "#ffffff",
    "surface": "#f8f9fa",
    "text": "#212529",
    "textSecondary": "#6c757d",
    "border": "#dee2e6",
    "font": "Inter, sans-serif"
  }'
></react-chatbot>
```

### Programmatic Control

```javascript
// Get chatbot element
const chatbot = document.querySelector("react-chatbot");

// Set custom message handler
chatbot.setMessageHandler(async (message, apiKey) => {
  // Your custom logic
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ message }),
  });
  return response.text();
});

// Update configuration
chatbot.updateConfiguration({
  title: "New Title",
  theme: { primary: "#new-color" },
});

// Listen to events
chatbot.addEventListener("chatbot-message", (event) => {
  console.log("User message:", event.detail.message);
});
```

## 🔧 Backend Integration

### API Endpoint Example (Node.js/Express)

```javascript
app.post("/api/chat", async (req, res) => {
  const { message, apiKey } = req.body;

  // Validate API key
  if (!validateApiKey(apiKey)) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  // Process message with your AI service
  const response = await processWithAI(message, {
    context: req.user,
    platform: req.headers["x-platform"] || "web",
  });

  res.json({ response });
});
```

### Security Best Practices

1. **API Key Management**: Store API keys securely, never in client-side code
2. **Rate Limiting**: Implement rate limiting on your API endpoints
3. **Input Validation**: Always validate and sanitize user inputs
4. **CORS Configuration**: Configure CORS properly for your domain
5. **HTTPS Only**: Always use HTTPS in production

## 📱 Responsive Design

The chatbot automatically adapts to different screen sizes:

- **Mobile**: Optimized touch interactions, full-screen on small devices
- **Tablet**: Adjusted sizing for touch interfaces
- **Desktop**: Full-featured interface with hover states

## ♿ Accessibility

- **Screen Reader Support**: Proper ARIA labels and roles
- **Keyboard Navigation**: Full keyboard accessibility
- **High Contrast**: Supports system high contrast mode
- **Reduced Motion**: Respects user's motion preferences

## 🚀 Performance

- **Lazy Loading**: Chat interface loads only when needed
- **Optimized Animations**: Hardware-accelerated GSAP animations
- **Small Bundle**: Optimized build with tree shaking
- **CDN Ready**: Global CDN distribution for fast loading

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

- 📧 Email: support@your-domain.com
- 💬 Discord: [Join our server](https://discord.gg/your-server)
- 📖 Documentation: [https://docs.your-domain.com](https://docs.your-domain.com)
