# 🛍️ Ecommerce Integration Guide

## Respuesta a tu Pregunta

**¡SÍ!** Tu web component de React chatbot puede ser perfectamente usado en plataformas de ecommerce como WooCommerce, Shopify, Magento, PrestaShop, BigCommerce, etc.

### ✅ **Lo que YA tienes funcionando:**

1. **Custom Element nativo** (`<react-chatbot>`) - Compatible con cualquier HTML
2. **Shadow DOM** - Aislamiento completo de estilos
3. **Atributos HTML** - Incluyendo `api-key`, `title`, `position`, etc.
4. **Eventos personalizados** - Para comunicación con la plataforma host
5. **Build UMD** - Para uso directo via CDN sin npm

## 🚀 Integración Inmediata

### Uso Básico (Funciona AHORA)

```html
<!-- Cargar dependencias -->
<script src="https://unpkg.com/react@19/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"></script>
<script src="./dist/react-chatbot-component.umd.js"></script>

<!-- Usar el chatbot -->
<react-chatbot
  title="Soporte Tienda"
  api-key="tu-api-key-aqui"
  position="bottom-right"
  theme='{"primary": "#e91e63", "secondary": "#ad1457"}'
  welcome-message="¡Hola! ¿En qué puedo ayudarte con tu compra?"
></react-chatbot>
```

## 🛒 Integración por Plataforma

### WooCommerce (WordPress)

#### Opción 1: Via Tema (Más Simple)

**Agregar en `functions.php` del tema:**

```php
function agregar_chatbot_woocommerce() {
    // Solo mostrar en páginas públicas
    if (is_admin()) return;

    $api_key = get_option('mi_chatbot_api_key', '');
    if (empty($api_key)) return;

    ?>
    <script src="https://unpkg.com/react@19/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/react-chatbot-component/dist/react-chatbot-component.umd.js"></script>

    <react-chatbot
      title="<?php echo esc_attr(get_bloginfo('name')); ?> - Soporte"
      api-key="<?php echo esc_attr($api_key); ?>"
      position="bottom-right"
      welcome-message="¡Bienvenido a <?php echo esc_attr(get_bloginfo('name')); ?>! ¿Te ayudo con algo?"
      theme='{"primary": "<?php echo get_theme_mod('accent_color', '#e91e63'); ?>"}'
    ></react-chatbot>

    <script>
    // Manejo de mensajes con contexto WooCommerce
    document.querySelector('react-chatbot').addEventListener('chatbot-message', async (event) => {
      const { message, apiKey } = event.detail;

      // Datos del contexto de WooCommerce
      const contextData = {
        platform: 'woocommerce',
        user_id: <?php echo get_current_user_id(); ?>,
        cart_count: <?php echo WC()->cart ? WC()->cart->get_cart_contents_count() : 0; ?>,
        <?php if (WC()->cart): ?>
        cart_total: <?php echo WC()->cart->get_cart_total(); ?>,
        <?php endif; ?>
        current_page: '<?php echo is_shop() ? 'shop' : (is_product() ? 'product' : (is_cart() ? 'cart' : 'other')); ?>',
        <?php if (is_product()): ?>
        product_id: <?php echo get_the_ID(); ?>,
        <?php endif; ?>
      };

      try {
        const response = await fetch('/wp-json/mi-chatbot/v1/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': '<?php echo wp_create_nonce('wp_rest'); ?>'
          },
          body: JSON.stringify({
            message,
            apiKey,
            context: contextData
          })
        });

        const data = await response.json();
        return data.response || 'Gracias por tu mensaje. Te ayudaremos pronto.';
      } catch (error) {
        console.error('Error:', error);
        return 'Disculpa, tengo problemas técnicos. Intenta de nuevo.';
      }
    });
    </script>
    <?php
}
add_action('wp_footer', 'agregar_chatbot_woocommerce');

// Agregar opción de configuración
function chatbot_add_admin_option() {
    add_option('mi_chatbot_api_key', '');
}
add_action('admin_init', 'chatbot_add_admin_option');
```

**Endpoint para manejar mensajes (`functions.php`):**

```php
// Registrar endpoint REST API
add_action('rest_api_init', function () {
    register_rest_route('mi-chatbot/v1', '/message', array(
        'methods' => 'POST',
        'callback' => 'manejar_mensaje_chatbot',
        'permission_callback' => '__return_true',
    ));
});

function manejar_mensaje_chatbot($request) {
    $params = $request->get_json_params();
    $message = sanitize_text_field($params['message']);
    $api_key = sanitize_text_field($params['apiKey']);
    $context = $params['context'];

    // Validar API key (implementar tu lógica)
    if (!validar_api_key($api_key)) {
        return new WP_Error('invalid_key', 'API key inválida', array('status' => 401));
    }

    // Procesar mensaje con tu servicio de IA
    $response = procesar_con_tu_api($message, $context, $api_key);

    return array('response' => $response);
}

function validar_api_key($api_key) {
    // Tu lógica de validación
    return !empty($api_key);
}

function procesar_con_tu_api($message, $context, $api_key) {
    // Llamada a tu servicio de IA
    // Por ejemplo: OpenAI, Claude, tu propio servicio, etc.

    // Ejemplo básico:
    if (strpos(strtolower($message), 'precio') !== false && !empty($context['product_id'])) {
        $product = wc_get_product($context['product_id']);
        return "El precio de " . $product->get_name() . " es " . $product->get_price_html();
    }

    if (strpos(strtolower($message), 'carrito') !== false) {
        return "Tienes " . $context['cart_count'] . " productos en tu carrito.";
    }

    // Respuesta por defecto
    return "Gracias por tu mensaje: '" . $message . "'. Un agente te contactará pronto.";
}
```

#### Opción 2: Plugin Personalizado

**Crear plugin:** `wp-content/plugins/mi-chatbot/mi-chatbot.php`

```php
<?php
/*
Plugin Name: Mi Chatbot Ecommerce
Description: Chatbot integrado para WooCommerce
Version: 1.0.0
Author: Tu Nombre
*/

// Prevenir acceso directo
if (!defined('ABSPATH')) exit;

class MiChatbotEcommerce {

    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('admin_menu', array($this, 'admin_menu'));
        add_action('wp_footer', array($this, 'render_chatbot'));
        add_action('rest_api_init', array($this, 'register_rest_routes'));
    }

    public function init() {
        // Inicialización del plugin
    }

    public function admin_menu() {
        add_options_page(
            'Configuración Chatbot',
            'Mi Chatbot',
            'manage_options',
            'mi-chatbot-config',
            array($this, 'admin_page')
        );
    }

    public function admin_page() {
        if (isset($_POST['submit'])) {
            update_option('mi_chatbot_api_key', sanitize_text_field($_POST['api_key']));
            update_option('mi_chatbot_title', sanitize_text_field($_POST['title']));
            update_option('mi_chatbot_welcome', sanitize_text_field($_POST['welcome']));
            echo '<div class="notice notice-success"><p>¡Configuración guardada!</p></div>';
        }

        $api_key = get_option('mi_chatbot_api_key', '');
        $title = get_option('mi_chatbot_title', 'Soporte');
        $welcome = get_option('mi_chatbot_welcome', '¡Hola! ¿Te ayudo?');
        ?>
        <div class="wrap">
            <h1>Configuración del Chatbot</h1>
            <form method="post">
                <table class="form-table">
                    <tr>
                        <th scope="row">API Key</th>
                        <td><input type="text" name="api_key" value="<?php echo esc_attr($api_key); ?>" class="regular-text" required /></td>
                    </tr>
                    <tr>
                        <th scope="row">Título</th>
                        <td><input type="text" name="title" value="<?php echo esc_attr($title); ?>" class="regular-text" /></td>
                    </tr>
                    <tr>
                        <th scope="row">Mensaje de Bienvenida</th>
                        <td><textarea name="welcome" rows="3" class="regular-text"><?php echo esc_textarea($welcome); ?></textarea></td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }

    public function render_chatbot() {
        if (is_admin()) return;

        $api_key = get_option('mi_chatbot_api_key', '');
        if (empty($api_key)) return;

        $title = get_option('mi_chatbot_title', 'Soporte');
        $welcome = get_option('mi_chatbot_welcome', '¡Hola! ¿Te ayudo?');

        // Renderizar chatbot (código similar al de arriba)
        // ...
    }

    public function register_rest_routes() {
        register_rest_route('mi-chatbot/v1', '/message', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_message'),
            'permission_callback' => '__return_true',
        ));
    }

    public function handle_message($request) {
        // Manejo de mensajes (código similar al de arriba)
        // ...
    }
}

// Inicializar plugin
new MiChatbotEcommerce();
?>
```

### Shopify

**En `theme.liquid` (antes de `</body>`):**

```liquid
<!-- Chatbot para Shopify -->
<script src="https://unpkg.com/react@19/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/react-chatbot-component/dist/react-chatbot-component.umd.js"></script>

{% if settings.chatbot_api_key != blank %}
<react-chatbot
  title="{{ shop.name }} - Soporte"
  api-key="{{ settings.chatbot_api_key }}"
  position="{{ settings.chatbot_position | default: 'bottom-right' }}"
  theme='{"primary": "{{ settings.colors_accent_1 }}", "secondary": "{{ settings.colors_accent_2 }}"}'
  welcome-message="{{ settings.chatbot_welcome | default: '¡Bienvenido! ¿En qué puedo ayudarte?' }}"
></react-chatbot>

<script>
document.querySelector('react-chatbot').addEventListener('chatbot-message', async (event) => {
  const { message, apiKey } = event.detail;

  // Contexto específico de Shopify
  const shopifyContext = {
    platform: 'shopify',
    shop: '{{ shop.permanent_domain }}',
    customer: {
      id: {{ customer.id | default: 'null' }},
      email: '{{ customer.email | default: "" }}',
      name: '{{ customer.first_name | default: "" }} {{ customer.last_name | default: "" }}'
    },
    cart: {
      count: {{ cart.item_count }},
      total: {{ cart.total_price | money_without_currency }},
      currency: '{{ cart.currency.iso_code }}'
    },
    page: {
      type: '{{ request.page_type }}',
      {% if product %}
      product_id: {{ product.id }},
      product_title: '{{ product.title | escape }}',
      {% endif %}
      {% if collection %}
      collection: '{{ collection.handle }}',
      {% endif %}
    }
  };

  try {
    // Llamar a tu API externa
    const response = await fetch('https://tu-api.com/chat/shopify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-Shopify-Shop': '{{ shop.permanent_domain }}'
      },
      body: JSON.stringify({
        message,
        context: shopifyContext
      })
    });

    const data = await response.json();
    return data.response || 'Gracias por tu mensaje. Te ayudaremos pronto.';
  } catch (error) {
    console.error('Chatbot error:', error);
    return 'Disculpa, hay un problema técnico. Intenta contactarnos directamente.';
  }
});
</script>
{% endif %}
```

**Configuración en `settings_schema.json`:**

```json
{
  "name": "Chatbot",
  "settings": [
    {
      "type": "text",
      "id": "chatbot_api_key",
      "label": "API Key del Chatbot",
      "info": "Ingresa tu clave API para el servicio de chatbot"
    },
    {
      "type": "text",
      "id": "chatbot_welcome",
      "label": "Mensaje de Bienvenida",
      "default": "¡Hola! ¿En qué puedo ayudarte hoy?"
    },
    {
      "type": "select",
      "id": "chatbot_position",
      "label": "Posición del Chatbot",
      "options": [
        { "value": "bottom-right", "label": "Abajo Derecha" },
        { "value": "bottom-left", "label": "Abajo Izquierda" },
        { "value": "top-right", "label": "Arriba Derecha" },
        { "value": "top-left", "label": "Arriba Izquierda" }
      ],
      "default": "bottom-right"
    }
  ]
}
```

## 🔑 Manejo de API Keys

### Opciones Seguras para Pasar API Key:

#### 1. **Via Atributo HTML** (Actual)

```html
<react-chatbot api-key="tu-api-key"></react-chatbot>
```

#### 2. **Via JavaScript** (Más Seguro)

```javascript
const chatbot = document.querySelector("react-chatbot");
chatbot.setMessageHandler(async (message) => {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + obtenerApiKeySegura(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });
  return response.text();
});

function obtenerApiKeySegura() {
  // Obtener desde tu backend o configuración segura
  return "api-key-desde-backend";
}
```

#### 3. **Via Configuración del Servidor** (Más Seguro)

```javascript
// El API key nunca se expone al cliente
const chatbot = document.querySelector("react-chatbot");
chatbot.addEventListener("chatbot-message", async (event) => {
  const { message } = event.detail;

  // Enviar a TU endpoint que maneja el API key
  const response = await fetch("/wp-json/mi-chatbot/v1/message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  return response.text();
});
```

## 🎨 Personalización para Ecommerce

### Temas Personalizados por Marca

```javascript
// Función para generar tema desde colores de la marca
function generarTemaPersonalizado(colorPrimario, colorSecundario) {
  return {
    primary: colorPrimario,
    secondary: colorSecundario,
    accent: ajustarBrillo(colorPrimario, 0.2),
    background: "#ffffff",
    surface: "#f8f9fa",
    text: "#212529",
    textSecondary: "#6c757d",
    border: "#dee2e6",
  };
}

// Aplicar tema dinámicamente
const tema = generarTemaPersonalizado("#e91e63", "#ad1457");
document
  .querySelector("react-chatbot")
  .setAttribute("theme", JSON.stringify(tema));
```

### Contexto Específico de Ecommerce

```javascript
function obtenerContextoEcommerce() {
  return {
    // Información del usuario
    usuario: {
      id: obtenerUserId(),
      tipo: obtenerTipoUsuario(), // 'guest', 'customer', 'vip'
      idioma: obtenerIdioma(),
    },

    // Información del carrito
    carrito: {
      productos: obtenerProductosCarrito(),
      total: obtenerTotalCarrito(),
      moneda: obtenerMoneda(),
    },

    // Contexto de la página
    pagina: {
      tipo: obtenerTipoPagina(), // 'home', 'product', 'cart', 'checkout'
      producto: obtenerProductoActual(),
      categoria: obtenerCategoriaActual(),
    },

    // Información de la tienda
    tienda: {
      nombre: obtenerNombreTienda(),
      dominio: window.location.hostname,
      plataforma: "woocommerce", // o 'shopify', etc.
    },
  };
}
```

## 🚀 Siguiente Paso: Publicar tu Componente

### 1. Publicar en NPM

```bash
# En tu proyecto
npm login
npm publish
```

### 2. Configurar CDN

Una vez publicado en NPM, estará automáticamente disponible en:

- `https://unpkg.com/react-chatbot-component@latest/dist/react-chatbot-component.umd.js`
- `https://cdn.jsdelivr.net/npm/react-chatbot-component@latest/dist/react-chatbot-component.umd.js`

### 3. Documentación para Usuarios

Crea documentación específica para cada plataforma con ejemplos de código copy-paste.

## ✅ Resumen

**TU WEB COMPONENT YA ESTÁ LISTO** para ser usado en cualquier plataforma de ecommerce. Solo necesitas:

1. **Buildear el proyecto**: `npm run build`
2. **Publicar en NPM**: `npm publish`
3. **Documentar la integración** para cada plataforma
4. **Proporcionar ejemplos** específicos con manejo de API keys

Las plataformas de ecommerce pueden usar tu chatbot simplemente agregando los script tags y el elemento `<react-chatbot>` con los atributos necesarios.

**¡Tu solución es perfecta para el mercado de ecommerce!** 🎉
