import { useRef, useState, useCallback, useEffect } from "react";
import { Upload, Clipboard } from "lucide-react";

interface CoverUploadZoneProps {
  onUpload: (file: File) => void;
}

export function CoverUploadZone({ onUpload }: CoverUploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      console.warn("Failed to load image for resizing, falling back to original file.");
      onUpload(file);
    };

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const MAX_WIDTH = 1200;
      let width = img.width;
      let height = img.height;

      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], "image.jpg", {
                type: "image/jpeg",
              });
              onUpload(resizedFile);
            } else {
              onUpload(file);
            }
          },
          "image/jpeg",
          0.85
        );
      } else {
        onUpload(file);
      }
    };
    img.src = objectUrl;
  }, [onUpload]);

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = Array.from(e.clipboardData?.items ?? []);
    const imageItem = items.find((item) => item.type.startsWith("image/"));
    if (imageItem) {
      const file = imageItem.getAsFile();
      if (file) handleFile(file);
    }
  }, [handleFile]);

  useEffect(() => {
    if (focused) {
      window.addEventListener("paste", handlePaste);
      return () => {
        window.removeEventListener("paste", handlePaste);
      };
    }
  }, [focused, handlePaste]);

  return (
    <div
      tabIndex={0}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
      className={`aspect-video w-full rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 select-none transition-colors text-sm
        ${dragOver ? "border-primary bg-primary/5" : focused ? "border-primary/60 bg-muted/30" : "border-border bg-muted/20 hover:bg-muted/30"}`}
    >
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
        className="flex flex-col items-center gap-1 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
      >
        <Upload size={20} />
        <span>ファイルを選択</span>
      </button>
      <span className="text-muted-foreground text-xs">またはドロップ</span>
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        <Clipboard size={12} />クリックしてフォーカス → Ctrl+V で貼り付け
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
