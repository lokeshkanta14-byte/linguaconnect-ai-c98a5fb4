import { useState, useEffect } from "react";
import { ArrowLeft, Search, UserPlus, Check, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFriends } from "@/hooks/useFriends";

interface UserResult {
  user_id: string;
  display_name: string;
  preferred_language: string;
  avatar_url: string | null;
}

const FindUsers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { friends, pendingSent, sendRequest } = useFriends();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const friendIds = new Set(friends.map((f) => f.user_id));
  const pendingIds = new Set(pendingSent.map((r) => r.receiver_id));

  const loadUsers = async (search?: string) => {
    if (!user) return;
    setSearching(true);
    let q = supabase
      .from("profiles")
      .select("user_id, display_name, preferred_language, avatar_url")
      .neq("user_id", user.id)
      .limit(50);
    if (search?.trim()) {
      q = q.ilike("display_name", `%${search.trim()}%`);
    }
    const { data } = await q;
    setResults(data || []);
    setSearching(false);
    setLoaded(true);
  };

  useEffect(() => { loadUsers(); }, [user]);

  const handleSearch = () => loadUsers(query);

  const getStatus = (userId: string) => {
    if (friendIds.has(userId)) return "friend";
    if (pendingIds.has(userId)) return "pending";
    return "none";
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-secondary rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold font-display">Find Users</h1>
      </div>

      <div className="px-4 pt-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search by name..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={searching}
            className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Search
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-1">
        {searching && <p className="text-sm text-muted-foreground text-center py-8">Searching...</p>}
        {!searching && results.length === 0 && loaded && (
          <p className="text-sm text-muted-foreground text-center py-8">No users found</p>
        )}
        {results.map((u) => {
          const initials = u.display_name.split(" ").map((n) => n[0]).join("").slice(0, 2);
          const status = getStatus(u.user_id);
          return (
            <div key={u.user_id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary/50 transition-colors">
              <Avatar className="w-11 h-11">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm font-display">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{u.display_name}</p>
                <p className="text-xs text-muted-foreground">{u.preferred_language}</p>
              </div>
              {status === "friend" && (
                <span className="flex items-center gap-1 text-xs text-primary font-medium">
                  <Check className="w-3.5 h-3.5" /> Friends
                </span>
              )}
              {status === "pending" && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                  <Clock className="w-3.5 h-3.5" /> Pending
                </span>
              )}
              {status === "none" && (
                <button
                  onClick={() => sendRequest(u.user_id)}
                  className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Add
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FindUsers;
