import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProfileAvatar({
  src,
  name,
  size = "lg",
  editable = false,
  onUpload,
}: {
  src?: string | null;
  name: string;
  size?: "md" | "lg";
  editable?: boolean;
  onUpload?: (file: File) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const initial = name.trim()[0]?.toUpperCase() ?? "?";
  const dim = size === "lg" ? "h-16 w-16 text-2xl" : "h-10 w-10 text-sm";

  const handleFile = async (file: File) => {
    if (!onUpload) return;
    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className={cn(
        "relative shrink-0",
        editable && "group cursor-pointer",
      )}
      onClick={() => editable && !uploading && inputRef.current?.click()}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn(
            "rounded-2xl object-cover ring-2 ring-primary/30",
            dim,
          )}
        />
      ) : (
        <div
          className={cn(
            "flex items-center justify-center rounded-2xl bg-primary/10 font-bold text-primary ring-2 ring-primary/20",
            dim,
          )}
        >
          {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : initial}
        </div>
      )}
      {editable && !uploading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          <Camera className="h-5 w-5 text-white" />
        </div>
      )}
      {uploading && src && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50">
          <Loader2 className="h-5 w-5 animate-spin text-white" />
        </div>
      )}
      {editable && (
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
      )}
    </div>
  );
}
