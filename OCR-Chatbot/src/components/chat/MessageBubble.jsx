import { motion } from "framer-motion";
import { User, Bot } from "lucide-react";
import StreamingText from "./StreamingText";
import ErrorMessage from "./ErrorMessage";
import LazyImage from "../ui/LazyImage";

export default function MessageBubble({ message, onRetry, onDismiss }) {
  const isUser = message.role === "user";
  const isError = message.type === "error";
  
  // If this is an error message, render the ErrorMessage component
  if (isError) {
    return (
      <ErrorMessage
        message={message.content}
        onRetry={onRetry ? () => onRetry(message) : null}
        onDismiss={onDismiss ? () => onDismiss(message.id) : null}
        errorType={message.errorType}
      />
    );
  }
  
  // Determine if this message should use streaming animation
  // Only stream AI messages that are newly added (you can add additional logic here)
  const shouldStream = !isUser && message.isStreaming !== false;

  // Format timestamp
  const timestamp = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex gap-3 my-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {/* Avatar for AI messages (left side) */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}

      {/* Message bubble container */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.15 }}
        className="flex flex-col max-w-[85%] md:max-w-[80%]"
      >
        {/* Message bubble */}
        <div
          className={`rounded-2xl px-4 py-3 shadow-xl backdrop-blur-lg transition-shadow duration-150 hover:shadow-2xl ${
            isUser
              ? "bg-gradient-to-br from-purple-500 to-blue-600 text-white"
              : "bg-white/10 text-gray-100 border border-white/20"
          }`}
        >
          {message.attachment?.type && (
            <div className="mb-2">
              {message.attachment.type === 'image' && message.attachment.url ? (
                <LazyImage
                  src={message.attachment.url}
                  alt="Attached image"
                  className="rounded-lg max-w-full h-auto"
                  placeholderClassName="rounded-lg w-full h-48"
                />
              ) : (
                <div className="text-xs opacity-80">
                  Attached {message.attachment.type}
                </div>
              )}
            </div>
          )}
          <div className="whitespace-pre-wrap text-sm leading-6">
            {shouldStream ? (
              <StreamingText
                text={message.content}
                speed={40}
              />
            ) : (
              message.content
            )}
          </div>
        </div>

        {/* Timestamp */}
        <div
          className={`text-xs text-gray-400 mt-1 px-1 ${
            isUser ? "text-right" : "text-left"
          }`}
        >
          {timestamp}
        </div>
      </motion.div>

      {/* Avatar for user messages (right side) */}
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </motion.div>
  );
}