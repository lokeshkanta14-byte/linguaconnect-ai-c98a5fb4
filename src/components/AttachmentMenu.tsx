import { useRef } from "react";
import { Image, Video, FileText, Camera, MapPin, X } from "lucide-react";

interface AttachmentMenuProps {
  open: boolean;
  onClose: () => void;
  onSendImage: (url: string) => void;
  onSendLocation: () => void;
  onOpenCamera: () => void;
}

const items = [
  { icon: Image, label: "Photos", accept: "image/*", color: "text-primary" },
  { icon: Video, label: "Videos", accept: "video/*", color: "text-online" },
  { icon: FileText, label: "Documents", accept: ".pdf,.doc,.docx,.txt", color: "text-accent-foreground" },
] as const;

const AttachmentMenu = ({ open, onClose, onSendImage, onSendLocation, onOpenCamera }: AttachmentMenuProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const acceptRef = useRef("");

  if (!open) return null;

  const pickFile = (accept: string) => {
    acceptRef.current = accept;
    if (fileRef.current) {
      fileRef.current.accept = accept;
      fileRef.current.click();
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onSendImage(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute bottom-full left-0 right-0 mb-2 mx-3 z-50 animate-slide-up">
        <div className="bg-card rounded-2xl border border-border shadow-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Attach</span>
            <button onClick={onClose} className="p-1 hover:bg-secondary rounded-full transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
          <div className="grid grid-cols-4 gap-3">
            {items.map(({ icon: Icon, label, accept, color }) => (
              <button
                key={label}
                onClick={() => pickFile(accept)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-secondary transition-colors"
              >
                <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
              </button>
            ))}
            <button
              onClick={() => { onOpenCamera(); onClose(); }}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-secondary transition-colors"
            >
              <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center">
                <Camera className="w-5 h-5 text-destructive" />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">Camera</span>
            </button>
          </div>
          <button
            onClick={() => { onSendLocation(); onClose(); }}
            className="w-full mt-3 flex items-center gap-2.5 p-3 rounded-xl hover:bg-secondary transition-colors"
          >
            <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center">
              <MapPin className="w-5 h-5 text-sos" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Share Location</p>
              <p className="text-[10px] text-muted-foreground">Send your current location</p>
            </div>
          </button>
        </div>
      </div>
    </>
  );
};

export default AttachmentMenu;
