import { useChatStore } from "../store/chatStore";
import { getAttachmentType, isSupportedAttachment } from "../utils/fileHelpers";

export function useAttachment() {
  const attachment = useChatStore((s) => s.attachment);
  const setAttachment = useChatStore((s) => s.setAttachment);
  const clearAttachment = useChatStore((s) => s.clearAttachment);

  function handleFile(file) {
    if (!file || !isSupportedAttachment(file)) return false;

    const type = getAttachmentType(file);
    const preview = URL.createObjectURL(file);

    setAttachment({ file, type, preview, name: file.name });
    return true;
  }

  return { attachment, handleFile, clearAttachment };
}