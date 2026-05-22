import { useCallback, useRef, useState } from "react";
import { ImagePlus, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { fileToLogoDataUrl, isImageFile } from "@/lib/logoImage";
import { useToast } from "@/components/ui/toast";
import { Label } from "@/components/ui/input";
import { CompanyLogo } from "@/components/applications/CompanyLogo";

export function LogoUpload({
  value,
  onChange,
  companyName = "",
}: {
  value?: string | null;
  onChange: (url: string | null) => void;
  companyName?: string;
}) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (!isImageFile(file)) {
        toast("Please upload an image file");
        return;
      }
      setProcessing(true);
      try {
        const dataUrl = await fileToLogoDataUrl(file);
        onChange(dataUrl);
      } catch (e) {
        toast(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setProcessing(false);
      }
    },
    [onChange, toast],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  return (
    <div className="space-y-2 sm:col-span-2">
      <Label>Company Logo</Label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <CompanyLogo logoUrl={value} companyName={companyName || "Company"} size="lg" />
        <div className="flex-1 space-y-2">
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragging(false);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-6 transition-colors",
              dragging ? "border-primary bg-primary/10" : "border-border hover:bg-accent/50",
              processing && "pointer-events-none opacity-60",
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = "";
              }}
            />
            {processing ? (
              <p className="text-sm text-muted-foreground">Processing...</p>
            ) : (
              <>
                <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
                <p className="text-center text-sm font-medium">Drag & drop or click to upload</p>
                <p className="mt-1 text-center text-xs text-muted-foreground">PNG, JPG, WebP, GIF (max 5 MB)</p>
              </>
            )}
          </div>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" /> Remove logo
            </button>
          )}
          {!value && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <ImagePlus className="h-3.5 w-3.5" />
              Logo appears on Dashboard and Applications
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
