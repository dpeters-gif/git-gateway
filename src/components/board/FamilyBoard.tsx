import { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { slideUp, staggerContainer } from "@/lib/animations";
import { useBoardNotes } from "@/hooks/useBoardNotes";
import { useFamily } from "@/hooks/useFamily";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import SkeletonLoader from "@/components/shared/SkeletonLoader";
import EmptyState from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMediaQuery } from "@/hooks/use-mobile";
import { StickyNote, Plus, Trash2, ImageIcon, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { toast } from "sonner";

interface FamilyBoardProps {
  preview?: boolean;
}

export default function FamilyBoard({ preview = false }: FamilyBoardProps) {
  const { t } = useTranslation();
  const { notes, isLoading, createNote, deleteNote } = useBoardNotes(preview ? 3 : undefined);
  const { members } = useFamily();
  const { user, profile } = useAuth();
  const isMobile = useMediaQuery("(max-width: 767px)");

  const [showCreate, setShowCreate] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [expiresAt, setExpiresAt] = useState("");
  const [posting, setPosting] = useState(false);

  // Undo delete support
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const isAdmin = profile?.role === "adult";

  const handleDelete = (noteId: string) => {
    // Show undo toast (5 seconds) instead of confirm()
    setPendingDeleteId(noteId);
    const toastId = toast(t("board.noteDeleted", "Notiz gelöscht"), {
      action: {
        label: t("common.undo"),
        onClick: () => {
          if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
          setPendingDeleteId(null);
        },
      },
      duration: 5000,
      onDismiss: () => {
        // If not undone, perform actual delete
        if (pendingDeleteId === noteId) {
          deleteNote.mutate(noteId);
          setPendingDeleteId(null);
        }
      },
    });

    undoTimerRef.current = setTimeout(() => {
      deleteNote.mutate(noteId);
      setPendingDeleteId(null);
    }, 5000);
  };

  const handlePost = async () => {
    if (!text.trim() && !imageFile) return;
    setPosting(true);
    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        const ext = imageFile.name.split(".").pop() ?? "jpg";
        const path = `${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("board-images")
          .upload(path, imageFile, { contentType: imageFile.type });
        if (uploadErr) throw uploadErr;
        const { data: pub } = supabase.storage.from("board-images").getPublicUrl(path);
        imageUrl = pub.publicUrl;
      }
      await createNote.mutateAsync({
        text: text.trim(),
        imageUrl,
        expiresAt: expiresAt || undefined,
      });
      setText("");
      setImageFile(null);
      setExpiresAt("");
      setShowCreate(false);
    } catch {
      toast.error(t("common.error"));
    }
    setPosting(false);
  };

  const getMemberName = (userId: string | null) => {
    if (!userId) return "?";
    const m = members.find(m => m.user_id === userId);
    return m?.name ?? "?";
  };

  const noteCards = (notes ?? [])
    .filter(n => n.id !== pendingDeleteId)
    .map(note => (
    <motion.div key={note.id} variants={slideUp} className="bg-card rounded-lg p-3 border border-border">
      <div className="flex items-start gap-2">
        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground shrink-0">
          {getMemberName(note.author_user_id).charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-foreground">{getMemberName(note.author_user_id)}</span>
            <span className="text-[10px] text-muted-foreground">
              {formatDistanceToNow(new Date(note.created_at), { locale: de, addSuffix: true })}
            </span>
          </div>
          {note.text && <p className={`text-xs text-foreground mt-1 ${preview ? "line-clamp-2" : ""}`}>{note.text}</p>}
          {note.image_url && (
            <button onClick={() => setLightboxUrl(note.image_url)} className="mt-1.5">
              <img src={note.image_url} alt="" className="w-20 h-20 rounded-md object-cover" />
            </button>
          )}
        </div>
        {(isAdmin || note.author_user_id === user?.id) && (
          <button
            onClick={() => handleDelete(note.id)}
            className="shrink-0 p-1 text-muted-foreground hover:text-error"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </motion.div>
  ));

  const createForm = (
    <div className="space-y-4">
      <div>
        <Label>{t("board.text")}</Label>
        <Textarea
          value={text}
          onChange={e => { if (e.target.value.length <= 500) setText(e.target.value); }}
          rows={3}
          placeholder={t("board.textPlaceholder")}
        />
        <span className={`text-[10px] ${text.length >= 500 ? "text-error" : "text-muted-foreground"}`}>
          {text.length}/500
        </span>
      </div>
      <div>
        <Label>{t("board.image")}</Label>
        <div className="flex items-center gap-2 mt-1">
          <Button variant="outline" size="sm" onClick={() => document.getElementById("board-img-input")?.click()} className="gap-1">
            <ImageIcon className="w-3.5 h-3.5" /> {t("board.addImage")}
          </Button>
          {imageFile && (
            <div className="flex items-center gap-1 text-xs text-foreground">
              <span>{imageFile.name.slice(0, 20)}</span>
              <button onClick={() => setImageFile(null)}><X className="w-3 h-3" /></button>
            </div>
          )}
          <input
            id="board-img-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f && f.size <= 5 * 1024 * 1024) setImageFile(f);
              else if (f) toast.error(t("board.imageTooLarge"));
            }}
          />
        </div>
      </div>
      <div>
        <Label>{t("board.expiry")}</Label>
        <Input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />
      </div>
      <Button onClick={handlePost} className="w-full" disabled={posting || (!text.trim() && !imageFile)}>
        {posting ? t("common.loading") : t("board.post")}
      </Button>
    </div>
  );

  if (isLoading) return <SkeletonLoader type="card" count={preview ? 1 : 3} />;

  return (
    <>
      <motion.div variants={slideUp} className="bg-card rounded-lg p-5 border border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <StickyNote className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-semibold text-foreground">{t("home.familyBoard")}</h2>
          </div>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" onClick={() => setShowCreate(true)} className="h-7 w-7">
              <Plus className="w-4 h-4" />
            </Button>
            {preview && notes.length > 0 && (
              <Button size="sm" variant="link" onClick={() => setShowAll(true)} className="text-xs h-7">
                {t("board.viewAll")}
              </Button>
            )}
          </div>
        </div>

        {notes.length === 0 ? (
          <EmptyState
            icon={StickyNote}
            title={t("board.emptyTitle")}
            body={t("board.emptyBody")}
            ctaLabel={t("board.post")}
            onCta={() => setShowCreate(true)}
          />
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible"
            className={preview && !isMobile ? "flex gap-3" : "space-y-2"}>
            {noteCards}
          </motion.div>
        )}
      </motion.div>

      {/* Create form */}
      {isMobile ? (
        <Sheet open={showCreate} onOpenChange={setShowCreate}>
          <SheetContent side="bottom" className="rounded-t-xl max-h-[85vh] overflow-y-auto">
            <SheetHeader><SheetTitle>{t("board.createNote")}</SheetTitle></SheetHeader>
            {createForm}
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{t("board.createNote")}</DialogTitle></DialogHeader>
            {createForm}
          </DialogContent>
        </Dialog>
      )}

      {/* Full board view */}
      <Dialog open={showAll} onOpenChange={setShowAll}>
        <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{t("home.familyBoard")}</DialogTitle></DialogHeader>
          <FullBoard />
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setLightboxUrl(null)}
          >
            <img src={lightboxUrl} alt="" className="max-w-full max-h-full rounded-lg object-contain" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function FullBoard() {
  const { notes, isLoading } = useBoardNotes();
  const { members } = useFamily();

  if (isLoading) return <SkeletonLoader type="list" count={5} />;

  const getMemberName = (userId: string | null) => {
    const m = members.find(m => m.user_id === userId);
    return m?.name ?? "?";
  };

  return (
    <div className="space-y-3 max-w-[640px] mx-auto">
      {notes.map(note => (
        <div key={note.id} className="bg-card rounded-lg p-3 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">
              {getMemberName(note.author_user_id).charAt(0)}
            </div>
            <span className="text-xs font-semibold text-foreground">{getMemberName(note.author_user_id)}</span>
            <span className="text-[10px] text-muted-foreground">
              {formatDistanceToNow(new Date(note.created_at), { locale: de, addSuffix: true })}
            </span>
          </div>
          {note.text && <p className="text-xs text-foreground">{note.text}</p>}
          {note.image_url && <img src={note.image_url} alt="" className="mt-2 rounded-md max-h-60 object-cover" />}
        </div>
      ))}
    </div>
  );
}