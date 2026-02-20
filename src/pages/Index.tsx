import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useFriends, FriendProfile } from "@/hooks/useFriends";

const Index = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { friends, pendingReceived, loading } = useFriends();

  const filtered = friends.filter((f) =>
    f.display_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 glass px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold font-display text-gradient">LinguaConnect</h1>
          <button
            onClick={() => navigate("/find-users")}
            className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
          >
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

      <div className="h-2" />

      {/* Pending requests badge */}
      {pendingReceived.length > 0 && (
        <Link
          to="/contacts"
          className="mx-4 mb-2 flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20"
        >
          <span className="bg-primary text-primary-foreground text-xs font-bold min-w-[22px] h-[22px] flex items-center justify-center rounded-full">
            {pendingReceived.length}
          </span>
          <span className="text-sm font-medium">Pending friend requests</span>
        </Link>
      )}

      {/* Chat list from friends */}
      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-16">Loading...</p>
      ) : (
        <div className="divide-y divide-border">
          {filtered.map((friend) => (
            <FriendChatRow key={friend.user_id} friend={friend} />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Search className="w-10 h-10 mb-3 opacity-40" />
          <p className="text-sm">{friends.length === 0 ? "Add friends to start chatting" : "No conversations found"}</p>
        </div>
      )}
    </div>
  );
};

const FriendChatRow = ({ friend }: { friend: FriendProfile }) => {
  const initials = friend.display_name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  return (
    <Link
      to={`/chat/${friend.user_id}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors duration-150 animate-fade-in"
    >
      <Avatar className="w-12 h-12">
        <AvatarFallback className="bg-primary/10 text-primary font-semibold font-display">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm truncate">{friend.display_name}</h3>
        <p className="text-xs text-muted-foreground truncate">Prefers {friend.preferred_language}</p>
      </div>
    </Link>
  );
};

export default Index;
