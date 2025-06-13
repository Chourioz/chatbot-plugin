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
