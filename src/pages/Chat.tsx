import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Video, MoreVertical, MapPin } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ChatBubble from "@/components/ChatBubble";
import ChatInput from "@/components/ChatInput";
import MessageActions from "@/components/MessageActions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  message: string;
  time: string;
  sent: boolean;
  translated?: string;
  language?: string;
  audioUrl?: string;
  imageUrl?: string;
  deleted?: boolean;
  deletedForEveryone?: boolean;
}

const mockMessages: Message[] = [
  { id: "1", message: "Hey! How are you?", time: "2:25 PM", sent: false },
  { id: "2", message: "నేను బాగున్నాను, మీరు?", time: "2:26 PM", sent: false, translated: "I'm fine, how about you?", language: "English" },
  { id: "3", message: "I'm great! Want to meet for coffee?", time: "2:28 PM", sent: true },
  { id: "4", message: "అవును, ఎక్కడ కలుద్దాం?", time: "2:29 PM", sent: false, translated: "Yes, where shall we meet?", language: "English" },
  { id: "5", message: "How about the new café near City Center?", time: "2:30 PM", sent: true },
  { id: "6", message: "Perfect! See you at 5 PM", time: "2:30 PM", sent: false },
];

const contactNames: Record<string, string> = {
  "1": "Priya Sharma", "2": "Rahul Verma", "3": "Ananya Reddy",
  "4": "Vikram Patel", "5": "Lakshmi Devi", "6": "Arjun Kumar", "7": "Meera Iyer",
};

const Chat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const name = contactNames[id || "1"] || "Unknown";
  const initials = name.split(" ").map(n => n[0]).join("");

  const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const translateMessage = async (text: string): Promise<{ translated: string; language: string } | null> => {
    try {
      const { data, error } = await supabase.functions.invoke("translate", {
        body: { text, targetLanguage: "English" },
      });
      if (error || !data?.translated) return null;
      if (data.translated.trim().toLowerCase() === text.trim().toLowerCase()) return null;
      return { translated: data.translated, language: "English" };
    } catch {
      return null;
    }
  };

  const handleSend = async (text: string) => {
    const msgId = String(Date.now());
    setMessages(prev => [...prev, { id: msgId, message: text, time: now(), sent: true }]);

    // Auto-translate for demo: translate sent message as if receiver's language differs
    const result = await translateMessage(text);
    if (result) {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, translated: result.translated, language: result.language } : m));
    }
  };

  const handleSendAudio = (audioUrl: string) => {
    setMessages(prev => [...prev, { id: String(Date.now()), message: "", time: now(), sent: true, audioUrl }]);
  };

  const handleSendImage = (imageUrl: string) => {
    setMessages(prev => [...prev, { id: String(Date.now()), message: "", time: now(), sent: true, imageUrl }]);
  };

  const handleSendLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocation not supported", variant: "destructive" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const locationMsg = `📍 Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        setMessages(prev => [...prev, { id: String(Date.now()), message: locationMsg, time: now(), sent: true }]);
        toast({ title: "Location shared!" });
      },
      () => toast({ title: "Location access denied", variant: "destructive" })
    );
  };

  const handleDeleteForMe = (msgId: string) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, deleted: true } : m));
    setSelectedMessageId(null);
  };

  const handleDeleteForEveryone = (msgId: string) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, deletedForEveryone: true } : m));
    setSelectedMessageId(null);
  };

  const selectedMsg = messages.find(m => m.id === selectedMessageId);

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
            <button
              onClick={() => navigate(`/voice-call/${id}`)}
              className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate(`/video-call/${id}`)}
              className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground"
            >
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
          <span className="text-[11px] text-muted-foreground bg-secondary px-3 py-1 rounded-full">Today</span>
        </div>
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            {...msg}
            onLongPress={() => !msg.deleted && !msg.deletedForEveryone && setSelectedMessageId(msg.id)}
          />
        ))}
      </div>

      <ChatInput
        onSend={handleSend}
        onSendAudio={handleSendAudio}
        onSendImage={handleSendImage}
        onSendLocation={handleSendLocation}
      />

      {selectedMessageId && selectedMsg && (
        <MessageActions
          messageId={selectedMessageId}
          isSent={selectedMsg.sent}
          onDeleteForMe={handleDeleteForMe}
          onDeleteForEveryone={handleDeleteForEveryone}
          onClose={() => setSelectedMessageId(null)}
        />
      )}
    </div>
  );
};

export default Chat;
