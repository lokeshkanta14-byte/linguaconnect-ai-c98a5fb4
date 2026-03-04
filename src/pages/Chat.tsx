import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Video, MoreVertical, ShieldAlert, User, Ban, Flag, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ChatBubble from "@/components/ChatBubble";
import ChatInput from "@/components/ChatInput";
import MessageActions from "@/components/MessageActions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useMessages } from "@/hooks/useMessages";
import { toast } from "@/hooks/use-toast";

const Chat = () => {
  const { id: recipientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [contactName, setContactName] = useState("...");
  const [isFriend, setIsFriend] = useState<boolean | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isRandomChat = recipientId === "00000000-0000-0000-0000-000000000000";

  const {
    messages,
    loading,
    bottomRef,
    sendMessage,
    sendAudio,
    sendImage,
    sendLocation,
    deleteForMe,
    deleteForEveryone,
  } = useMessages(recipientId);

  useEffect(() => {
    if (!recipientId || !user) return;
    const checkFriend = async () => {
      if (isRandomChat) {
        setIsFriend(true);
        return;
      }
      const { data } = await supabase.rpc("are_friends", { user_a: user.id, user_b: recipientId });
      setIsFriend(!!data);
    };
    const fetchName = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", recipientId)
        .single();
      setContactName(data?.display_name || "Unknown");
    };
    const checkBlocked = async () => {
      const { data } = await supabase
        .from("blocked_users")
        .select("id")
        .eq("blocker_id", user.id)
        .eq("blocked_id", recipientId!)
        .maybeSingle();
      setIsBlocked(!!data);
    };
    checkFriend();
    fetchName();
    checkBlocked();
  }, [recipientId, user]);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = contactName.split(" ").map((n) => n[0]).join("").slice(0, 2);
  const selectedMsg = messages.find((m) => m.id === selectedMessageId);

  const handleSendLocation = async () => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocation not supported", variant: "destructive" });
      return;
    }
    await sendLocation();
    toast({ title: "Location shared!" });
  };

  const handleDeleteForMe = (msgId: string) => {
    deleteForMe(msgId);
    setSelectedMessageId(null);
  };

  const handleDeleteForEveryone = async (msgId: string) => {
    await deleteForEveryone(msgId);
    setSelectedMessageId(null);
  };

  const handleBlockUser = async () => {
    if (!user || !recipientId) return;
    setShowMenu(false);
    if (isBlocked) {
      await supabase.from("blocked_users").delete().eq("blocker_id", user.id).eq("blocked_id", recipientId);
      setIsBlocked(false);
      toast({ title: "User unblocked" });
    } else {
      await supabase.from("blocked_users").insert({ blocker_id: user.id, blocked_id: recipientId });
      setIsBlocked(true);
      toast({ title: "User blocked" });
    }
  };

  const handleClearChat = () => {
    setShowMenu(false);
    messages.forEach((m) => deleteForMe(m.id));
    toast({ title: "Chat cleared" });
  };

  const handleReport = () => {
    setShowMenu(false);
    toast({ title: "User reported", description: "Thank you for keeping the community safe." });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 glass px-2 py-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/")} className="p-2 hover:bg-secondary rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Avatar className="w-9 h-9 ring-2 ring-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold font-display">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold truncate">{contactName}</h2>
            <p className="text-[11px] text-online font-medium">Online</p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => navigate(`/voice-call/${recipientId}`)} className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground">
              <Phone className="w-4 h-4" />
            </button>
            <button onClick={() => navigate(`/video-call/${recipientId}`)} className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground">
              <Video className="w-4 h-4" />
            </button>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu((v) => !v)}
                className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 animate-fade-in">
                  <button
                    onClick={() => { setShowMenu(false); navigate(`/profile/${recipientId}`); }}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm hover:bg-secondary transition-colors"
                  >
                    <User className="w-4 h-4" /> View Profile
                  </button>
                  <button
                    onClick={handleBlockUser}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm hover:bg-secondary transition-colors text-destructive"
                  >
                    <Ban className="w-4 h-4" /> {isBlocked ? "Unblock User" : "Block User"}
                  </button>
                  <button
                    onClick={handleReport}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm hover:bg-secondary transition-colors"
                  >
                    <Flag className="w-4 h-4" /> Report User
                  </button>
                  <button
                    onClick={handleClearChat}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm hover:bg-secondary transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Clear Chat
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Blocked notice */}
      {isBlocked && (
        <div className="bg-destructive/10 text-destructive text-xs text-center py-2">
          You have blocked this user. <button onClick={handleBlockUser} className="underline font-medium">Unblock</button>
        </div>
      )}

      {/* Friendship gate */}
      {isFriend === false && (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground px-6">
          <ShieldAlert className="w-12 h-12 mb-3 opacity-40" />
          <p className="text-sm font-medium text-center">You need to be friends to chat</p>
          <p className="text-xs text-center mt-1">Send a friend request from the Contacts tab</p>
        </div>
      )}

      {isFriend !== false && (
        <>
          <div className="flex-1 px-3 py-4 pb-20 overflow-y-auto">
            <div className="text-center mb-4">
              <span className="text-[11px] text-muted-foreground bg-secondary/80 px-3 py-1 rounded-full">Today</span>
            </div>
            {loading && <p className="text-xs text-muted-foreground text-center py-8">Loading messages...</p>}
            {messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                {...msg}
                onLongPress={() => !msg.deleted && !msg.deletedForEveryone && setSelectedMessageId(msg.id)}
              />
            ))}
            <div ref={bottomRef} />
          </div>

          {!isBlocked && (
            <ChatInput
              onSend={sendMessage}
              onSendAudio={sendAudio}
              onSendImage={sendImage}
              onSendLocation={handleSendLocation}
            />
          )}
          {isBlocked && (
            <div className="fixed bottom-0 left-0 right-0 z-40 glass safe-bottom">
              <p className="text-xs text-muted-foreground text-center py-3">You blocked this user. Unblock to send messages.</p>
            </div>
          )}
        </>
      )}

      {selectedMessageId && selectedMsg && (
        <MessageActions
          messageId={selectedMessageId}
          isSent={selectedMsg.sent}
          onDeleteForMe={handleDeleteForMe}
          onDeleteForEveryone={handleDeleteForEveryone}
          onClose={() => setSelectedMessageId(null)}
        />
      )}
    </div>
  );
};

export default Chat;
