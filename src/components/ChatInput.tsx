import React, { useState, useCallback, memo } from 'react';

// Tipado para las props del componente
interface ChatInputProps {
  onSubmit: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

// Componente puro e aislado para el input del chat
// Usa memo para evitar renderizados innecesarios
const ChatInput = memo<ChatInputProps>(({ 
  onSubmit, 
  placeholder = "Type your message...", 
  disabled = false
}) => {
  // Estado local para el valor del input
  // Esto evita que el componente padre se re-renderice en cada keystroke
  const [inputValue, setInputValue] = useState('');

  // Función memoizada para manejar el cambio del input
  // Solo cambia si alguna dependencia cambia
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
  }, []);

  // Función memoizada para manejar el submit
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // Solo envía si hay contenido (sin espacios vacíos)
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !disabled) {
      // Llama al callback del padre con el mensaje
      onSubmit(trimmedValue);
      // Limpia el input después del envío
      setInputValue('');
    }
  }, [inputValue, onSubmit, disabled]);

  // Función memoizada para manejar Enter
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  return (
    <form onSubmit={handleSubmit} className="chat-input-form">
      <div className="input-container">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="chat-input"
          autoComplete="off"
        />
        <button 
          type="submit" 
          disabled={disabled || !inputValue.trim()}
          className="send-button"
          aria-label="Send message"
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M2 21L23 12L2 3V10L17 12L2 14V21Z" 
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </form>
  );
});

// Asignar displayName para debugging
ChatInput.displayName = 'ChatInput';

export default ChatInput; 