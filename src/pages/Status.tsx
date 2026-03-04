import { useState, useEffect, useRef } from "react";
import { Plus, X, Type, Image as ImageIcon, Camera } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface StatusItem {
  id: string;
  user_id: string;
  content_type: string;
  text_content: string | null;
  image_url: string | null;
  background_color: string;
  created_at: string;
  display_name?: string;
  avatar_url?: string | null;
}

const BG_COLORS = ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const Status = () => {
  const { user } = useAuth();
  const [statuses, setStatuses] = useState<StatusItem[]>([]);
  const [myStatuses, setMyStatuses] = useState<StatusItem[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [createType, setCreateType] = useState<"text" | "image">("text");
  const [textContent, setTextContent] = useState("");
  const [bgColor, setBgColor] = useState(BG_COLORS[0]);
  const [viewingStatus, setViewingStatus] = useState<StatusItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadStatuses = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_statuses")
      .select("*")
      .order("created_at", { ascending: false });

    if (!data) return;

    // Get unique user IDs and fetch profiles
    const userIds = [...new Set(data.map((s: any) => s.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url")
      .in("user_id", userIds);

    const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);
    const enriched: StatusItem[] = data.map((s: any) => ({
      ...s,
      display_name: profileMap.get(s.user_id)?.display_name || "Unknown",
      avatar_url: profileMap.get(s.user_id)?.avatar_url,
    }));

    setMyStatuses(enriched.filter((s) => s.user_id === user.id));
    setStatuses(enriched.filter((s) => s.user_id !== user.id));
  };

  useEffect(() => {
    loadStatuses();
  }, [user]);

  const postTextStatus = async () => {
    if (!user || !textContent.trim()) return;
    await supabase.from("user_statuses").insert({
      user_id: user.id,
      content_type: "text",
      text_content: textContent.trim(),
      background_color: bgColor,
    });
    setTextContent("");
    setShowCreate(false);
    loadStatuses();
    toast({ title: "Status posted!" });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Max 5MB", variant: "destructive" });
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("statuses").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("statuses").getPublicUrl(path);
    await supabase.from("user_statuses").insert({
      user_id: user.id,
      content_type: "image",
      image_url: urlData.publicUrl,
    });
    setUploading(false);
    setShowCreate(false);
    loadStatuses();
    toast({ title: "Status posted!" });
    e.target.value = "";
  };

  const deleteStatus = async (id: string) => {
    await supabase.from("user_statuses").delete().eq("id", id);
    setViewingStatus(null);
    loadStatuses();
    toast({ title: "Status deleted" });
  };

  // Group other users' statuses by user
  const groupedStatuses = statuses.reduce<Record<string, StatusItem[]>>((acc, s) => {
    if (!acc[s.user_id]) acc[s.user_id] = [];
    acc[s.user_id].push(s);
    return acc;
  }, {});

  // Full-screen status viewer
  if (viewingStatus) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => setViewingStatus(null)} className="text-white">
            <X className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <p className="text-white text-sm font-semibold">{viewingStatus.display_name}</p>
            <p className="text-white/60 text-xs">
              {formatDistanceToNow(new Date(viewingStatus.created_at), { addSuffix: true })}
            </p>
          </div>
          {viewingStatus.user_id === user?.id && (
            <button onClick={() => deleteStatus(viewingStatus.id)} className="text-destructive text-xs font-medium">
              Delete
            </button>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          {viewingStatus.content_type === "image" && viewingStatus.image_url ? (
            <img src={viewingStatus.image_url} alt="Status" className="max-w-full max-h-full object-contain rounded-xl" />
          ) : (
            <div
              className="w-full max-w-sm aspect-square rounded-2xl flex items-center justify-center p-8"
              style={{ backgroundColor: viewingStatus.background_color }}
            >
              <p className="text-white text-xl font-bold text-center leading-relaxed">
                {viewingStatus.text_content}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Create status screen
  if (showCreate) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <button onClick={() => setShowCreate(false)}>
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-base font-semibold flex-1">Create Status</h2>
        </div>

        {createType === "text" ? (
          <div className="flex-1 flex flex-col">
            <div
              className="flex-1 flex items-center justify-center p-8"
              style={{ backgroundColor: bgColor }}
            >
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Type a status..."
                className="bg-transparent text-white text-xl font-bold text-center w-full resize-none outline-none placeholder:text-white/50"
                rows={4}
                maxLength={200}
              />
            </div>
            <div className="p-4 space-y-3">
              <div className="flex gap-2 justify-center">
                {BG_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setBgColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${bgColor === c ? "border-foreground scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setCreateType("image"); fileRef.current?.click(); }}
                  className="flex-1 py-2.5 bg-secondary text-secondary-foreground rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                >
                  <ImageIcon className="w-4 h-4" /> Image Instead
                </button>
                <button
                  onClick={postTextStatus}
                  disabled={!textContent.trim()}
                  className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium disabled:opacity-40"
                >
                  Post Status
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            {uploading ? (
              <p className="text-muted-foreground text-sm animate-pulse">Uploading...</p>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="flex flex-col items-center gap-3 text-muted-foreground"
              >
                <ImageIcon className="w-16 h-16 opacity-30" />
                <p className="text-sm">Tap to select an image</p>
              </button>
            )}
          </div>
        )}

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 glass px-4 py-4 border-b border-border/50">
        <h1 className="text-lg font-bold">Status</h1>
        <p className="text-xs text-muted-foreground">Share moments that disappear in 24 hours</p>
      </div>

      {/* My Status */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center cursor-pointer ${
                myStatuses.length > 0
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  : "bg-secondary"
              }`}
              onClick={() => myStatuses.length > 0 ? setViewingStatus(myStatuses[0]) : setShowCreate(true)}
            >
              <Avatar className="w-full h-full">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {user?.email?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">My Status</p>
            <p className="text-xs text-muted-foreground">
              {myStatuses.length > 0
                ? `${myStatuses.length} update${myStatuses.length > 1 ? "s" : ""} · Tap to view`
                : "Tap to add status update"}
            </p>
          </div>
        </div>
      </div>

      {/* Other statuses */}
      {Object.keys(groupedStatuses).length > 0 && (
        <div className="px-4">
          <p className="text-xs text-muted-foreground font-medium mb-2 mt-2">Recent updates</p>
          <div className="space-y-1">
            {Object.entries(groupedStatuses).map(([userId, items]) => {
              const latest = items[0];
              return (
                <button
                  key={userId}
                  onClick={() => setViewingStatus(latest)}
                  className="flex items-center gap-3 w-full py-2.5 hover:bg-secondary/50 rounded-xl px-2 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-background overflow-hidden">
                    <Avatar className="w-full h-full">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                        {latest.display_name?.[0]?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold">{latest.display_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(latest.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {Object.keys(groupedStatuses).length === 0 && myStatuses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Camera className="w-12 h-12 opacity-20 mb-3" />
          <p className="text-sm font-medium">No status updates yet</p>
          <p className="text-xs">Be the first to share something!</p>
        </div>
      )}
    </div>
  );
};

export default Status;
