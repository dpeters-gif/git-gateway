import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Camera, RotateCcw, Check, ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface PhotoProofProps {
  open: boolean;
  onClose: () => void;
  onPhotoTaken: (photoUrl: string) => void;
  taskId: string;
}

export default function PhotoProof({ open, onClose, onPhotoTaken, taskId }: PhotoProofProps) {
  const { t } = useTranslation();
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast.error(t("photo.tooLarge", "Foto zu groß (max 5MB)"));
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleUse = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${taskId}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("task-photos")
        .upload(path, file, { contentType: file.type });
      if (uploadErr) throw uploadErr;

      // Get signed URL since bucket is private
      const { data: signed } = await supabase.storage
        .from("task-photos")
        .createSignedUrl(path, 60 * 60 * 24 * 365);
      const photoUrl = signed?.signedUrl ?? path;

      // Store photo record
      const { error: dbErr } = await supabase
        .from("task_completion_photos")
        .insert({
          task_id: taskId,
          user_id: (await supabase.auth.getUser()).data.user?.id ?? "",
          photo_url: photoUrl,
        });
      if (dbErr) throw dbErr;

      onPhotoTaken(photoUrl);
      setPreview(null);
      setFile(null);
    } catch {
      toast.error(t("photo.uploadError", "Foto konnte nicht hochgeladen werden — nochmal versuchen"));
    }
    setUploading(false);
  };

  const handleRetake = () => {
    setPreview(null);
    setFile(null);
    inputRef.current?.click();
  };

  return (
    <Dialog open={open} onOpenChange={() => { if (!uploading) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>{t("photo.title", "Beweis-Foto")}</DialogTitle></DialogHeader>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleCapture}
        />

        {preview ? (
          <div className="space-y-4">
            <img src={preview} alt="Preview" className="w-full rounded-lg max-h-64 object-cover" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRetake} className="flex-1 gap-1" disabled={uploading}>
                <RotateCcw className="w-4 h-4" /> {t("photo.retake", "Nochmal")}
              </Button>
              <Button onClick={handleUse} className="flex-1 gap-1" disabled={uploading}>
                <Check className="w-4 h-4" /> {uploading ? t("common.loading") : t("photo.use", "Verwenden")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-center py-8">
            <Camera className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">{t("photo.instruction", "Foto aufnehmen oder aus Galerie wählen")}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => inputRef.current?.click()} className="gap-1">
                <Camera className="w-4 h-4" /> {t("photo.capture", "Foto aufnehmen")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
