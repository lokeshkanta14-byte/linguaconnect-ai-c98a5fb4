import { useState } from "react";
import { Send, Mic, Camera, Sparkles } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
}

const ChatInput = ({ onSend }: ChatInputProps) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 glass safe-bottom">
      <div className="flex items-end gap-2 px-3 py-2 max-w-3xl mx-auto">
        <button className="p-2.5 text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-primary/10">
          <Camera className="w-5 h-5" />
        </button>
        <div className="flex-1 flex items-end bg-secondary rounded-2xl px-3 py-1.5">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-sm py-1.5 outline-none placeholder:text-muted-foreground"
          />
          <button className="p-1.5 text-muted-foreground hover:text-primary transition-colors">
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
        {text.trim() ? (
          <button
            onClick={handleSend}
            className="p-2.5 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
          >
            <Send className="w-5 h-5" />
          </button>
        ) : (
          <button className="p-2.5 text-primary hover:bg-primary/10 rounded-full transition-colors">
            <Mic className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
