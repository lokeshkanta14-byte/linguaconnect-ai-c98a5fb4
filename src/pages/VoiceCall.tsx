import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const contactNames: Record<string, string> = {
  "1": "Priya Sharma", "2": "Rahul Verma", "3": "Ananya Reddy",
  "4": "Vikram Patel", "5": "Lakshmi Devi", "6": "Arjun Kumar", "7": "Meera Iyer",
};

const VoiceCall = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const name = contactNames[id || "1"] || "Unknown";
  const initials = name.split(" ").map(n => n[0]).join("");
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-between py-16 px-6">
      <div className="flex flex-col items-center gap-3">
        <Avatar className="w-24 h-24">
          <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold font-display">{initials}</AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-bold font-display">{name}</h2>
        <p className="text-sm text-muted-foreground">{fmt(duration)}</p>
      </div>

      <div className="flex items-center gap-6">
        <button onClick={() => setMuted(!muted)} className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${muted ? "bg-destructive/20 text-destructive" : "bg-secondary text-foreground"}`}>
          {muted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>
        <button onClick={() => navigate(-1)} className="w-16 h-16 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
          <PhoneOff className="w-7 h-7" />
        </button>
        <button onClick={() => setSpeaker(!speaker)} className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${speaker ? "bg-primary/20 text-primary" : "bg-secondary text-foreground"}`}>
          {speaker ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
};

export default VoiceCall;
