import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Globe, Bell, Shield, Palette, LogOut, ChevronRight, Moon, Sun } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const LANGUAGES = ["English", "Telugu (తెలుగు)", "Hindi (हिन्दी)", "Tamil (தமிழ்)"];

const Settings = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("English");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("preferred_language").eq("user_id", user.id).single()
      .then(({ data }) => { if (data?.preferred_language) setCurrentLang(data.preferred_language); });
  }, [user]);

  const selectLanguage = async (lang: string) => {
    setCurrentLang(lang);
    setLangOpen(false);
    if (user) {
      const { error } = await supabase.from("profiles").update({ preferred_language: lang }).eq("user_id", user.id);
      if (error) toast({ title: "Failed to update language", variant: "destructive" });
      else toast({ title: `Language set to ${lang}` });
    }
  };

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "User";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-30 glass px-4 pt-4 pb-3 border-b border-border/50">
        <h1 className="text-xl font-bold font-display">Settings</h1>
      </div>

      <button
        onClick={() => navigate("/profile")}
        className="flex items-center gap-3 px-4 py-4 w-full hover:bg-secondary/50 transition-colors"
      >
        <Avatar className="w-14 h-14 ring-2 ring-primary/20">
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg font-display">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 text-left">
          <p className="font-semibold">{displayName}</p>
          <p className="text-sm text-muted-foreground">{user?.email || ""}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </button>

      <div className="h-2 bg-secondary/30" />

      {/* Account */}
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 pt-4 pb-2">Account</p>
      {[
        { icon: User, label: "Profile", path: "/profile" },
        { icon: Globe, label: "Language", desc: currentLang, action: () => setLangOpen(true) },
        { icon: Bell, label: "Notifications", desc: "On" },
      ].map((item) => (
        <button
          key={item.label}
          onClick={() => item.path ? navigate(item.path) : item.action?.()}
          className="flex items-center gap-3 px-4 py-3 w-full hover:bg-secondary/50 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
            <item.icon className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium">{item.label}</p>
          </div>
          {item.desc && <span className="text-xs text-muted-foreground">{item.desc}</span>}
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      ))}
      <div className="h-2 bg-secondary/30" />

      {/* App */}
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 pt-4 pb-2">App</p>
      <button
        onClick={toggle}
        className="flex items-center gap-3 px-4 py-3 w-full hover:bg-secondary/50 transition-colors"
      >
        <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
          {theme === "dark" ? <Moon className="w-4 h-4 text-muted-foreground" /> : <Sun className="w-4 h-4 text-muted-foreground" />}
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium">Appearance</p>
        </div>
        <span className="text-xs text-muted-foreground capitalize">{theme}</span>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </button>
      <button className="flex items-center gap-3 px-4 py-3 w-full hover:bg-secondary/50 transition-colors">
        <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
          <Shield className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium">Privacy & Security</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </button>
      <div className="h-2 bg-secondary/30" />

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 w-full hover:bg-secondary/50 transition-colors mt-2"
      >
        <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center">
          <LogOut className="w-4 h-4 text-destructive" />
        </div>
        <p className="text-sm font-medium text-destructive">Log Out</p>
      </button>
      <Dialog open={langOpen} onOpenChange={setLangOpen}>
        <DialogContent className="max-w-xs rounded-2xl">
          <DialogHeader>
            <DialogTitle>Select Language</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-1">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => selectLanguage(lang)}
                className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  currentLang === lang ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
