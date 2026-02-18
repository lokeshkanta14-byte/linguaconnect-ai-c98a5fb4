import { Trash2, X } from "lucide-react";

interface MessageActionsProps {
  messageId: string;
  isSent: boolean;
  onDeleteForMe: (id: string) => void;
  onDeleteForEveryone: (id: string) => void;
  onClose: () => void;
}

const MessageActions = ({ messageId, isSent, onDeleteForMe, onDeleteForEveryone, onClose }: MessageActionsProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-card rounded-2xl p-4 w-72 shadow-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Delete Message</h3>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded-full transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="space-y-2">
          <button
            onClick={() => onDeleteForMe(messageId)}
            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-secondary transition-colors text-left"
          >
            <Trash2 className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Delete for me</p>
              <p className="text-xs text-muted-foreground">Remove from your view only</p>
            </div>
          </button>
          {isSent && (
            <button
              onClick={() => onDeleteForEveryone(messageId)}
              className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-destructive/10 transition-colors text-left"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
              <div>
                <p className="text-sm font-medium text-destructive">Delete for everyone</p>
                <p className="text-xs text-muted-foreground">Remove for all participants</p>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageActions;
