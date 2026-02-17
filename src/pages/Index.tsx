import { useState } from "react";
import { Search, Plus } from "lucide-react";
import ContactCard from "@/components/ContactCard";

const mockChats = [
  { id: "1", name: "Priya Sharma", lastMessage: "నేను బాగున్నాను, మీరు?", time: "2:30 PM", unread: 3, online: true, language: "TE" },
  { id: "2", name: "Rahul Verma", lastMessage: "Let's meet tomorrow at 5", time: "1:15 PM", online: true, language: "EN" },
  { id: "3", name: "Ananya Reddy", lastMessage: "मैं कल आऊंगी", time: "12:00 PM", unread: 1, language: "HI" },
  { id: "4", name: "Vikram Patel", lastMessage: "The project is almost done", time: "11:30 AM", language: "EN" },
  { id: "5", name: "Lakshmi Devi", lastMessage: "రేపు కలుద్దాం", time: "Yesterday", online: true, language: "TE" },
  { id: "6", name: "Arjun Kumar", lastMessage: "Photos sent 📷", time: "Yesterday", language: "EN" },
  { id: "7", name: "Meera Iyer", lastMessage: "ठीक है, धन्यवाद!", time: "Mon", language: "HI" },
];

const Index = () => {
  const [search, setSearch] = useState("");

  const filtered = mockChats.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 glass px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold font-display text-gradient">LinguaConnect</h1>
          <button className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
          />
        </div>
      </div>

      {/* Language filter chips */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
        {["All", "English", "Telugu", "Hindi"].map((lang) => (
          <button
            key={lang}
            className="px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors first:bg-primary first:text-primary-foreground"
          >
            {lang}
          </button>
        ))}
      </div>

      {/* Chat list */}
      <div className="divide-y divide-border">
        {filtered.map((chat) => (
          <ContactCard key={chat.id} {...chat} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Search className="w-10 h-10 mb-3 opacity-40" />
          <p className="text-sm">No conversations found</p>
        </div>
      )}
    </div>
  );
};

export default Index;
