import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Video, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ChatBubble from "@/components/ChatBubble";
import ChatInput from "@/components/ChatInput";

const mockMessages = [
  { id: "1", message: "Hey! How are you?", time: "2:25 PM", sent: false },
  { id: "2", message: "నేను బాగున్నాను, మీరు?", time: "2:26 PM", sent: false, translated: "I'm fine, how about you?", language: "English" },
  { id: "3", message: "I'm great! Want to meet for coffee?", time: "2:28 PM", sent: true },
  { id: "4", message: "అవును, ఎక్కడ కలుద్దాం?", time: "2:29 PM", sent: false, translated: "Yes, where shall we meet?", language: "English" },
  { id: "5", message: "How about the new café near City Center?", time: "2:30 PM", sent: true },
  { id: "6", message: "Perfect! See you at 5 PM", time: "2:30 PM", sent: false },
];

const contactNames: Record<string, string> = {
  "1": "Priya Sharma",
  "2": "Rahul Verma",
  "3": "Ananya Reddy",
  "4": "Vikram Patel",
  "5": "Lakshmi Devi",
  "6": "Arjun Kumar",
  "7": "Meera Iyer",
};

const Chat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState(mockMessages);
  const name = contactNames[id || "1"] || "Unknown";
  const initials = name.split(" ").map(n => n[0]).join("");

  const handleSend = (text: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: String(Date.now()),
        message: text,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        sent: true,
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 glass px-2 py-2">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/")} className="p-2 hover:bg-secondary rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Avatar className="w-9 h-9">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold font-display">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold truncate">{name}</h2>
            <p className="text-[11px] text-online font-medium">Online</p>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground">
              <Phone className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground">
              <Video className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 px-3 py-4 pb-20 overflow-y-auto">
        <div className="text-center mb-4">
          <span className="text-[11px] text-muted-foreground bg-secondary px-3 py-1 rounded-full">
            Today
          </span>
        </div>
        {messages.map((msg) => (
          <ChatBubble key={msg.id} {...msg} />
        ))}
      </div>

      <ChatInput onSend={handleSend} />
    </div>
  );
};

export default Chat;
