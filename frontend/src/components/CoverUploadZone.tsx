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
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(img.src);
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
            }
          },
          "image/jpeg",
          0.85
        );
      }
    };
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
      onClick={() => inputRef.current?.click()}
      className={`aspect-video w-full rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer select-none transition-colors text-sm
        ${dragOver ? "border-primary bg-primary/5" : focused ? "border-primary/60 bg-muted/30" : "border-border bg-muted/20 hover:bg-muted/30"}`}
    >
      <Upload size={20} className="text-muted-foreground" />
      <span className="text-muted-foreground">クリックまたはドロップ</span>
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        <Clipboard size={12} />フォーカス後に Ctrl+V で貼り付け
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
