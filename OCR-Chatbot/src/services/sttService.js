import api from "./api";

export async function extractTextFromAudio(audioFile, language = "en-IN") {
  const formData = new FormData();
  formData.append("audio", audioFile);

  const res = await api.post(
    `/stt?language=${encodeURIComponent(language)}`,
    formData
  );

  return res.data;
}