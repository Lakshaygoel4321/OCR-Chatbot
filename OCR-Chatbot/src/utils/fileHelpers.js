export function getAttachmentType(file) {
  if (!file) return null;
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("audio/")) return "audio";
  return null;
}

export function isSupportedAttachment(file) {
  return getAttachmentType(file) !== null;
}