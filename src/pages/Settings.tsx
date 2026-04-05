import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { User, Globe, Bell, Shield, LogOut, ChevronRight, Moon, Sun, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { LANGUAGES, findLanguage, langLabel } from "@/lib/languages";

const Settings = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("English");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("preferred_language").eq("user_id", user.id).single()
      .then(({ data }) => { if (data?.preferred_language) setCurrentLang(data.preferred_language); });
  }, [user]);

  const filteredLangs = useMemo(() => {
    if (!search.trim()) return LANGUAGES;
    const q = search.toLowerCase();
    return LANGUAGES.filter(
      (l) => l.name.toLowerCase().includes(q) || l.native.toLowerCase().includes(q) || l.code.toLowerCase().includes(q)
    );
  }, [search]);

  const selectLanguage = async (langName: string) => {
    setCurrentLang(langName);
    setLangOpen(false);
    setSearch("");
    if (user) {
      const { error } = await supabase.from("profiles").update({ preferred_language: langName }).eq("user_id", user.id);
      if (error) toast({ title: "Failed to update language", variant: "destructive" });
      else toast({ title: `Language set to ${langName}` });
    }
  };

  const currentLangObj = findLanguage(currentLang);
  const displayLang = currentLangObj ? langLabel(currentLangObj) : currentLang;

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

      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 pt-4 pb-2">Account</p>
      {[
        { icon: User, label: "Profile", path: "/profile" },
        { icon: Globe, label: "Language", desc: displayLang, action: () => setLangOpen(true) },
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

      {/* Language picker dialog */}
      <Dialog open={langOpen} onOpenChange={(open) => { setLangOpen(open); if (!open) setSearch(""); }}>
        <DialogContent className="max-w-xs rounded-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Select Language</DialogTitle>
          </DialogHeader>
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search languages..."
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all text-secondary-foreground placeholder:text-muted-foreground"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-0.5 overflow-y-auto max-h-[50vh] -mx-1 px-1">
            {filteredLangs.map((lang) => (
              <button
                key={lang.code}
                onClick={() => selectLanguage(lang.name)}
                className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${
                  currentLang === lang.name ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                }`}
              >
                <span>{langLabel(lang)}</span>
                {currentLang === lang.name && <span className="text-xs">✓</span>}
              </button>
            ))}
            {filteredLangs.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No languages found</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
