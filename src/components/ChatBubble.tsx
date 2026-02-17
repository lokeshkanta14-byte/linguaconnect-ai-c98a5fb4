interface ChatBubbleProps {
  message: string;
  time: string;
  sent: boolean;
  translated?: string;
  language?: string;
}

const ChatBubble = ({ message, time, sent, translated, language }: ChatBubbleProps) => {
  return (
    <div className={`flex ${sent ? "justify-end" : "justify-start"} mb-2 animate-fade-in`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2 ${
          sent
            ? "bg-chat-sent text-chat-sent-foreground rounded-br-md"
            : "bg-chat-received text-chat-received-foreground rounded-bl-md"
        }`}
      >
        <p className="text-sm leading-relaxed">{message}</p>
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
