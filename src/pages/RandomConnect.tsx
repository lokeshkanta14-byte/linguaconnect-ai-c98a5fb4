import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Globe, Zap, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const RandomConnect = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searching, setSearching] = useState(false);

  const startRandomChat = async () => {
    if (!user) return;
    setSearching(true);

    try {
      // Simulate a 2-3 second search delay
      await new Promise((r) => setTimeout(r, 2000 + Math.random() * 1000));

      // Create a deterministic "stranger" profile ID for the simulated match
      const strangerId = "00000000-0000-0000-0000-000000000000";

      // Ensure the stranger profile exists (upsert)
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(
          {
            user_id: strangerId,
            display_name: "Stranger",
            preferred_language: "English",
          },
          { onConflict: "user_id" }
        );

      if (profileError) {
        console.error("Profile upsert error:", profileError);
      }

      // Navigate to chat with the stranger ID
      navigate(`/chat/${strangerId}`);
    } catch (e) {
      console.error(e);
      toast({ title: "Could not connect, try again.", variant: "destructive" });
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 glass px-4 py-4 border-b border-border/50">
        <h1 className="text-lg font-bold">Random Connect</h1>
        <p className="text-xs text-muted-foreground">Meet someone new across the world</p>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24 gap-8">
        <div className="relative">
          <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center">
            <Globe className="w-14 h-14 text-primary" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-accent flex items-center justify-center">
            <Zap className="w-5 h-5 text-accent-foreground" />
          </div>
        </div>

        <div className="text-center space-y-2 max-w-xs">
          <h2 className="text-xl font-bold">Connect with Someone New</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Start a conversation with a random person. Language barriers? We'll translate everything automatically.
          </p>
        </div>

        <button
          onClick={startRandomChat}
          disabled={searching}
          className="flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-semibold text-base shadow-lg hover:opacity-90 transition-all disabled:opacity-60 active:scale-95"
        >
          {searching ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Searching for someone...
            </>
          ) : (
            <>
              Start Random Chat
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {["🔒 Private", "🌍 Any Language", "💬 Real-time Translation"].map((tag) => (
            <span key={tag} className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RandomConnect;
