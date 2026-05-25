import { motion, AnimatePresence } from "framer-motion";
import { X, Mic } from "lucide-react";
import RippleButton from "../ui/RippleButton";
import LazyImage from "../ui/LazyImage";
import { slideDown, pulse } from "../../config/animations";

export default function AttachmentPreview({ attachment, onRemove }) {
  if (!attachment) return null;

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const fileSize = attachment.file?.size ? formatFileSize(attachment.file.size) : "Unknown size";
  const fileType = attachment.type === "image" ? "Image" : "Audio";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="attachment-preview"
        variants={slideDown}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md p-3 shadow-lg"
      >
        {/* Thumbnail or Icon */}
        {attachment.type === "image" ? (
          <LazyImage
            src={attachment.preview}
            alt={attachment.name}
            className="h-14 w-14 rounded-xl object-cover border border-white/20"
            placeholderClassName="h-14 w-14 rounded-xl"
          />
        ) : (
          <motion.div
            variants={pulse}
            animate="animate"
            className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm flex items-center justify-center border border-white/20"
          >
            <Mic size={24} className="text-purple-400" />
          </motion.div>
        )}

        {/* File Metadata */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-white text-sm truncate">
            {attachment.name}
          </div>
          <div className="text-white/60 text-xs mt-0.5">
            {fileType} • {fileSize}
          </div>
        </div>

        {/* Remove Button */}
        <RippleButton
          onClick={onRemove}
          className="h-8 w-8 rounded-lg bg-white/10 hover:bg-red-500/20 border border-white/20 hover:border-red-500/40 flex items-center justify-center text-white/70 hover:text-red-400 transition-colors duration-150"
          aria-label="Remove attachment"
        >
          <X size={16} />
        </RippleButton>
      </motion.div>
    </AnimatePresence>
  );
}