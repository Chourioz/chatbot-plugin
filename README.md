# VentaBot24 - Asistente de Ventas Inteligente

> El chatbot de ventas 24/7 que revoluciona tu e-commerce. Reduce hasta 80% los mensajes de WhatsApp y aumenta tus ventas mientras duermes.

[![npm version](https://badge.fury.io/js/%40chouriodev%2Fcustom-agent-sales-chatbot.svg)](https://badge.fury.io/js/%40chouriodev%2Fcustom-agent-sales-chatbot)
[![npm downloads](https://img.shields.io/npm/dm/@chouriodev/custom-agent-sales-chatbot)](https://www.npmjs.com/package/@chouriodev/custom-agent-sales-chatbot) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[🚀 Demo en Vivo](https://ventabot24.com/demo) • [📖 Documentación](https://docs.ventabot24.com) • [💬 Comunidad](https://discord.gg/ventabot24)

## 🇻🇪 Diseñado para PyMEs Venezolanas

**¿Cansado de responder las mismas preguntas sobre productos a todas horas?**

VentaBot24 es tu asistente de ventas inteligente que trabaja 24/7 en tu e-commerce, respondiendo preguntas de clientes, recomendando productos y cerrando ventas mientras tú te enfocas en hacer crecer tu negocio.

### 🎯 Perfecto para:

- Tiendas en Instagram/Facebook que reciben muchos DMs
- E-commerce que necesitan atención fuera del horario laboral
- Empresarios que quieren automatizar consultas repetitivas
- Negocios que buscan aumentar conversiones sin contratar personal

## ✨ ¿Por qué VentaBot24?

### 📱 **Reduce Mensajes de WhatsApp hasta 80%**

- Responde automáticamente consultas sobre productos, precios y disponibilidad
- Filtra clientes calificados antes que lleguen a tu WhatsApp personal
- Maneja múltiples consultas simultáneamente

### 🕐 **Ventas 24/7 Sin Interrupciones**

- Tu asistente nunca duerme, come o toma vacaciones
- Atiende clientes en madrugada, fines de semana y feriados
- Aumenta tus ventas capturando clientes fuera del horario laboral

### 🤖 **Inteligencia Artificial Entrenada para Ventas**

- Conoce tu catálogo de productos al detalle
- Hace recomendaciones personalizadas basadas en preferencias
- Acompaña al cliente desde la consulta hasta la compra

### 🛍️ **Integración Universal**

- Funciona con cualquier plataforma: WooCommerce, Shopify, Tienda Nube
- Compatible con sitios hechos en WordPress, HTML, React, Vue
- Instalación en 5 minutos con solo pegar un código

### 📊 **Analytics que Importan**

- Seguimiento de conversiones y ventas generadas
- Reportes de preguntas más frecuentes
- Métricas de satisfacción del cliente

## 🚀 Instalación Súper Fácil

### 1. Obtén tu Clave API

**[🔑 Registrarse GRATIS →](https://ventabot24.com/registro)**

1. Crea tu cuenta gratuita
2. Configura tu catálogo de productos
3. Personaliza respuestas de tu bot
4. Copia tu clave API

### 2. Versión Gratuita Incluye:

- ✅ **Conversaciones ilimitadas**
- ✅ **Catálogo de productos completo**
- ✅ **Integración fácil**
- ✅ **Soporte por email**

### 3. Agrega a tu Sitio Web

#### Para WordPress/WooCommerce

```html
<!-- Pega antes de </body> en tu tema -->
<script src="https://unpkg.com/react@19/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@chouriodev/custom-agent-sales-chatbot/dist/react-chatbot-component.umd.js"></script>

<react-chatbot
  api-key="tu-clave-api-aqui"
  position="bottom-right"
></react-chatbot>
```

#### Para Shopify

```liquid
<!-- En theme.liquid antes de </body> -->
<script src="https://unpkg.com/react@19/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@chouriodev/custom-agent-sales-chatbot/dist/react-chatbot-component.umd.js"></script>

<react-chatbot
  api-key="tu-clave-api-aqui"
  position="bottom-right"
></react-chatbot>
```

#### Para React/Next.js

```bash
npm install @chouriodev/custom-agent-sales-chatbot
```

```jsx
import "@chouriodev/custom-agent-sales-chatbot/dist/style.css";

function App() {
  return (
    <div>
      {/* Tu contenido */}
      <react-chatbot api-key="tu-clave-api-aqui" position="bottom-right" />
    </div>
  );
}
```

#### Para Cualquier Sitio Web

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Mi Tienda Online</title>
  </head>
  <body>
    <h1>Bienvenidos a mi tienda</h1>

    <!-- Scripts de VentaBot24 -->
    <script src="https://unpkg.com/react@19/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@chouriodev/custom-agent-sales-chatbot/dist/react-chatbot-component.umd.js"></script>

    <!-- Tu asistente de ventas -->
    <react-chatbot
      api-key="tu-clave-api-aqui"
      position="bottom-right"
    ></react-chatbot>
  </body>
</html>
```

## 🎨 Personalización Total

### Configuración desde Panel de Administración

Toda la personalización visual y funcional se maneja desde tu **panel de control**:

- 🎨 **Colores de tu marca** (primario, secundario, acentos)
- 💬 **Mensajes personalizados** (bienvenida, despedida, etc.)
- 🛍️ **Catálogo de productos** y descripciones
- 🤖 **Personalidad del bot** y tono de respuestas
- 📊 **Analytics y reportes** personalizados

### Posicionamiento

```html
<react-chatbot position="bottom-left"></react-chatbot>
<!-- Opciones: bottom-right | bottom-left | top-left | top-right -->
```

### Atributos Disponibles

| Atributo   | Tipo   | Por Defecto    | Descripción                                 |
| ---------- | ------ | -------------- | ------------------------------------------- |
| `api-key`  | string | -              | Tu clave API para autenticación (requerida) |
| `position` | string | "bottom-right" | Posición en pantalla                        |

> **Nota:** Toda la personalización (colores, mensajes, productos, configuración) se maneja desde tu panel de administración y se sincroniza automáticamente con el componente usando tu API key.

## 🔧 Soporte y Comunidad

- **[💬 Comunidad Discord](https://discord.gg/ventabot24)** - Conecta con otros emprendedores
- **[📧 Soporte Email](mailto:soporte@ventabot24.com)** - Asistencia técnica
- **[🐛 Reportar Errores](https://github.com/Chourioz/ventabot24/issues)** - Mejoramos constantemente
- **[💡 Sugerencias](https://github.com/Chourioz/ventabot24/discussions)** - Tu feedback nos importa

## 📚 Recursos Útiles

- **[📖 Documentación Completa](https://docs.ventabot24.com)** - Guías paso a paso
- **[🎨 Guía de Personalización](https://docs.ventabot24.com/personalizacion)** - Adapta el bot a tu marca
- **[🛍️ Integración E-commerce](https://docs.ventabot24.com/ecommerce)** - Guías por plataforma
- **[📱 Optimización Móvil](https://docs.ventabot24.com/movil)** - Mejores prácticas
- **[📊 Guía de Analytics](https://docs.ventabot24.com/analytics)** - Entiende tus métricas

## ⚡ Rendimiento Optimizado

- **Tamaño**: ~45KB comprimido
- **Carga**: <100ms en 3G
- **Impacto**: Mínimo en tu sitio
- **CDN**: Distribución global para máxima velocidad

## 🔒 Seguridad y Privacidad

- Datos encriptados end-to-end
- Cumple con GDPR y leyes venezolanas
- Sin almacenamiento de información sensible
- Auditado por terceros

## 📄 Licencia

MIT © [VentaBot24](https://ventabot24.com)

---

**[🔑 Comenzar Gratis](https://ventabot24.com/registro)** • **[📖 Documentación](https://docs.ventabot24.com)** • **[💬 Comunidad](https://discord.gg/ventabot24)**

_Revoluciona tu e-commerce hoy. Tu primer asistente de ventas inteligente te está esperando._
