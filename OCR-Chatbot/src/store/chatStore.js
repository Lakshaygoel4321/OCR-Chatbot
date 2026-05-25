import { create } from "zustand";

export const useChatStore = create((set) => ({
  messages: [],
  sessionId: crypto.randomUUID(),
  isLoading: false,
  attachment: null,

  addMessage: (message) =>
    set((s) => ({ messages: [...s.messages, message] })),

  setMessages: (messages) => set({ messages }),

  setLoading: (isLoading) => set({ isLoading }),

  setAttachment: (attachment) => set({ attachment }),

  clearAttachment: () => set({ attachment: null }),

  clearChat: () =>
    set({
      messages: [],
      sessionId: crypto.randomUUID(),
      attachment: null,
      isLoading: false,
    }),

  setSessionId: (sessionId) => set({ sessionId }),

  removeMessage: (messageId) =>
    set((s) => ({
      messages: s.messages.filter((msg) => msg.id !== messageId),
    })),

  addErrorMessage: (errorContent, errorType = 'general') =>
    set((s) => ({
      messages: [
        ...s.messages,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          type: "error",
          content: errorContent,
          errorType,
          timestamp: new Date().toISOString(),
        },
      ],
    })),
}));