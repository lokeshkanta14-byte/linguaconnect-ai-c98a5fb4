import { useParams, useNavigate } from "react-router-dom";
import { Phone, PhoneOff, Video } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const contactNames: Record<string, string> = {
  "1": "Priya Sharma", "2": "Rahul Verma", "3": "Ananya Reddy",
  "4": "Vikram Patel", "5": "Lakshmi Devi", "6": "Arjun Kumar", "7": "Meera Iyer",
};

const IncomingCall = () => {
  const { id, type } = useParams<{ id: string; type: string }>();
  const navigate = useNavigate();
  const name = contactNames[id || "1"] || "Unknown";
  const initials = name.split(" ").map(n => n[0]).join("");
  const isVideo = type === "video";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-between py-20 px-6">
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
          Incoming {isVideo ? "Video" : "Voice"} Call
        </p>
        <Avatar className="w-28 h-28 animate-pulse-soft">
          <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold font-display">{initials}</AvatarFallback>
        </Avatar>
        <h2 className="text-2xl font-bold font-display">{name}</h2>
      </div>

      <div className="flex items-center gap-16">
        <button
          onClick={() => navigate(-1)}
          className="w-16 h-16 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center animate-pulse-soft"
        >
          <PhoneOff className="w-7 h-7" />
        </button>
        <button
          onClick={() => navigate(isVideo ? `/video-call/${id}` : `/voice-call/${id}`, { replace: true })}
          className="w-16 h-16 rounded-full bg-online text-primary-foreground flex items-center justify-center animate-pulse-soft"
        >
          {isVideo ? <Video className="w-7 h-7" /> : <Phone className="w-7 h-7" />}
        </button>
      </div>
    </div>
  );
};

export default IncomingCall;
