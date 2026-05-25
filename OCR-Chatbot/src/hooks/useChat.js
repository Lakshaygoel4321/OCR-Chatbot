import { useChatStore } from "../store/chatStore";
import { extractTextFromImage } from "../services/ocrService";
import { extractTextFromAudio } from "../services/sttService";
import { sendChatMessage } from "../services/chatService";
import { getAttachmentType } from "../utils/fileHelpers";

export function useChat() {
  const messages = useChatStore((s) => s.messages);
  const addMessage = useChatStore((s) => s.addMessage);
  const addErrorMessage = useChatStore((s) => s.addErrorMessage);
  const removeMessage = useChatStore((s) => s.removeMessage);
  const isLoading = useChatStore((s) => s.isLoading);
  const setLoading = useChatStore((s) => s.setLoading);
  const attachment = useChatStore((s) => s.attachment);
  const clearAttachment = useChatStore((s) => s.clearAttachment);
  const sessionId = useChatStore((s) => s.sessionId);

  async function send(prompt) {
    if (!prompt?.trim() && !attachment) return;

    setLoading(true);

    const userMsg = {
      id: crypto.randomUUID(),
      role: "user",
      content: prompt || "",
      attachment: attachment ? { ...attachment } : null,
    };
    addMessage(userMsg);

    let extracted = "";

    try {
      if (attachment) {
        const kind = getAttachmentType(attachment.file);

        if (kind === "image") {
          const data = await extractTextFromImage(attachment.file);
          extracted = data.extracted_text || "";
        } else if (kind === "audio") {
          const data = await extractTextFromAudio(attachment.file);
          extracted = data.transcribed_text || "";
        }
      }

      const parts = [];
      if (extracted) parts.push(`Attachment context:\n${extracted}`);
      if (prompt?.trim()) parts.push(`User prompt:\n${prompt.trim()}`);

      const combined = parts.join("\n\n");
      const reply = await sendChatMessage(combined, sessionId);

      addMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        content: reply.reply,
      });

      clearAttachment();
      return reply;
    } catch (error) {
      console.error("Chat error:", error);
      
      // Determine error type and message
      let errorMessage = "Something went wrong. Please try again.";
      let errorType = "general";
      
      if (error.message?.includes("network") || error.message?.includes("fetch")) {
        errorMessage = "Network error. Please check your connection and try again.";
        errorType = "network";
      } else if (error.message?.includes("timeout")) {
        errorMessage = "Request timed out. Please try again.";
        errorType = "timeout";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
        errorType = "server";
      }
      
      addErrorMessage(errorMessage, errorType);
    } finally {
      setLoading(false);
    }
  }

  async function retryMessage(errorMessage) {
    // Find the user message that preceded this error
    const errorIndex = messages.findIndex((m) => m.id === errorMessage.id);
    if (errorIndex > 0) {
      const userMessage = messages[errorIndex - 1];
      if (userMessage.role === "user") {
        // Remove the error message
        removeMessage(errorMessage.id);
        // Retry with the original prompt
        await send(userMessage.content);
      }
    }
  }

  function dismissError(messageId) {
    removeMessage(messageId);
  }

  return { messages, isLoading, send, sessionId, retryMessage, dismissError };
}