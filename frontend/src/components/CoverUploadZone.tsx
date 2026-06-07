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
    if (file.type.startsWith("image/")) {
      onUpload(file);
    }
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
