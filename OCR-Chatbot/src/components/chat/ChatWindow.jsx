import { useRef } from "react";
import MessageList from "./MessageList";
import InputBar from "./InputBar";
import Header from "./Header";
import GradientBackground from "../ui/GradientBackground";
import { useChat } from "../../hooks/useChat";

export default function ChatWindow() {
  const { messages, isLoading, send, retryMessage, dismissError } = useChat();
  const inputBarRef = useRef(null);

  // Handle prompt selection from EmptyState
  const handlePromptSelect = (promptText) => {
    if (inputBarRef.current) {
      inputBarRef.current.setText(promptText);
    }
  };

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      {/* Animated gradient background layer */}
      <GradientBackground />
      
      {/* Main chat container with glassmorphism */}
      <div className="relative z-10 flex h-full flex-col transition-colors duration-300">
        {/* Header component */}
        <Header />

        {/* Message list - main content area */}
        <MessageList 
          id="main-content"
          messages={messages} 
          isLoading={isLoading} 
          onPromptSelect={handlePromptSelect}
          onRetryMessage={retryMessage}
          onDismissError={dismissError}
        />

        {/* Input bar */}
        <InputBar 
          ref={inputBarRef}
          onSend={send} 
          disabled={isLoading} 
        />
      </div>
    </div>
  );
}