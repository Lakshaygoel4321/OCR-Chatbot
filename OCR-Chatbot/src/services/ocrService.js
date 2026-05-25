import api from "./api";

export async function extractTextFromImage(imageFile) {
  const formData = new FormData();
  formData.append("image", imageFile);

  const res = await api.post("/ocr", formData);
  return res.data;
}