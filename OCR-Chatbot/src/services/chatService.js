import api from "./api";

export async function sendChatMessage(message, sessionId) {
  const res = await api.post("/chat", {
    message,
    session_id: sessionId,
  });

  return res.data;
}