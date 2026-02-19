import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PhoneOff, Mic, MicOff, Video, VideoOff, RotateCcw } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const contactNames: Record<string, string> = {
  "1": "Priya Sharma", "2": "Rahul Verma", "3": "Ananya Reddy",
  "4": "Vikram Patel", "5": "Lakshmi Devi", "6": "Arjun Kumar", "7": "Meera Iyer",
};

const VideoCall = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const name = contactNames[id || "1"] || "Unknown";
  const initials = name.split(" ").map(n => n[0]).join("");
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      {/* Remote video placeholder */}
      <div className="flex-1 bg-secondary flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Avatar className="w-24 h-24">
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold font-display">{initials}</AvatarFallback>
          </Avatar>
          <h2 className="text-lg font-bold font-display">{name}</h2>
          <p className="text-sm text-muted-foreground">{fmt(duration)}</p>
        </div>
      </div>

      {/* Self-view */}
      <div className="absolute top-4 right-4 w-28 h-40 rounded-xl bg-card border border-border flex items-center justify-center overflow-hidden">
        {videoOff ? (
          <VideoOff className="w-6 h-6 text-muted-foreground" />
        ) : (
          <span className="text-xs text-muted-foreground">Your camera</span>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-10 left-0 right-0 flex items-center justify-center gap-5">
        <button onClick={() => setMuted(!muted)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${muted ? "bg-destructive/20 text-destructive" : "bg-card text-foreground border border-border"}`}>
          {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
        <button onClick={() => setVideoOff(!videoOff)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${videoOff ? "bg-destructive/20 text-destructive" : "bg-card text-foreground border border-border"}`}>
          {videoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </button>
        <button onClick={() => navigate(-1)} className="w-14 h-14 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
          <PhoneOff className="w-6 h-6" />
        </button>
        <button className="w-12 h-12 rounded-full bg-card text-foreground border border-border flex items-center justify-center">
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default VideoCall;
