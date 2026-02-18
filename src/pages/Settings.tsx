import { useNavigate } from "react-router-dom";
import { User, Globe, Bell, Shield, Palette, LogOut, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

const settingsGroups = [
  {
    title: "Account",
    items: [
      { icon: User, label: "Profile", path: "/profile" },
      { icon: Globe, label: "Language", desc: "English" },
      { icon: Bell, label: "Notifications", desc: "On" },
    ],
  },
  {
    title: "App",
    items: [
      { icon: Palette, label: "Appearance", desc: "System" },
      { icon: Shield, label: "Privacy & Security" },
    ],
  },
];

const Settings = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "User";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-30 glass px-4 pt-4 pb-3">
        <h1 className="text-xl font-bold font-display">Settings</h1>
      </div>

      <button
        onClick={() => navigate("/profile")}
        className="flex items-center gap-3 px-4 py-4 w-full hover:bg-secondary/50 transition-colors"
      >
        <Avatar className="w-14 h-14">
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg font-display">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 text-left">
          <p className="font-semibold">{displayName}</p>
          <p className="text-sm text-muted-foreground">{user?.email || ""}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </button>

      <div className="h-2 bg-secondary/50" />

      {settingsGroups.map((group) => (
        <div key={group.title}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 pt-4 pb-2">
            {group.title}
          </p>
          {group.items.map((item) => (
            <button
              key={item.label}
              onClick={() => item.path && navigate(item.path)}
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
          <div className="h-2 bg-secondary/50" />
        </div>
      ))}

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 w-full hover:bg-secondary/50 transition-colors mt-2"
      >
        <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center">
          <LogOut className="w-4 h-4 text-destructive" />
        </div>
        <p className="text-sm font-medium text-destructive">Log Out</p>
      </button>
    </div>
  );
};

export default Settings;
