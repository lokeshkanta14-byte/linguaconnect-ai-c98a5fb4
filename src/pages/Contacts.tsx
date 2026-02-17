import { Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { useState } from "react";

const contacts = [
  { id: "1", name: "Priya Sharma", language: "Telugu", online: true },
  { id: "2", name: "Rahul Verma", language: "English", online: true },
  { id: "3", name: "Ananya Reddy", language: "Hindi", online: false },
  { id: "4", name: "Vikram Patel", language: "English", online: false },
  { id: "5", name: "Lakshmi Devi", language: "Telugu", online: true },
  { id: "6", name: "Arjun Kumar", language: "English", online: false },
  { id: "7", name: "Meera Iyer", language: "Hindi", online: false },
  { id: "8", name: "Sanjay Rao", language: "Telugu", online: true },
  { id: "9", name: "Deepa Nair", language: "Hindi", online: false },
];

const Contacts = () => {
  const [search, setSearch] = useState("");
  const filtered = contacts.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  const onlineContacts = filtered.filter(c => c.online);
  const offlineContacts = filtered.filter(c => !c.online);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-30 glass px-4 pt-4 pb-3">
        <h1 className="text-xl font-bold font-display mb-3">Contacts</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
          />
        </div>
      </div>

      {onlineContacts.length > 0 && (
        <div className="px-4 pt-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Online — {onlineContacts.length}</p>
          <div className="space-y-1">
            {onlineContacts.map(c => (
              <ContactRow key={c.id} {...c} />
            ))}
          </div>
        </div>
      )}

      {offlineContacts.length > 0 && (
        <div className="px-4 pt-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Offline — {offlineContacts.length}</p>
          <div className="space-y-1">
            {offlineContacts.map(c => (
              <ContactRow key={c.id} {...c} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ContactRow = ({ id, name, language, online }: { id: string; name: string; language: string; online: boolean }) => {
  const initials = name.split(" ").map(n => n[0]).join("");
  return (
    <Link
      to={`/chat/${id}`}
      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary/50 transition-colors animate-fade-in"
    >
      <div className="relative">
        <Avatar className="w-11 h-11">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm font-display">{initials}</AvatarFallback>
        </Avatar>
        {online && <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-online border-2 border-background" />}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold">{name}</p>
        <p className="text-xs text-muted-foreground">Prefers {language}</p>
      </div>
    </Link>
  );
};

export default Contacts;
