import { Ban, Check, CheckCheck } from "lucide-react";

interface ChatBubbleProps {
  message: string;
  time: string;
  sent: boolean;
  translated?: string;
  language?: string;
  audioUrl?: string;
  imageUrl?: string;
  deleted?: boolean;
  deletedForEveryone?: boolean;
  status?: string;
  onLongPress?: () => void;
}

const ChatBubble = ({ message, time, sent, translated, language, audioUrl, imageUrl, deleted, deletedForEveryone, status, onLongPress }: ChatBubbleProps) => {
  if (deleted || deletedForEveryone) {
    return (
      <div className={`flex ${sent ? "justify-end" : "justify-start"} mb-2.5 animate-fade-in`}>
        <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 shadow-soft ${
          sent ? "bg-chat-sent/30 rounded-br-md" : "bg-chat-received/30 rounded-bl-md"
        }`}>
          <p className="text-xs italic text-muted-foreground flex items-center gap-1.5">
            <Ban className="w-3 h-3" />
            {deletedForEveryone ? "This message was deleted" : "You deleted this message"}
          </p>
          <p className={`text-[10px] mt-1 text-right ${sent ? "opacity-60" : "text-muted-foreground"}`}>{time}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex ${sent ? "justify-end" : "justify-start"} mb-2.5 animate-fade-in`}
      onContextMenu={(e) => { e.preventDefault(); onLongPress?.(); }}
      onClick={(e) => { if (e.detail === 2) onLongPress?.(); }}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 shadow-soft transition-all duration-200 ${
          sent
            ? "bg-chat-sent text-chat-sent-foreground rounded-br-md"
            : "bg-chat-received text-chat-received-foreground rounded-bl-md"
        }`}
      >
        {imageUrl && (
          <img src={imageUrl} alt="Shared photo" className="rounded-xl mb-1.5 max-w-full max-h-60 object-cover" />
        )}
        {audioUrl && (
          <audio controls src={audioUrl} className="max-w-full mb-1.5" style={{ height: 36 }} />
        )}
        {message && (
          <p className="text-sm leading-relaxed">
            {!sent && translated ? translated : message}
          </p>
        )}
        <div className={`flex items-center justify-end gap-1 mt-1`}>
          <span className={`text-[10px] ${sent ? "opacity-60" : "text-muted-foreground"}`}>{time}</span>
          {sent && (
            status === 'seen' ? (
              <CheckCheck className="w-3.5 h-3.5 text-primary" />
            ) : status === 'delivered' ? (
              <CheckCheck className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <Check className="w-3.5 h-3.5 opacity-60" />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
