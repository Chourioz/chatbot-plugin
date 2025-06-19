import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { ReactChatbot } from "./chatbot";
import "./styles.css";

const DemoApp: React.FC = () => {
  const [theme, setTheme] = useState({
    primary: "#3b82f6",
    secondary: "#1e40af",
    accent: "#60a5fa",
  });

  const [position, setPosition] = useState<"bottom-right" | "bottom-left" | "top-right" | "top-left">("bottom-right");

  // Simulate API response with delay
  const handleMessage = async (message: string): Promise<string> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Enhanced responses based on message content
    const responses = {
      hello: "¡Hola! 👋 Soy tu asistente con animaciones GSAP. ¿En qué puedo ayudarte?",
      animation: "¡Las animaciones GSAP son increíbles! 🎨 Ofrecen transiciones fluidas y profesionales.",
      gsap: "GSAP (GreenSock Animation Platform) es la librería de animación más potente para web. ✨",
      test: "¡Perfecto! Las animaciones están funcionando correctamente. 🚀",
      smooth: "¿Has notado lo suaves que son las transiciones? Eso es el poder de GSAP. 💫",
      icon: "Los iconos del botón flotante ahora tienen transiciones fluidas con rotación y escala. 🔄",
      chat: "La ventana del chat se abre con una animación back.out que se siente muy natural. 📱",
      message: "Cada mensaje aparece con una animación única desde diferentes direcciones. 💬",
      button: "El botón flotante tiene efectos de hover, pulse y feedback táctil mejorados. 🎯",
      default: "Mensaje recibido. Las animaciones GSAP hacen que todo se sienta más fluido y profesional. ✨"
    };

    const lowerMessage = message.toLowerCase();
    const responseKey = Object.keys(responses).find(key => 
      lowerMessage.includes(key)
    ) as keyof typeof responses;

    return responses[responseKey] || responses.default;
  };

  const themePresets = [
    { name: "Azul Clásico", primary: "#3b82f6", secondary: "#1e40af", accent: "#60a5fa" },
    { name: "Verde Esmeralda", primary: "#10b981", secondary: "#047857", accent: "#34d399" },
    { name: "Púrpura Real", primary: "#8b5cf6", secondary: "#7c3aed", accent: "#a78bfa" },
    { name: "Rosa Vibrante", primary: "#ec4899", secondary: "#db2777", accent: "#f472b6" },
    { name: "Naranja Energético", primary: "#f59e0b", secondary: "#d97706", accent: "#fbbf24" },
    { name: "Rojo Pasión", primary: "#ef4444", secondary: "#dc2626", accent: "#f87171" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 React Chatbot con Animaciones GSAP
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Experimenta transiciones fluidas y animaciones profesionales
          </p>
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              ✨ Nuevas Características de Animación
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Transición fluida de iconos con rotación</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Animación de apertura/cierre mejorada</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Mensajes con animaciones direccionales</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Botón flotante con efectos avanzados</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Indicador de escritura animado</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Scroll automático suave</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Theme Selector */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              🎨 Selector de Tema
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {themePresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setTheme({
                    primary: preset.primary,
                    secondary: preset.secondary,
                    accent: preset.accent,
                  })}
                  className="flex items-center space-x-2 p-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
                  style={{
                    borderColor: theme.primary === preset.primary ? preset.primary : undefined,
                    backgroundColor: theme.primary === preset.primary ? `${preset.primary}10` : undefined,
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Position Selector */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              📍 Posición del Chatbot
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "bottom-right", label: "Abajo Derecha", icon: "↘️" },
                { value: "bottom-left", label: "Abajo Izquierda", icon: "↙️" },
                { value: "top-right", label: "Arriba Derecha", icon: "↗️" },
                { value: "top-left", label: "Arriba Izquierda", icon: "↖️" },
              ].map((pos) => (
                <button
                  key={pos.value}
                  onClick={() => setPosition(pos.value as any)}
                  className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                    position === pos.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="text-lg">{pos.icon}</span>
                  <span className="text-sm font-medium text-gray-700">
                    {pos.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            🎯 Prueba las Animaciones
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Mensajes de Prueba:</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">hello</code>
                  <span>- Saludo con animación</span>
                </div>
                <div className="flex items-center space-x-2">
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">animation</code>
                  <span>- Información sobre animaciones</span>
                </div>
                <div className="flex items-center space-x-2">
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">gsap</code>
                  <span>- Detalles sobre GSAP</span>
                </div>
                <div className="flex items-center space-x-2">
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">test</code>
                  <span>- Prueba de funcionamiento</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Interacciones:</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-500">👆</span>
                  <span>Haz clic en el botón flotante</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">🖱️</span>
                  <span>Observa el hover del botón</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-purple-500">💬</span>
                  <span>Envía mensajes para ver animaciones</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-orange-500">⌨️</span>
                  <span>Usa Enter para enviar rápido</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            ⚡ Optimizaciones de Rendimiento GSAP
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
            <div className="flex items-start space-x-2">
              <span className="text-blue-500 mt-0.5">🚀</span>
              <div>
                <div className="font-medium">Hardware Acceleration</div>
                <div className="text-blue-600">translateZ(0) y backface-visibility</div>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-500 mt-0.5">🎯</span>
              <div>
                <div className="font-medium">Will-Change Optimization</div>
                <div className="text-blue-600">Propiedades específicas por elemento</div>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-500 mt-0.5">🔄</span>
              <div>
                <div className="font-medium">Context Safe</div>
                <div className="text-blue-600">Limpieza automática de animaciones</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chatbot Component */}
      <ReactChatbot
        title="GSAP Demo Assistant"
        placeholder="Escribe 'hello', 'animation', 'gsap' o cualquier mensaje..."
        position={position}
        theme={theme}
        maxMessages={50}
        showTypingIndicator={true}
        className="demo-chatbot"
        apiKey="sk_b151d0cef082828f860a4b9ba5c1b7f253548a8a196b2539bd3b8086318b431d"
      />
    </div>
  );
};

// Mount the app
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<DemoApp />);
} else {
  console.error("Root container not found");
}
