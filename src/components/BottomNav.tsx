import { Link, useLocation } from "react-router-dom";
import { MessageCircle, Users, Sparkles, Globe, Shield, Settings } from "lucide-react";

const navItems = [
  { path: "/", icon: MessageCircle, label: "Chats" },
  { path: "/contacts", icon: Users, label: "Contacts" },
  { path: "/ai-chat", icon: Sparkles, label: "AI" },
  { path: "/random", icon: Globe, label: "Random" },
  { path: "/sos", icon: Shield, label: "SOS" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

const BottomNav = () => {
  const location = useLocation();
  if (location.pathname === "/login" || location.pathname.startsWith("/chat/") || location.pathname === "/ai-chat") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass safe-bottom border-t border-border/50">
      <div className="flex items-center justify-around max-w-lg mx-auto h-16">
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 relative ${
                active
                  ? "text-primary scale-105"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {active && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full bg-primary" />
              )}
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
              <span className={`text-[10px] font-medium ${active ? "font-semibold" : ""}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
