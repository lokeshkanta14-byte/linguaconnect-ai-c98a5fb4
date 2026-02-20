import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface FriendProfile {
  user_id: string;
  display_name: string;
  preferred_language: string;
  avatar_url: string | null;
  bio: string | null;
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  sender?: FriendProfile;
  receiver?: FriendProfile;
}

export function useFriends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [pendingReceived, setPendingReceived] = useState<FriendRequest[]>([]);
  const [pendingSent, setPendingSent] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriends = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Fetch accepted friend requests
    const { data: requests } = await supabase
      .from("friend_requests")
      .select("*")
      .eq("status", "accepted")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

    if (requests && requests.length > 0) {
      const friendIds = requests.map((r) =>
        r.sender_id === user.id ? r.receiver_id : r.sender_id
      );
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, preferred_language, avatar_url, bio")
        .in("user_id", friendIds);
      setFriends(profiles || []);
    } else {
      setFriends([]);
    }

    // Fetch pending received
    const { data: received } = await supabase
      .from("friend_requests")
      .select("*")
      .eq("receiver_id", user.id)
      .eq("status", "pending");

    if (received && received.length > 0) {
      const senderIds = received.map((r) => r.sender_id);
      const { data: senderProfiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, preferred_language, avatar_url, bio")
        .in("user_id", senderIds);
      const profileMap = new Map(senderProfiles?.map((p) => [p.user_id, p]) || []);
      setPendingReceived(
        received.map((r) => ({ ...r, sender: profileMap.get(r.sender_id) }))
      );
    } else {
      setPendingReceived([]);
    }

    // Fetch pending sent
    const { data: sent } = await supabase
      .from("friend_requests")
      .select("*")
      .eq("sender_id", user.id)
      .eq("status", "pending");
    setPendingSent(sent || []);

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const sendRequest = async (receiverId: string) => {
    if (!user) return;
    const { error } = await supabase.from("friend_requests").insert({
      sender_id: user.id,
      receiver_id: receiverId,
    });
    if (error) {
      if (error.code === "23505") {
        toast({ title: "Friend request already sent", variant: "destructive" });
      } else {
        toast({ title: error.message, variant: "destructive" });
      }
      return;
    }
    toast({ title: "Friend request sent!" });
    fetchFriends();
  };

  const acceptRequest = async (requestId: string) => {
    const { error } = await supabase
      .from("friend_requests")
      .update({ status: "accepted" })
      .eq("id", requestId);
    if (error) {
      toast({ title: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Friend request accepted!" });
    fetchFriends();
  };

  const rejectRequest = async (requestId: string) => {
    const { error } = await supabase
      .from("friend_requests")
      .update({ status: "rejected" })
      .eq("id", requestId);
    if (error) {
      toast({ title: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Friend request rejected" });
    fetchFriends();
  };

  return {
    friends,
    pendingReceived,
    pendingSent,
    loading,
    sendRequest,
    acceptRequest,
    rejectRequest,
    refresh: fetchFriends,
  };
}
