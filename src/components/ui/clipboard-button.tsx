import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface ClipboardButtonProps {
  text: string;
  children?: React.ReactNode;
  className?: string;
  onSuccess?: () => void;
  onError?: () => void;
}

const ClipboardButton: React.FC<ClipboardButtonProps> = ({
  text,
  children,
  className = "",
  onSuccess,
  onError,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      if (!text) {
        console.warn("No text to copy");
        return;
      }

      // 使用现代 Clipboard API (推荐)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // 降级方案：使用 document.execCommand (兼容旧浏览器)
        const textArea = document.createElement("textarea");
        textArea.value = text;

        // 避免滚动到底部
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          const successful = document.execCommand("copy");
          document.body.removeChild(textArea);

          if (!successful) {
            throw new Error("Failed to copy text");
          }
        } catch (err) {
          document.body.removeChild(textArea);
          throw err;
        }
      }

      setIsCopied(true);
      onSuccess?.();

      // 2秒后重置状态
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      onError?.();
    }
  };

  return (
    <button
      type="button"
      onClick={copyToClipboard}
      className={className}
      aria-label={isCopied ? "Copied to clipboard" : "Copy to clipboard"}
    >
      {children ||
        (isCopied ? (
          <Check className="h-3 w-3 xs:h-4 xs:w-4 text-green-500" />
        ) : (
          <Copy className="h-3 w-3 xs:h-4 xs:w-4 text-green-500" />
        ))}
    </button>
  );
};

export default ClipboardButton;
