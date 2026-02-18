import { Ban } from "lucide-react";

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
  onLongPress?: () => void;
}

const ChatBubble = ({ message, time, sent, translated, language, audioUrl, imageUrl, deleted, deletedForEveryone, onLongPress }: ChatBubbleProps) => {
  if (deleted || deletedForEveryone) {
    return (
      <div className={`flex ${sent ? "justify-end" : "justify-start"} mb-2 animate-fade-in`}>
        <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 ${
          sent ? "bg-chat-sent/50 rounded-br-md" : "bg-chat-received/50 rounded-bl-md"
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
      className={`flex ${sent ? "justify-end" : "justify-start"} mb-2 animate-fade-in`}
      onContextMenu={(e) => { e.preventDefault(); onLongPress?.(); }}
      onClick={(e) => { if (e.detail === 2) onLongPress?.(); }}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2 ${
          sent
            ? "bg-chat-sent text-chat-sent-foreground rounded-br-md"
            : "bg-chat-received text-chat-received-foreground rounded-bl-md"
        }`}
      >
        {imageUrl && (
          <img src={imageUrl} alt="Shared photo" className="rounded-lg mb-1.5 max-w-full max-h-60 object-cover" />
        )}
        {audioUrl && (
          <audio controls src={audioUrl} className="max-w-full mb-1.5" style={{ height: 36 }} />
        )}
        {message && <p className="text-sm leading-relaxed">{message}</p>}
        {translated && (
          <div className={`mt-1.5 pt-1.5 border-t ${sent ? "border-primary-foreground/20" : "border-border"}`}>
            <p className="text-xs opacity-80 italic">{translated}</p>
            {language && (
              <span className={`text-[9px] uppercase font-bold mt-0.5 inline-block ${sent ? "opacity-60" : "text-primary"}`}>
                Translated to {language}
              </span>
            )}
          </div>
        )}
        <p className={`text-[10px] mt-1 text-right ${sent ? "opacity-60" : "text-muted-foreground"}`}>
          {time}
        </p>
      </div>
    </div>
  );
};

export default ChatBubble;
