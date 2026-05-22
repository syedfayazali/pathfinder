import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { Label } from "@/components/ui/input";

export function ProfilePhotoSettings({
  avatarUrl,
  displayName,
  onUpload,
}: {
  avatarUrl?: string | null;
  displayName: string;
  onUpload: (file: File) => Promise<void>;
}) {
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <ProfileAvatar src={avatarUrl} name={displayName} size="lg" editable onUpload={onUpload} />
      <div className="space-y-1 text-center sm:text-left">
        <Label>Profile Photo</Label>
        <p className="text-sm text-muted-foreground">
          Click your photo to upload. Shown on the dashboard and sidebar.
        </p>
        <p className="text-xs text-muted-foreground">PNG, JPG, or WebP · max 5 MB</p>
      </div>
    </div>
  );
}
