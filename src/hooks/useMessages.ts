import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Message {
  id: string;
  message: string;
  time: string;
  sent: boolean;
  translated?: string;
  language?: string;
  audioUrl?: string;
  imageUrl?: string;
  deleted?: boolean;
  deletedForEveryone?: boolean;
}

export function useMessages(recipientId: string | undefined) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, []);

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const mapRow = useCallback(
    (row: any): Message => ({
      id: row.id,
      message: row.message || "",
      time: formatTime(row.created_at),
      sent: row.sender_id === user?.id,
      translated: row.translated ?? undefined,
      language: row.language ?? undefined,
      audioUrl: row.audio_url ?? undefined,
      imageUrl: row.image_url ?? undefined,
      deletedForEveryone: row.deleted_for_everyone || false,
    }),
    [user?.id]
  );

  // Load existing messages
  useEffect(() => {
    if (!user || !recipientId) return;
    const conversationId = [user.id, recipientId].sort().join("_");
    console.log("Conversation ID:", conversationId);
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${recipientId}),and(sender_id.eq.${recipientId},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true });
      const mapped = (data || []).map(mapRow);
      console.log("Messages count:", mapped.length);
      setMessages(mapped);
      setLoading(false);
      scrollToBottom();
    };
    load();
  }, [user, recipientId, mapRow, scrollToBottom]);

  // Realtime subscription
  useEffect(() => {
    if (!user || !recipientId) return;

    const channel = supabase
      .channel(`chat-${[user.id, recipientId].sort().join("-")}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const row = payload.new as any;
          // Only add if relevant to this conversation
          if (
            (row.sender_id === user.id && row.receiver_id === recipientId) ||
            (row.sender_id === recipientId && row.receiver_id === user.id)
          ) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === row.id)) return prev;
              return [...prev, mapRow(row)];
            });
            scrollToBottom();
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const row = payload.new as any;
          setMessages((prev) =>
            prev.map((m) => (m.id === row.id ? mapRow(row) : m))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, recipientId, mapRow, scrollToBottom]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!user || !recipientId) return;
      await supabase.from("messages").insert({
        sender_id: user.id,
        receiver_id: recipientId,
        message: text,
      });
      // Translation (fire-and-forget)
      try {
        const { data } = await supabase.functions.invoke("translate", {
          body: { text, targetLanguage: "English" },
        });
        if (data?.translated && data.translated.trim().toLowerCase() !== text.trim().toLowerCase()) {
          // Find the just-inserted message and update
          const { data: msgs } = await supabase
            .from("messages")
            .select("id")
            .eq("sender_id", user.id)
            .eq("receiver_id", recipientId)
            .eq("message", text)
            .order("created_at", { ascending: false })
            .limit(1);
          if (msgs?.[0]) {
            await supabase
              .from("messages")
              .update({ translated: data.translated, language: "English" })
              .eq("id", msgs[0].id);
          }
        }
      } catch {}
    },
    [user, recipientId]
  );

  const sendAudio = useCallback(
    async (audioUrl: string) => {
      if (!user || !recipientId) return;
      await supabase.from("messages").insert({
        sender_id: user.id,
        receiver_id: recipientId,
        audio_url: audioUrl,
      });
    },
    [user, recipientId]
  );

  const sendImage = useCallback(
    async (imageUrl: string) => {
      if (!user || !recipientId) return;
      await supabase.from("messages").insert({
        sender_id: user.id,
        receiver_id: recipientId,
        image_url: imageUrl,
      });
    },
    [user, recipientId]
  );

  const sendLocation = useCallback(async () => {
    if (!user || !recipientId) return;
    if (!navigator.geolocation) return;
    return new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          await supabase.from("messages").insert({
            sender_id: user.id,
            receiver_id: recipientId,
            message: `📍 Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          });
          resolve();
        },
        () => resolve()
      );
    });
  }, [user, recipientId]);

  const deleteForMe = useCallback(
    (msgId: string) => {
      setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, deleted: true } : m)));
    },
    []
  );

  const deleteForEveryone = useCallback(
    async (msgId: string) => {
      await supabase.from("messages").update({ deleted_for_everyone: true }).eq("id", msgId);
    },
    []
  );

  return {
    messages,
    loading,
    bottomRef,
    sendMessage,
    sendAudio,
    sendImage,
    sendLocation,
    deleteForMe,
    deleteForEveryone,
  };
}
