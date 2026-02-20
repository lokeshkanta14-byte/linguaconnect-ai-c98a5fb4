import { Search, UserPlus, Check, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useFriends, FriendProfile, FriendRequest } from "@/hooks/useFriends";

const Contacts = () => {
  const navigate = useNavigate();
  const { friends, pendingReceived, loading, acceptRequest, rejectRequest } = useFriends();
  const [search, setSearch] = useState("");

  const filtered = friends.filter((f) =>
    f.display_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-30 glass px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold font-display">Contacts</h1>
          <button
            onClick={() => navigate("/find-users")}
            className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
          >
            <UserPlus className="w-5 h-5" />
          </button>
        </div>
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

      {/* Pending friend requests */}
      {pendingReceived.length > 0 && (
        <div className="px-4 pt-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Friend Requests — {pendingReceived.length}
          </p>
          <div className="space-y-1">
            {pendingReceived.map((req) => (
              <RequestRow key={req.id} request={req} onAccept={acceptRequest} onReject={rejectRequest} />
            ))}
          </div>
        </div>
      )}

      {/* Friends list */}
      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-12">Loading contacts...</p>
      ) : filtered.length > 0 ? (
        <div className="px-4 pt-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Friends — {filtered.length}
          </p>
          <div className="space-y-1">
            {filtered.map((f) => (
              <FriendRow key={f.user_id} friend={f} />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <UserPlus className="w-10 h-10 mb-3 opacity-40" />
          <p className="text-sm">No contacts yet</p>
          <button
            onClick={() => navigate("/find-users")}
            className="mt-3 text-sm text-primary font-semibold hover:underline"
          >
            Find users to connect
          </button>
        </div>
      )}
    </div>
  );
};

const FriendRow = ({ friend }: { friend: FriendProfile }) => {
  const initials = friend.display_name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  return (
    <Link
      to={`/chat/${friend.user_id}`}
      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary/50 transition-colors animate-fade-in"
    >
      <Avatar className="w-11 h-11">
        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm font-display">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="text-sm font-semibold">{friend.display_name}</p>
        <p className="text-xs text-muted-foreground">Prefers {friend.preferred_language}</p>
      </div>
    </Link>
  );
};

const RequestRow = ({
  request,
  onAccept,
  onReject,
}: {
  request: FriendRequest;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}) => {
  const name = request.sender?.display_name || "Unknown";
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/30 animate-fade-in">
      <Avatar className="w-11 h-11">
        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm font-display">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{name}</p>
        <p className="text-xs text-muted-foreground">Wants to connect</p>
      </div>
      <div className="flex gap-1.5">
        <button
          onClick={() => onAccept(request.id)}
          className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={() => onReject(request.id)}
          className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Contacts;
